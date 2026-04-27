import {
  Controller, Get, Post, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CommunicationService } from './communication.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { ListAnnouncementsDto } from './dto/list-announcements.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SchoolId } from '../../common/decorators/school-id.decorator';
import { UserRole, AuthUser } from '@edupulse/types';

@ApiTags('Communication')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('announcements')
export class CommunicationController {
  constructor(private service: CommunicationService) {}

  @Post()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  @ApiOperation({ summary: 'Criar e enviar comunicado com targeting de audiência' })
  create(@CurrentUser() actor: AuthUser, @Body() dto: CreateAnnouncementDto) {
    return this.service.create(actor, dto);
  }

  @Get()
  @Roles(
    UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER,
    UserRole.GUARDIAN, UserRole.STUDENT,
  )
  @ApiOperation({ summary: 'Listar comunicados (filtragem automática por papel)' })
  list(@CurrentUser() actor: AuthUser, @Query() dto: ListAnnouncementsDto) {
    return this.service.list(actor, dto);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Total de comunicados não lidos (badge de notificação)' })
  unreadCount(@CurrentUser() actor: AuthUser) {
    return this.service.getUnreadCount(actor.id);
  }

  @Get('unengaged-guardians')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR)
  @ApiOperation({ summary: 'Responsáveis que não leram comunicados (para follow-up)' })
  unengagedGuardians(@SchoolId() schoolId: string) {
    return this.service.getUnengagedGuardians(schoolId);
  }

  @Get(':id')
  @Roles(
    UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER,
    UserRole.GUARDIAN, UserRole.STUDENT,
  )
  @ApiOperation({ summary: 'Detalhe do comunicado' })
  findOne(@SchoolId() schoolId: string, @Param('id') id: string) {
    return this.service.findById(schoolId, id);
  }

  @Get(':id/read-status')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  @ApiOperation({ summary: 'Quem leu / quem não leu — taxa de leitura' })
  readStatus(@SchoolId() schoolId: string, @Param('id') id: string) {
    return this.service.getReadStatus(schoolId, id);
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar comunicado como lido (dispara recálculo de risco)' })
  markAsRead(@CurrentUser() actor: AuthUser, @Param('id') id: string) {
    return this.service.markAsRead(actor.id, id);
  }
}
