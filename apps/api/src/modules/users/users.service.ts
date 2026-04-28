import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const USER_SELECT = {
  id: true,
  schoolId: true,
  email: true,
  name: true,
  role: true,
  avatarUrl: true,
  phone: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async list(schoolId: string, dto: ListUsersDto) {
    const { page = 1, limit = 20, search, role } = dto;
    const skip = (page - 1) * limit;
    const where: any = { schoolId, isActive: true };

    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        select: USER_SELECT,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(schoolId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, schoolId, isActive: true },
      select: USER_SELECT,
    });
    if (!user) throw new NotFoundException('Usuario nao encontrado');
    return user;
  }

  async create(schoolId: string, dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { schoolId_email: { schoolId, email: dto.email } },
    });
    if (existing) throw new ConflictException('E-mail ja cadastrado nesta escola');

    const passwordHash = await argon2.hash(dto.password);
    return this.prisma.user.create({
      data: {
        schoolId,
        email: dto.email,
        passwordHash,
        name: dto.name,
        role: dto.role,
        phone: dto.phone,
      },
      select: USER_SELECT,
    });
  }

  async update(schoolId: string, id: string, dto: UpdateUserDto) {
    await this.findById(schoolId, id);
    const data: any = { ...dto };
    if (dto.password) {
      data.passwordHash = await argon2.hash(dto.password);
      delete data.password;
    }
    return this.prisma.user.update({ where: { id }, data, select: USER_SELECT });
  }

  async deactivate(schoolId: string, id: string) {
    await this.findById(schoolId, id);
    await this.prisma.user.update({ where: { id }, data: { isActive: false } });
  }
}
