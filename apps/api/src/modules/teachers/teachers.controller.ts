import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@edupulse/types';
import { SchoolId } from '../../common/decorators/school-id.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AssignTeacherDto } from './dto/assign-teacher.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeachersService } from './teachers.service';

@ApiTags('Teachers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teachers')
export class TeachersController {
  constructor(private service: TeachersService) {}

  @Get()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR)
  list(@SchoolId() schoolId: string) {
    return this.service.list(schoolId);
  }

  @Post()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR)
  @ApiOperation({ summary: 'Criar professor com usuario de acesso' })
  create(@SchoolId() schoolId: string, @Body() dto: CreateTeacherDto) {
    return this.service.create(schoolId, dto);
  }

  @Get(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR)
  findOne(@SchoolId() schoolId: string, @Param('id') id: string) {
    return this.service.findById(schoolId, id);
  }

  @Patch(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR)
  update(@SchoolId() schoolId: string, @Param('id') id: string, @Body() dto: UpdateTeacherDto) {
    return this.service.update(schoolId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  deactivate(@SchoolId() schoolId: string, @Param('id') id: string) {
    return this.service.deactivate(schoolId, id);
  }

  @Post(':id/assignments')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR)
  assign(@SchoolId() schoolId: string, @Param('id') id: string, @Body() dto: AssignTeacherDto) {
    return this.service.assign(schoolId, id, dto);
  }
}
