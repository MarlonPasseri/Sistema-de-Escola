import { Module } from '@nestjs/common';
import { AssessmentsController } from './assessments.controller';
import { GradesController } from './grades.controller';
import { AssessmentsService } from './assessments.service';
import { StudentSuccessModule } from '../student-success/student-success.module';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [StudentSuccessModule, StudentsModule],
  controllers: [AssessmentsController, GradesController],
  providers: [AssessmentsService],
  exports: [AssessmentsService],
})
export class AssessmentsModule {}
