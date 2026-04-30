import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../../database/prisma.service';
import { AssignTeacherDto } from './dto/assign-teacher.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

const TEACHER_INCLUDE = {
  user: { select: { id: true, name: true, email: true, phone: true, isActive: true } },
  assignments: {
    include: {
      classSubject: {
        include: {
          class: { select: { id: true, name: true, grade: true } },
          subject: { select: { id: true, name: true, code: true } },
        },
      },
    },
  },
};

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  list(schoolId: string) {
    return this.prisma.teacher.findMany({
      where: { schoolId, user: { isActive: true } },
      orderBy: { user: { name: 'asc' } },
      include: TEACHER_INCLUDE,
    });
  }

  async findById(schoolId: string, id: string) {
    const teacher = await this.prisma.teacher.findFirst({
      where: { id, schoolId, user: { isActive: true } },
      include: TEACHER_INCLUDE,
    });
    if (!teacher) throw new NotFoundException('Professor não encontrado');
    return teacher;
  }

  async create(schoolId: string, dto: CreateTeacherDto) {
    const existing = await this.prisma.user.findUnique({
      where: { schoolId_email: { schoolId, email: dto.email } },
    });
    if (existing) throw new ConflictException('E-mail já cadastrado nesta escola');

    const passwordHash = await argon2.hash(dto.password);
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          schoolId,
          email: dto.email,
          passwordHash,
          name: dto.name,
          role: 'TEACHER',
          phone: dto.phone,
        },
      });

      return tx.teacher.create({
        data: {
          schoolId,
          userId: user.id,
          registrationId: dto.registrationId,
          specialties: dto.specialties ?? [],
        },
        include: TEACHER_INCLUDE,
      });
    });
  }

  async update(schoolId: string, id: string, dto: UpdateTeacherDto) {
    const teacher = await this.findById(schoolId, id);
    const userData: any = {};
    if (dto.name) userData.name = dto.name;
    if (dto.email) userData.email = dto.email;
    if (dto.phone) userData.phone = dto.phone;
    if (dto.password) userData.passwordHash = await argon2.hash(dto.password);

    return this.prisma.$transaction(async (tx) => {
      if (Object.keys(userData).length > 0) {
        await tx.user.update({ where: { id: teacher.user.id }, data: userData });
      }
      return tx.teacher.update({
        where: { id },
        data: {
          registrationId: dto.registrationId,
          specialties: dto.specialties,
        },
        include: TEACHER_INCLUDE,
      });
    });
  }

  async deactivate(schoolId: string, id: string) {
    const teacher = await this.findById(schoolId, id);
    await this.prisma.user.update({ where: { id: teacher.user.id }, data: { isActive: false } });
  }

  async assign(schoolId: string, teacherId: string, dto: AssignTeacherDto) {
    await this.findById(schoolId, teacherId);
    const classSubject = await this.prisma.classSubject.findFirst({
      where: { id: dto.classSubjectId, class: { schoolId } },
    });
    if (!classSubject) throw new NotFoundException('Turma/disciplina não encontrada');

    return this.prisma.teacherAssignment.upsert({
      where: { teacherId_classSubjectId: { teacherId, classSubjectId: dto.classSubjectId } },
      update: {},
      create: { teacherId, classSubjectId: dto.classSubjectId },
      include: {
        teacher: { include: { user: true } },
        classSubject: { include: { class: true, subject: true } },
      },
    });
  }
}
