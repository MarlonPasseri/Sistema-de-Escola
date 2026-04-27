import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

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
}
