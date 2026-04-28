import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@edupulse/types';
import { SchoolId } from '../../common/decorators/school-id.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AssignSubjectDto } from './dto/assign-subject.dto';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ClassesService } from './classes.service';

@ApiTags('Classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classes')
export class ClassesController {
  constructor(private service: ClassesService) {}

  @Get()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  list(@SchoolId() schoolId: string) {
    return this.service.list(schoolId);
  }

  @Post()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR)
  @ApiOperation({ summary: 'Criar turma' })
  create(@SchoolId() schoolId: string, @Body() dto: CreateClassDto) {
    return this.service.create(schoolId, dto);
  }

  @Get(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  findOne(@SchoolId() schoolId: string, @Param('id') id: string) {
    return this.service.findById(schoolId, id);
  }

  @Patch(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR)
  update(@SchoolId() schoolId: string, @Param('id') id: string, @Body() dto: UpdateClassDto) {
    return this.service.update(schoolId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@SchoolId() schoolId: string, @Param('id') id: string) {
    return this.service.remove(schoolId, id);
  }

  @Post(':id/subjects')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR)
  assignSubject(@SchoolId() schoolId: string, @Param('id') id: string, @Body() dto: AssignSubjectDto) {
    return this.service.assignSubject(schoolId, id, dto);
  }
}
