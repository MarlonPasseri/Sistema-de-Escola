import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ListStudentsDto } from './dto/list-students.dto';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SchoolId } from '../../common/decorators/school-id.decorator';
import { UserRole } from '@edupulse/types';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  @ApiOperation({ summary: 'Listar alunos com filtros e paginação' })
  list(@SchoolId() schoolId: string, @Query() dto: ListStudentsDto) {
    return this.studentsService.list(schoolId, dto);
  }

  @Post()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR)
  @ApiOperation({ summary: 'Cadastrar novo aluno' })
  create(@SchoolId() schoolId: string, @Body() dto: CreateStudentDto) {
    return this.studentsService.create(schoolId, dto);
  }

  @Get(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  @ApiOperation({ summary: 'Detalhe do aluno com turma, responsáveis e risco' })
  findOne(@SchoolId() schoolId: string, @Param('id') id: string) {
    return this.studentsService.findById(schoolId, id);
  }

  @Patch(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR)
  @ApiOperation({ summary: 'Atualizar dados do aluno' })
  update(
    @SchoolId() schoolId: string,
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentsService.update(schoolId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desativar aluno' })
  deactivate(@SchoolId() schoolId: string, @Param('id') id: string) {
    return this.studentsService.deactivate(schoolId, id);
  }

  @Get(':id/timeline')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  @ApiOperation({ summary: 'Timeline de eventos do aluno' })
  timeline(@SchoolId() schoolId: string, @Param('id') id: string) {
    return this.studentsService.getTimeline(schoolId, id);
  }

  @Get(':id/risk')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  @ApiOperation({ summary: 'Score de risco atual do aluno' })
  risk(@SchoolId() schoolId: string, @Param('id') id: string) {
    return this.studentsService.getLatestRisk(schoolId, id);
  }

  @Post(':id/guardians')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR)
  @ApiOperation({ summary: 'Vincular responsável ao aluno' })
  addGuardian(
    @SchoolId() schoolId: string,
    @Param('id') studentId: string,
    @Body() dto: CreateGuardianDto,
  ) {
    return this.studentsService.addGuardian(schoolId, studentId, dto);
  }
}
