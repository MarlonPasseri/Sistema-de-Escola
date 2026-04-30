import { Injectable, NotFoundException } from '@nestjs/common';
import { RiskLevel } from '@edupulse/types';
import { PrismaService } from '../../database/prisma.service';
import { ListRisksDto } from './dto/list-risks.dto';

const OPEN_INTERVENTION_STATUSES = ['OPEN', 'IN_PROGRESS', 'WAITING_GUARDIAN'] as const;

@Injectable()
export class StudentSuccessService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(schoolId: string) {
    const [studentsTotal, highRiskTotal, mediumRiskTotal, openInterventions, unreadRecipients] =
      await Promise.all([
        this.prisma.student.count({ where: { schoolId, isActive: true } }),
        this.countLatestRiskByLevel(schoolId, 'HIGH'),
        this.countLatestRiskByLevel(schoolId, 'MEDIUM'),
        this.prisma.interventionPlan.count({
          where: { schoolId, status: { in: [...OPEN_INTERVENTION_STATUSES] } },
        }),
        this.prisma.announcementRecipient.count({
          where: { readAt: null, announcement: { schoolId } },
        }),
      ]);

    const topRisks = await this.listRisks(schoolId, { riskLevel: RiskLevel.HIGH, limit: 5 });
    const riskByClass = await this.getRiskByClass(schoolId);

    return {
      studentsTotal,
      highRiskTotal,
      mediumRiskTotal,
      openInterventions,
      unreadRecipients,
      topRisks: topRisks.data,
      riskByClass,
    };
  }

  async listRisks(schoolId: string, dto: ListRisksDto) {
    const { page = 1, limit = 20, classId, riskLevel, search, withoutIntervention, unengagedGuardian } = dto;
    const skip = (page - 1) * limit;

    const where: any = { schoolId, isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { registrationId: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (classId) {
      where.enrollments = { some: { classId, isActive: true } };
    }
    if (withoutIntervention) {
      where.interventionPlans = { none: { status: { in: [...OPEN_INTERVENTION_STATUSES] } } };
    }
    if (unengagedGuardian) {
      where.announcementRecipients = { some: { readAt: null } };
    }

    const students = await this.prisma.student.findMany({
      where,
      include: this.studentRiskInclude(),
      orderBy: { name: 'asc' },
    });

    const filtered = students
      .map((student) => this.decorateRiskStudent(student))
      .filter((student) => student.latestRisk && (!riskLevel || student.latestRisk.level === riskLevel))
      .sort((a, b) => (b.latestRisk?.score ?? 0) - (a.latestRisk?.score ?? 0));

    const data = filtered.slice(skip, skip + limit);
    return { data, total: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit) };
  }

  async getStudentSuccess(schoolId: string, studentId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, schoolId, isActive: true },
      include: {
        ...this.studentRiskInclude(),
        timelineEvents: { orderBy: { createdAt: 'desc' }, take: 20 },
        attendanceRecords: {
          orderBy: { session: { date: 'desc' } },
          take: 20,
          include: { session: { include: { classSubject: { include: { subject: true, class: true } } } } },
        },
        grades: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { assessment: { include: { subject: true, academicTerm: true } } },
        },
        occurrences: { orderBy: { date: 'desc' }, take: 20 },
      },
    });
    if (!student) throw new NotFoundException('Aluno não encontrado');

    return {
      ...this.decorateRiskStudent(student),
      suggestedActions: this.buildSuggestedActions((student.riskScores[0]?.factors as any[]) ?? []),
    };
  }

  buildSuggestedActions(factors: any[]) {
    const actions = new Set<string>();
    for (const factor of factors) {
      if (['RECENT_ABSENCE', 'LOW_ATTENDANCE_15_DAYS'].includes(factor.code)) {
        actions.add('Abrir plano de acompanhamento de frequência');
        actions.add('Enviar comunicado ao responsavel');
      }
      if (['LOW_GRADE', 'GRADE_DROP'].includes(factor.code)) {
        actions.add('Definir plano de recuperacao por disciplina');
        actions.add('Revisar desempenho em 14 dias');
      }
      if (factor.code === 'GUARDIAN_NOT_READING') {
        actions.add('Tentar novo canal de contato com o responsavel');
      }
      if (factor.code === 'DISCIPLINARY_OCCURRENCE') {
        actions.add('Agendar conversa com coordenacao');
      }
    }
    if (actions.size === 0) actions.add('Manter acompanhamento preventivo');
    return Array.from(actions);
  }

  private studentRiskInclude() {
    return {
      enrollments: {
        where: { isActive: true },
        include: { class: { select: { id: true, name: true, grade: true } } },
      },
      guardians: { include: { guardian: { include: { user: { select: { id: true, name: true, email: true, phone: true } } } } } },
      riskScores: { orderBy: { calculatedAt: 'desc' as const }, take: 1 },
      interventionPlans: {
        where: { status: { in: [...OPEN_INTERVENTION_STATUSES] } },
        orderBy: { createdAt: 'desc' as const },
        take: 1,
        include: { owner: { select: { id: true, name: true } } },
      },
      announcementRecipients: { where: { readAt: null }, select: { id: true } },
    };
  }

  private decorateRiskStudent(student: any) {
    const latestRisk = student.riskScores?.[0] ?? null;
    const openIntervention = student.interventionPlans?.[0] ?? null;
    return {
      ...student,
      latestRisk,
      openIntervention,
      suggestedActions: this.buildSuggestedActions(latestRisk?.factors ?? []),
      unreadAnnouncements: student.announcementRecipients?.length ?? 0,
    };
  }

  private async countLatestRiskByLevel(schoolId: string, level: 'LOW' | 'MEDIUM' | 'HIGH') {
    const risks = await this.prisma.riskScore.findMany({
      where: { student: { schoolId, isActive: true } },
      orderBy: { calculatedAt: 'desc' },
      distinct: ['studentId'],
    });
    return risks.filter((risk) => risk.level === level).length;
  }

  private async getRiskByClass(schoolId: string) {
    const classes = await this.prisma.class.findMany({
      where: { schoolId },
      select: { id: true, name: true, enrollments: { where: { isActive: true }, select: { studentId: true } } },
      orderBy: { name: 'asc' },
    });

    const risks = await this.prisma.riskScore.findMany({
      where: { student: { schoolId, isActive: true } },
      orderBy: { calculatedAt: 'desc' },
      distinct: ['studentId'],
    });
    const riskMap = new Map(risks.map((risk) => [risk.studentId, risk]));

    return classes.map((klass) => {
      const classRisks = klass.enrollments.map((enrollment) => riskMap.get(enrollment.studentId)).filter(Boolean);
      return {
        classId: klass.id,
        className: klass.name,
        high: classRisks.filter((risk) => risk?.level === 'HIGH').length,
        medium: classRisks.filter((risk) => risk?.level === 'MEDIUM').length,
        low: classRisks.filter((risk) => risk?.level === 'LOW').length,
      };
    });
  }
}
