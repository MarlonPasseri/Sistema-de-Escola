import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, UserRole } from '@edupulse/types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { SchoolId } from '../../common/decorators/school-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { CreateInterventionNoteDto } from './dto/create-intervention-note.dto';
import { ListInterventionsDto } from './dto/list-interventions.dto';
import { UpdateInterventionDto } from './dto/update-intervention.dto';
import { InterventionsService } from './interventions.service';

@ApiTags('Interventions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('interventions')
export class InterventionsController {
  constructor(private service: InterventionsService) {}

  @Get()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  list(@SchoolId() schoolId: string, @Query() dto: ListInterventionsDto) {
    return this.service.list(schoolId, dto);
  }

  @Post()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR)
  @ApiOperation({ summary: 'Abrir plano de intervenção' })
  create(@SchoolId() schoolId: string, @CurrentUser() actor: AuthUser, @Body() dto: CreateInterventionDto) {
    return this.service.create(schoolId, actor.id, dto);
  }

  @Get(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  findOne(@SchoolId() schoolId: string, @Param('id') id: string) {
    return this.service.findById(schoolId, id);
  }

  @Patch(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR)
  update(@SchoolId() schoolId: string, @Param('id') id: string, @Body() dto: UpdateInterventionDto) {
    return this.service.update(schoolId, id, dto);
  }

  @Post(':id/notes')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  addNote(
    @SchoolId() schoolId: string,
    @CurrentUser() actor: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateInterventionNoteDto,
  ) {
    return this.service.addNote(schoolId, id, actor.id, dto);
  }
}
