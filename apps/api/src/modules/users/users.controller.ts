import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@edupulse/types';
import { SchoolId } from '../../common/decorators/school-id.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  @Get()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR)
  @ApiOperation({ summary: 'Listar usuarios da escola' })
  list(@SchoolId() schoolId: string, @Query() dto: ListUsersDto) {
    return this.service.list(schoolId, dto);
  }

  @Post()
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Criar usuario da escola' })
  create(@SchoolId() schoolId: string, @Body() dto: CreateUserDto) {
    return this.service.create(schoolId, dto);
  }

  @Get(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR)
  findOne(@SchoolId() schoolId: string, @Param('id') id: string) {
    return this.service.findById(schoolId, id);
  }

  @Patch(':id')
  @Roles(UserRole.SCHOOL_ADMIN)
  update(@SchoolId() schoolId: string, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.service.update(schoolId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  deactivate(@SchoolId() schoolId: string, @Param('id') id: string) {
    return this.service.deactivate(schoolId, id);
  }
}
