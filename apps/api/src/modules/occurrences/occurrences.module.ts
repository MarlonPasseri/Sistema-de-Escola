import { Module } from '@nestjs/common';
import { StudentSuccessModule } from '../student-success/student-success.module';
import { StudentsModule } from '../students/students.module';
import { OccurrencesController } from './occurrences.controller';
import { OccurrencesService } from './occurrences.service';

@Module({
  imports: [StudentSuccessModule, StudentsModule],
  controllers: [OccurrencesController],
  providers: [OccurrencesService],
})
export class OccurrencesModule {}
