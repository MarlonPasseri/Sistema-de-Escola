import { Injectable, NotFoundException } from '@nestjs/common';
import { InterventionStatus } from '@edupulse/types';
import { PrismaService } from '../../database/prisma.service';
import { StudentsService } from '../students/students.service';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { CreateInterventionNoteDto } from './dto/create-intervention-note.dto';
import { ListInterventionsDto } from './dto/list-interventions.dto';
import { UpdateInterventionDto } from './dto/update-intervention.dto';

@Injectable()
export class InterventionsService {
  constructor(
    private prisma: PrismaService,
    private studentsService: StudentsService,
  ) {}

  async list(schoolId: string, dto: ListInterventionsDto) {
    const { page = 1, limit = 20, status, studentId } = dto;
    const skip = (page - 1) * limit;
    const where: any = { schoolId };
    if (status) where.status = status;
    if (studentId) where.studentId = studentId;

    const [data, total] = await Promise.all([
      this.prisma.interventionPlan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: this.include(),
      }),
      this.prisma.interventionPlan.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(schoolId: string, id: string) {
    const intervention = await this.prisma.interventionPlan.findFirst({
      where: { id, schoolId },
      include: this.include(true),
    });
    if (!intervention) throw new NotFoundException('Plano de intervenção não encontrado');
    return intervention;
  }

  async create(schoolId: string, ownerUserId: string, dto: CreateInterventionDto) {
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, schoolId, isActive: true },
    });
    if (!student) throw new NotFoundException('Aluno não encontrado');

    const riskScore = dto.riskScoreId
      ? await this.prisma.riskScore.findFirst({ where: { id: dto.riskScoreId, studentId: dto.studentId } })
      : await this.prisma.riskScore.findFirst({ where: { studentId: dto.studentId }, orderBy: { calculatedAt: 'desc' } });

    const intervention = await this.prisma.interventionPlan.create({
      data: {
        schoolId,
        studentId: dto.studentId,
        riskScoreId: riskScore?.id,
        ownerUserId,
        reason: dto.reason,
        goal: dto.goal,
        reviewDate: new Date(dto.reviewDate),
      },
      include: this.include(true),
    });

    await this.studentsService.addTimelineEvent(
      dto.studentId,
      'INTERVENTION_CREATED',
      `Plano de intervenção aberto: ${dto.reason}`,
      { interventionId: intervention.id },
    );

    return intervention;
  }

  async update(schoolId: string, id: string, dto: UpdateInterventionDto) {
    const current = await this.findById(schoolId, id);
    const status = dto.status;
    const closedAt =
      status === InterventionStatus.RESOLVED || status === InterventionStatus.CANCELLED
        ? new Date()
        : status
          ? null
          : undefined;

    const updated = await this.prisma.interventionPlan.update({
      where: { id },
      data: {
        status,
        reason: dto.reason,
        goal: dto.goal,
        reviewDate: dto.reviewDate ? new Date(dto.reviewDate) : undefined,
        closedAt,
      },
      include: this.include(true),
    });

    if (status && status !== current.status) {
      await this.studentsService.addTimelineEvent(
        current.studentId,
        'INTERVENTION_UPDATED',
        `Plano de intervenção alterado para ${status}`,
        { interventionId: id, status },
      );
    }

    return updated;
  }

  async addNote(schoolId: string, id: string, authorId: string, dto: CreateInterventionNoteDto) {
    const intervention = await this.findById(schoolId, id);
    const note = await this.prisma.interventionNote.create({
      data: { interventionId: id, authorId, content: dto.content },
    });

    await this.studentsService.addTimelineEvent(
      intervention.studentId,
      'INTERVENTION_NOTE_ADDED',
      `Nota adicionada ao plano de intervenção: ${dto.content}`,
      { interventionId: id, noteId: note.id },
    );

    return this.findById(schoolId, id);
  }

  private include(withNotes = false) {
    return {
      student: { select: { id: true, name: true, registrationId: true } },
      riskScore: true,
      owner: { select: { id: true, name: true, email: true } },
      notes: withNotes ? { orderBy: { createdAt: 'desc' as const } } : false,
    };
  }
}
