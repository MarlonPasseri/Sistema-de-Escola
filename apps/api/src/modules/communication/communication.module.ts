import { Module } from '@nestjs/common';
import { CommunicationController } from './communication.controller';
import { CommunicationService } from './communication.service';
import { StudentSuccessModule } from '../student-success/student-success.module';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [StudentSuccessModule, StudentsModule],
  controllers: [CommunicationController],
  providers: [CommunicationService],
  exports: [CommunicationService],
})
export class CommunicationModule {}
