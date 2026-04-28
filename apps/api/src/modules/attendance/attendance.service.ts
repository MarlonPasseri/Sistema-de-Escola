import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RiskEngineService } from '../student-success/risk-engine.service';
import { StudentsService } from '../students/students.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { RecordAttendanceDto } from './dto/record-attendance.dto';
import { ListSessionsDto } from './dto/list-sessions.dto';

@Injectable()
export class AttendanceService {
  constructor(
    private prisma: PrismaService,
    private riskEngine: RiskEngineService,
    private studentsService: StudentsService,
  ) {}

  // ── Sessions ──────────────────────────────────────────────────────────────

  async createSession(createdByUserId: string, dto: CreateSessionDto) {
    const classSubject = await this.prisma.classSubject.findUnique({
      where: { id: dto.classSubjectId },
      include: {
        class: { select: { id: true, name: true, schoolId: true } },
        subject: { select: { id: true, name: true } },
      },
    });
    if (!classSubject) throw new NotFoundException('Turma/disciplina não encontrada');

    const sessionDate = new Date(dto.date);

    const existing = await this.prisma.attendanceSession.findFirst({
      where: { classSubjectId: dto.classSubjectId, date: sessionDate },
    });
    if (existing) throw new ConflictException('Já existe uma sessão para essa data e turma/disciplina');

    const session = await this.prisma.attendanceSession.create({
      data: { classSubjectId: dto.classSubjectId, date: sessionDate, createdByUserId },
      include: {
        classSubject: {
          include: {
            class: { select: { id: true, name: true } },
            subject: { select: { id: true, name: true } },
          },
        },
        records: true,
      },
    });

    return session;
  }

  async listSessions(schoolId: string, dto: ListSessionsDto) {
    const { page = 1, limit = 20, classSubjectId, from, to } = dto;
    const skip = (page - 1) * limit;

    const where: any = {
      classSubject: { class: { schoolId } },
    };

    if (classSubjectId) where.classSubjectId = classSubjectId;
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    const [sessions, total] = await Promise.all([
      this.prisma.attendanceSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          classSubject: {
            include: {
              class: { select: { id: true, name: true } },
              subject: { select: { id: true, name: true } },
            },
          },
          _count: { select: { records: true } },
        },
      }),
      this.prisma.attendanceSession.count({ where }),
    ]);

    return { data: sessions, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getSession(id: string) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id },
      include: {
        classSubject: {
          include: {
            class: {
              include: {
                enrollments: {
                  where: { isActive: true },
                  include: { student: { select: { id: true, name: true, registrationId: true } } },
                },
              },
            },
            subject: { select: { id: true, name: true } },
          },
        },
        records: {
          include: { student: { select: { id: true, name: true, registrationId: true } } },
        },
      },
    });

    if (!session) throw new NotFoundException('Sessão não encontrada');
    return session;
  }

  // ── Records ───────────────────────────────────────────────────────────────

  async recordAttendance(sessionId: string, userId: string, dto: RecordAttendanceDto) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        classSubject: {
          include: {
            class: {
              select: {
                schoolId: true,
                enrollments: { where: { isActive: true }, select: { studentId: true } },
              },
            },
            subject: { select: { name: true } },
          },
        },
      },
    });

    if (!session) throw new NotFoundException('Sessão não encontrada');

    const enrolledIds = new Set(
      session.classSubject.class.enrollments.map((e) => e.studentId),
    );

    const invalid = dto.records.find((r) => !enrolledIds.has(r.studentId));
    if (invalid) {
      throw new BadRequestException(
        `Aluno ${invalid.studentId} não está matriculado nesta turma`,
      );
    }

    // Upsert all records
    await this.prisma.$transaction(
      dto.records.map((r) =>
        this.prisma.attendanceRecord.upsert({
          where: { sessionId_studentId: { sessionId, studentId: r.studentId } },
          create: { sessionId, studentId: r.studentId, status: r.status, note: r.note },
          update: { status: r.status, note: r.note },
        }),
      ),
    );

    // Add timeline events for absences and recalculate risk
    const absentStudents = dto.records.filter((r) => r.status === 'ABSENT');
    await Promise.all(
      absentStudents.map(async (r) => {
        await this.studentsService.addTimelineEvent(
          r.studentId,
          'ABSENCE_RECORDED',
          `Falta registrada em ${session.classSubject.subject?.name ?? 'aula'} (${new Date(session.date).toLocaleDateString('pt-BR')})`,
          { sessionId, status: r.status },
        );
        // Recalculate risk after absence
        await this.riskEngine.recalculateAndSave(r.studentId);
      }),
    );

    return this.getSession(sessionId);
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  async getStudentAttendanceRate(schoolId: string, studentId: string) {
    const total = await this.prisma.attendanceRecord.count({
      where: {
        studentId,
        session: { classSubject: { class: { schoolId } } },
      },
    });

    const present = await this.prisma.attendanceRecord.count({
      where: {
        studentId,
        status: { in: ['PRESENT', 'LATE', 'JUSTIFIED'] },
        session: { classSubject: { class: { schoolId } } },
      },
    });

    const absences = await this.prisma.attendanceRecord.findMany({
      where: {
        studentId,
        status: 'ABSENT',
        session: { classSubject: { class: { schoolId } } },
      },
      include: {
        session: {
          include: {
            classSubject: { include: { subject: { select: { name: true } } } },
          },
        },
      },
      orderBy: { session: { date: 'desc' } },
      take: 20,
    });

    const rate = total > 0 ? Math.round((present / total) * 100) : 100;

    return { total, present, absent: total - present, rate, recentAbsences: absences };
  }

  async getClassAttendance(classSubjectId: string) {
    const sessions = await this.prisma.attendanceSession.findMany({
      where: { classSubjectId },
      orderBy: { date: 'desc' },
      take: 30,
      include: {
        records: {
          include: { student: { select: { id: true, name: true } } },
        },
      },
    });

    return sessions;
  }
}
