import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StudentsService } from '../students/students.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(
    private prisma: PrismaService,
    private studentsService: StudentsService,
  ) {}

  async listByClass(schoolId: string, classId: string) {
    const klass = await this.prisma.class.findFirst({ where: { id: classId, schoolId } });
    if (!klass) throw new NotFoundException('Turma nao encontrada');

    return this.prisma.enrollment.findMany({
      where: { classId, isActive: true },
      orderBy: { student: { name: 'asc' } },
      include: { student: true, class: true },
    });
  }

  async enroll(schoolId: string, classId: string, studentId: string, dto: CreateEnrollmentDto) {
    const [klass, student] = await Promise.all([
      this.prisma.class.findFirst({ where: { id: classId, schoolId } }),
      this.prisma.student.findFirst({ where: { id: studentId, schoolId, isActive: true } }),
    ]);
    if (!klass) throw new NotFoundException('Turma nao encontrada');
    if (!student) throw new NotFoundException('Aluno nao encontrado');

    const existing = await this.prisma.enrollment.findFirst({
      where: { studentId, classId, isActive: true },
    });
    if (existing) throw new ConflictException('Aluno ja esta matriculado nesta turma');

    const enrollment = await this.prisma.enrollment.create({
      data: {
        studentId,
        classId,
        enrolledAt: dto.enrolledAt ? new Date(dto.enrolledAt) : undefined,
      },
      include: { student: true, class: true },
    });

    await this.studentsService.addTimelineEvent(
      studentId,
      'ENROLLED_IN_CLASS',
      `Aluno matriculado na turma ${klass.name}`,
      { classId },
    );

    return enrollment;
  }

  async unenroll(schoolId: string, classId: string, studentId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { studentId, classId, isActive: true, class: { schoolId } },
      include: { class: true },
    });
    if (!enrollment) throw new NotFoundException('Matricula nao encontrada');

    await this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { isActive: false, unenrolledAt: new Date() },
    });

    await this.studentsService.addTimelineEvent(
      studentId,
      'UNENROLLED_FROM_CLASS',
      `Aluno removido da turma ${enrollment.class.name}`,
      { classId },
    );
  }
}
