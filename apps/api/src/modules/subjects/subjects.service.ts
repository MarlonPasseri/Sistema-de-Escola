import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  list(schoolId: string) {
    return this.prisma.subject.findMany({
      where: { schoolId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { classSubjects: true, assessments: true } } },
    });
  }

  async findById(schoolId: string, id: string) {
    const subject = await this.prisma.subject.findFirst({
      where: { id, schoolId },
      include: { classSubjects: { include: { class: true } } },
    });
    if (!subject) throw new NotFoundException('Disciplina não encontrada');
    return subject;
  }

  create(schoolId: string, dto: CreateSubjectDto) {
    return this.prisma.subject.create({ data: { ...dto, schoolId } });
  }

  async update(schoolId: string, id: string, dto: UpdateSubjectDto) {
    await this.findById(schoolId, id);
    return this.prisma.subject.update({ where: { id }, data: dto });
  }

  async remove(schoolId: string, id: string) {
    await this.findById(schoolId, id);
    await this.prisma.subject.delete({ where: { id } });
  }
}
