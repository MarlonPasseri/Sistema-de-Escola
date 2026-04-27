import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AssessmentsService } from './assessments.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { LaunchGradesDto } from './dto/launch-grades.dto';
import { ListAssessmentsDto } from './dto/list-assessments.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SchoolId } from '../../common/decorators/school-id.decorator';
import { UserRole } from '@edupulse/types';

@ApiTags('Assessments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assessments')
export class AssessmentsController {
  constructor(private service: AssessmentsService) {}

  @Post()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  @ApiOperation({ summary: 'Criar avaliação' })
  create(@SchoolId() schoolId: string, @Body() dto: CreateAssessmentDto) {
    return this.service.create(schoolId, dto);
  }

  @Get()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  @ApiOperation({ summary: 'Listar avaliações com filtros' })
  list(@SchoolId() schoolId: string, @Query() dto: ListAssessmentsDto) {
    return this.service.list(schoolId, dto);
  }

  @Get(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  @ApiOperation({ summary: 'Detalhe da avaliação com notas lançadas' })
  findOne(@SchoolId() schoolId: string, @Param('id') id: string) {
    return this.service.findById(schoolId, id);
  }

  @Patch(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  @ApiOperation({ summary: 'Atualizar avaliação' })
  update(
    @SchoolId() schoolId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAssessmentDto,
  ) {
    return this.service.update(schoolId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover avaliação e notas vinculadas' })
  remove(@SchoolId() schoolId: string, @Param('id') id: string) {
    return this.service.remove(schoolId, id);
  }

  @Post(':id/grades')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  @ApiOperation({ summary: 'Lançar notas em lote para a avaliação' })
  launchGrades(
    @SchoolId() schoolId: string,
    @Param('id') assessmentId: string,
    @Body() dto: LaunchGradesDto,
  ) {
    return this.service.launchGrades(schoolId, assessmentId, dto);
  }

  @Get(':id/stats')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  @ApiOperation({ summary: 'Estatísticas da avaliação (média, aprovados, reprovados)' })
  classStats(@SchoolId() schoolId: string, @Param('id') id: string) {
    return this.service.getClassGrades(schoolId, id);
  }
}
