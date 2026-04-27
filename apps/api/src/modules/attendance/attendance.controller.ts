import {
  Controller, Get, Post, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { RecordAttendanceDto } from './dto/record-attendance.dto';
import { ListSessionsDto } from './dto/list-sessions.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SchoolId } from '../../common/decorators/school-id.decorator';
import { UserRole, AuthUser } from '@edupulse/types';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post('sessions')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  @ApiOperation({ summary: 'Criar sessão de aula para registrar frequência' })
  createSession(@CurrentUser() user: AuthUser, @Body() dto: CreateSessionDto) {
    return this.attendanceService.createSession(user.id, dto);
  }

  @Get('sessions')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  @ApiOperation({ summary: 'Listar sessões da escola' })
  listSessions(@SchoolId() schoolId: string, @Query() dto: ListSessionsDto) {
    return this.attendanceService.listSessions(schoolId, dto);
  }

  @Get('sessions/:id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  @ApiOperation({ summary: 'Detalhe de sessão com lista de alunos e registros' })
  getSession(@Param('id') id: string) {
    return this.attendanceService.getSession(id);
  }

  @Post('sessions/:id/records')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  @ApiOperation({ summary: 'Lançar frequência em lote para uma sessão' })
  recordAttendance(
    @Param('id') sessionId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: RecordAttendanceDto,
  ) {
    return this.attendanceService.recordAttendance(sessionId, user.id, dto);
  }

  @Get('student/:studentId')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  @ApiOperation({ summary: 'Taxa de presença e histórico de faltas do aluno' })
  studentRate(
    @SchoolId() schoolId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.attendanceService.getStudentAttendanceRate(schoolId, studentId);
  }

  @Get('class/:classSubjectId')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  @ApiOperation({ summary: 'Histórico de sessões de uma turma/disciplina' })
  classHistory(@Param('classSubjectId') classSubjectId: string) {
    return this.attendanceService.getClassAttendance(classSubjectId);
  }
}
