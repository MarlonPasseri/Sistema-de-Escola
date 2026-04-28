import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RiskEngineService } from '../student-success/risk-engine.service';
import { StudentsService } from '../students/students.service';
import { CreateOccurrenceDto } from './dto/create-occurrence.dto';
import { ListOccurrencesDto } from './dto/list-occurrences.dto';
import { UpdateOccurrenceDto } from './dto/update-occurrence.dto';

@Injectable()
export class OccurrencesService {
  constructor(
    private prisma: PrismaService,
    private riskEngine: RiskEngineService,
    private studentsService: StudentsService,
  ) {}

  async list(schoolId: string, dto: ListOccurrencesDto) {
    const { page = 1, limit = 20, studentId, resolved } = dto;
    const skip = (page - 1) * limit;
    const where: any = { schoolId };

    if (studentId) where.studentId = studentId;
    if (typeof resolved === 'boolean') where.resolved = resolved;

    const [data, total] = await Promise.all([
      this.prisma.occurrence.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: { student: { select: { id: true, name: true, registrationId: true } } },
      }),
      this.prisma.occurrence.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(schoolId: string, id: string) {
    const occurrence = await this.prisma.occurrence.findFirst({
      where: { id, schoolId },
      include: { student: { select: { id: true, name: true, registrationId: true } } },
    });
    if (!occurrence) throw new NotFoundException('Ocorrencia nao encontrada');
    return occurrence;
  }

  async create(schoolId: string, reportedBy: string, dto: CreateOccurrenceDto) {
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, schoolId, isActive: true },
    });
    if (!student) throw new NotFoundException('Aluno nao encontrado');

    const occurrence = await this.prisma.occurrence.create({
      data: {
        schoolId,
        reportedBy,
        studentId: dto.studentId,
        type: dto.type,
        description: dto.description,
        date: dto.date ? new Date(dto.date) : new Date(),
      },
      include: { student: { select: { id: true, name: true, registrationId: true } } },
    });

    await this.studentsService.addTimelineEvent(
      dto.studentId,
      'OCCURRENCE_CREATED',
      `Ocorrencia registrada: ${dto.description}`,
      { occurrenceId: occurrence.id, type: dto.type },
    );
    await this.riskEngine.recalculateAndSave(dto.studentId);

    return occurrence;
  }

  async update(schoolId: string, id: string, dto: UpdateOccurrenceDto) {
    const occurrence = await this.findById(schoolId, id);
    const updated = await this.prisma.occurrence.update({
      where: { id },
      data: {
        type: dto.type,
        description: dto.description,
        date: dto.date ? new Date(dto.date) : undefined,
      },
      include: { student: { select: { id: true, name: true, registrationId: true } } },
    });

    await this.riskEngine.recalculateAndSave(occurrence.studentId);
    return updated;
  }

  async resolve(schoolId: string, id: string) {
    const occurrence = await this.findById(schoolId, id);
    const updated = await this.prisma.occurrence.update({
      where: { id },
      data: { resolved: true, resolvedAt: new Date() },
      include: { student: { select: { id: true, name: true, registrationId: true } } },
    });

    await this.studentsService.addTimelineEvent(
      occurrence.studentId,
      'OCCURRENCE_RESOLVED',
      `Ocorrencia resolvida: ${occurrence.description}`,
      { occurrenceId: id },
    );
    await this.riskEngine.recalculateAndSave(occurrence.studentId);

    return updated;
  }
}
