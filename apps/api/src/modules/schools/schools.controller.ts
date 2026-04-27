import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SchoolsService } from './schools.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SchoolId } from '../../common/decorators/school-id.decorator';

@ApiTags('Schools')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('schools')
export class SchoolsController {
  constructor(private schoolsService: SchoolsService) {}

  @Get('current')
  getCurrent(@SchoolId() schoolId: string) {
    return this.schoolsService.findById(schoolId);
  }

  @Patch('current')
  updateCurrent(@SchoolId() schoolId: string, @Body() body: any) {
    return this.schoolsService.update(schoolId, body);
  }
}
