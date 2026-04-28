import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@edupulse/types';
import { Roles } from '../../common/decorators/roles.decorator';
import { SchoolId } from '../../common/decorators/school-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ListRisksDto } from './dto/list-risks.dto';
import { StudentSuccessService } from './student-success.service';

@ApiTags('Student Success')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('student-success')
export class StudentSuccessController {
  constructor(private service: StudentSuccessService) {}

  @Get('dashboard')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  @ApiOperation({ summary: 'Dashboard de risco academico' })
  dashboard(@SchoolId() schoolId: string) {
    return this.service.getDashboard(schoolId);
  }

  @Get('risks')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  @ApiOperation({ summary: 'Central de alunos em risco com filtros' })
  risks(@SchoolId() schoolId: string, @Query() dto: ListRisksDto) {
    return this.service.listRisks(schoolId, dto);
  }

  @Get('students/:id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  @ApiOperation({ summary: 'Perfil Student Success do aluno' })
  student(@SchoolId() schoolId: string, @Param('id') id: string) {
    return this.service.getStudentSuccess(schoolId, id);
  }
}
