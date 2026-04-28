import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';

@Injectable()
export class SchoolsService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const school = await this.prisma.school.findUnique({ where: { id } });
    if (!school) throw new NotFoundException('Escola não encontrada');
    return school;
  }

  async update(id: string, data: { name?: string; phone?: string; email?: string; address?: string }) {
    return this.prisma.school.update({ where: { id }, data });
  }

  listAcademicYears(schoolId: string) {
    return this.prisma.academicYear.findMany({
      where: { schoolId },
      orderBy: { startDate: 'desc' },
      include: { terms: { orderBy: { startDate: 'asc' } } },
    });
  }

  createAcademicYear(schoolId: string, dto: CreateAcademicYearDto) {
    return this.prisma.academicYear.create({
      data: {
        schoolId,
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
    });
  }
}
