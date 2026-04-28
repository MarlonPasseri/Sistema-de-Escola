import { Controller, Get, Patch, Body, UseGuards, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SchoolsService } from './schools.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SchoolId } from '../../common/decorators/school-id.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@edupulse/types';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';

@ApiTags('Schools')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('schools')
export class SchoolsController {
  constructor(private schoolsService: SchoolsService) {}

  @Get('current')
  getCurrent(@SchoolId() schoolId: string) {
    return this.schoolsService.findById(schoolId);
  }

  @Patch('current')
  @Roles(UserRole.SCHOOL_ADMIN)
  updateCurrent(@SchoolId() schoolId: string, @Body() body: any) {
    return this.schoolsService.update(schoolId, body);
  }

  @Get('academic-years')
  getAcademicYears(@SchoolId() schoolId: string) {
    return this.schoolsService.listAcademicYears(schoolId);
  }

  @Post('academic-years')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.COORDINATOR)
  createAcademicYear(@SchoolId() schoolId: string, @Body() dto: CreateAcademicYearDto) {
    return this.schoolsService.createAcademicYear(schoolId, dto);
  }
}
