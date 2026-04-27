import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ListStudentsDto } from './dto/list-students.dto';
import { CreateGuardianDto } from './dto/create-guardian.dto';

const STUDENT_INCLUDE = {
  enrollments: {
    where: { isActive: true },
    include: {
      class: { select: { id: true, name: true, grade: true } },
    },
  },
  guardians: {
    include: {
      guardian: {
        include: { user: { select: { id: true, name: true, email: true, phone: true } } },
      },
    },
  },
  riskScores: {
    orderBy: { calculatedAt: 'desc' as const },
    take: 1,
  },
};

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async list(schoolId: string, dto: ListStudentsDto) {
    const { page = 1, limit = 20, search, classId, riskLevel } = dto;
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

    if (riskLevel) {
      where.riskScores = { some: { level: riskLevel } };
    }

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: STUDENT_INCLUDE,
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      data: students,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(schoolId: string, id: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, schoolId },
      include: STUDENT_INCLUDE,
    });
    if (!student) throw new NotFoundException('Aluno não encontrado');
    return student;
  }

  async create(schoolId: string, dto: CreateStudentDto) {
    const exists = await this.prisma.student.findUnique({
      where: { schoolId_registrationId: { schoolId, registrationId: dto.registrationId } },
    });
    if (exists) throw new ConflictException('Matrícula já cadastrada nesta escola');

    const student = await this.prisma.student.create({
      data: { ...dto, schoolId },
      include: STUDENT_INCLUDE,
    });

    await this.addTimelineEvent(student.id, 'ENROLLED', 'Aluno cadastrado no sistema');
    return student;
  }

  async update(schoolId: string, id: string, dto: UpdateStudentDto) {
    await this.findById(schoolId, id);
    return this.prisma.student.update({
      where: { id },
      data: dto,
      include: STUDENT_INCLUDE,
    });
  }

  async deactivate(schoolId: string, id: string) {
    await this.findById(schoolId, id);
    return this.prisma.student.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getTimeline(schoolId: string, id: string) {
    await this.findById(schoolId, id);
    return this.prisma.studentTimeline.findMany({
      where: { studentId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLatestRisk(schoolId: string, id: string) {
    await this.findById(schoolId, id);
    return this.prisma.riskScore.findFirst({
      where: { studentId: id },
      orderBy: { calculatedAt: 'desc' },
    });
  }

  async addGuardian(schoolId: string, studentId: string, dto: CreateGuardianDto) {
    await this.findById(schoolId, studentId);

    // Create user account for guardian
    const user = await this.prisma.user.create({
      data: {
        schoolId,
        email: dto.email ?? `guardian-${Date.now()}@noreply.local`,
        passwordHash: '',
        name: dto.name,
        role: 'GUARDIAN',
        phone: dto.phone,
      },
    });

    const guardian = await this.prisma.guardian.create({
      data: {
        schoolId,
        userId: user.id,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        cpf: dto.cpf,
      },
    });

    await this.prisma.studentGuardian.create({
      data: {
        studentId,
        guardianId: guardian.id,
        relationship: dto.relationship,
        isPrimary: dto.isPrimary ?? false,
      },
    });

    await this.addTimelineEvent(
      studentId,
      'GUARDIAN_ADDED',
      `Responsável "${dto.name}" vinculado como ${dto.relationship}`,
    );

    return guardian;
  }

  async addTimelineEvent(
    studentId: string,
    type: string,
    description: string,
    metadata?: object,
  ) {
    return this.prisma.studentTimeline.create({
      data: { studentId, type, description, metadata },
    });
  }
}
