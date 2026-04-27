import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { StudentSuccessModule } from '../student-success/student-success.module';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [StudentSuccessModule, StudentsModule],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
