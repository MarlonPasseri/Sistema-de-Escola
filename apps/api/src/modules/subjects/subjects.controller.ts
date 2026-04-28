import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@edupulse/types';
import { SchoolId } from '../../common/decorators/school-id.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { SubjectsService } from './subjects.service';

@ApiTags('Subjects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subjects')
export class SubjectsController {
  constructor(private service: SubjectsService) {}

  @Get()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  list(@SchoolId() schoolId: string) {
    return this.service.list(schoolId);
  }

  @Post()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR)
  @ApiOperation({ summary: 'Criar disciplina' })
  create(@SchoolId() schoolId: string, @Body() dto: CreateSubjectDto) {
    return this.service.create(schoolId, dto);
  }

  @Get(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  findOne(@SchoolId() schoolId: string, @Param('id') id: string) {
    return this.service.findById(schoolId, id);
  }

  @Patch(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR)
  update(@SchoolId() schoolId: string, @Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    return this.service.update(schoolId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@SchoolId() schoolId: string, @Param('id') id: string) {
    return this.service.remove(schoolId, id);
  }
}
