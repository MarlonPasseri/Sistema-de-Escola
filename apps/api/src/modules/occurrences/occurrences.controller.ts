import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, UserRole } from '@edupulse/types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { SchoolId } from '../../common/decorators/school-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateOccurrenceDto } from './dto/create-occurrence.dto';
import { ListOccurrencesDto } from './dto/list-occurrences.dto';
import { UpdateOccurrenceDto } from './dto/update-occurrence.dto';
import { OccurrencesService } from './occurrences.service';

@ApiTags('Occurrences')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('occurrences')
export class OccurrencesController {
  constructor(private service: OccurrencesService) {}

  @Get()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  list(@SchoolId() schoolId: string, @Query() dto: ListOccurrencesDto) {
    return this.service.list(schoolId, dto);
  }

  @Post()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  @ApiOperation({ summary: 'Registrar ocorrencia de aluno' })
  create(@SchoolId() schoolId: string, @CurrentUser() actor: AuthUser, @Body() dto: CreateOccurrenceDto) {
    return this.service.create(schoolId, actor.id, dto);
  }

  @Get(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  findOne(@SchoolId() schoolId: string, @Param('id') id: string) {
    return this.service.findById(schoolId, id);
  }

  @Patch(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  update(@SchoolId() schoolId: string, @Param('id') id: string, @Body() dto: UpdateOccurrenceDto) {
    return this.service.update(schoolId, id, dto);
  }

  @Patch(':id/resolve')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
  resolve(@SchoolId() schoolId: string, @Param('id') id: string) {
    return this.service.resolve(schoolId, id);
  }
}
