import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AssessmentsService } from './assessments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SchoolId } from '../../common/decorators/school-id.decorator';
import { UserRole } from '@edupulse/types';

@ApiTags('Grades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('grades')
export class GradesController {
  constructor(private service: AssessmentsService) {}

  @Get('student/:studentId/report-card')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER, UserRole.GUARDIAN, UserRole.STUDENT)
  @ApiOperation({ summary: 'Boletim do aluno — médias por disciplina e bimestre' })
  reportCard(@SchoolId() schoolId: string, @Param('studentId') studentId: string) {
    return this.service.getReportCard(schoolId, studentId);
  }
}
