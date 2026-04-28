import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@edupulse/types';
import { SchoolId } from '../../common/decorators/school-id.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { EnrollmentsService } from './enrollments.service';

@ApiTags('Enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classes/:classId/enrollments')
export class EnrollmentsController {
  constructor(private service: EnrollmentsService) {}

  @Get()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  list(@SchoolId() schoolId: string, @Param('classId') classId: string) {
    return this.service.listByClass(schoolId, classId);
  }

  @Post(':studentId')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR)
  @ApiOperation({ summary: 'Matricular aluno em turma' })
  enroll(
    @SchoolId() schoolId: string,
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
    @Body() dto: CreateEnrollmentDto,
  ) {
    return this.service.enroll(schoolId, classId, studentId, dto);
  }

  @Delete(':studentId')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  unenroll(
    @SchoolId() schoolId: string,
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.service.unenroll(schoolId, classId, studentId);
  }
}
