import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AssignSubjectDto } from './dto/assign-subject.dto';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  list(schoolId: string) {
    return this.prisma.class.findMany({
      where: { schoolId },
      orderBy: { name: 'asc' },
      include: {
        academicYear: { select: { id: true, name: true, isActive: true } },
        classSubjects: { include: { subject: true } },
        _count: { select: { enrollments: true } },
      },
    });
  }

  async findById(schoolId: string, id: string) {
    const klass = await this.prisma.class.findFirst({
      where: { id, schoolId },
      include: {
        academicYear: true,
        classSubjects: { include: { subject: true, assignments: { include: { teacher: { include: { user: true } } } } } },
        enrollments: { where: { isActive: true }, include: { student: true } },
      },
    });
    if (!klass) throw new NotFoundException('Turma não encontrada');
    return klass;
  }

  async create(schoolId: string, dto: CreateClassDto) {
    const year = await this.prisma.academicYear.findFirst({
      where: { id: dto.academicYearId, schoolId },
    });
    if (!year) throw new NotFoundException('Ano letivo não encontrado');
    return this.prisma.class.create({ data: { ...dto, schoolId } });
  }

  async update(schoolId: string, id: string, dto: UpdateClassDto) {
    await this.findById(schoolId, id);
    return this.prisma.class.update({ where: { id }, data: dto });
  }

  async remove(schoolId: string, id: string) {
    await this.findById(schoolId, id);
    await this.prisma.class.delete({ where: { id } });
  }

  async assignSubject(schoolId: string, classId: string, dto: AssignSubjectDto) {
    await this.findById(schoolId, classId);
    const subject = await this.prisma.subject.findFirst({
      where: { id: dto.subjectId, schoolId },
    });
    if (!subject) throw new NotFoundException('Disciplina não encontrada');

    return this.prisma.classSubject.upsert({
      where: { classId_subjectId: { classId, subjectId: dto.subjectId } },
      update: {},
      create: { classId, subjectId: dto.subjectId },
      include: { class: true, subject: true },
    });
  }
}
