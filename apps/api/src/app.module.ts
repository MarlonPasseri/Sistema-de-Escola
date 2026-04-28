import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { SchoolsModule } from './modules/schools/schools.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { ClassesModule } from './modules/classes/classes.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { AssessmentsModule } from './modules/assessments/assessments.module';
import { CommunicationModule } from './modules/communication/communication.module';
import { OccurrencesModule } from './modules/occurrences/occurrences.module';
import { StudentSuccessModule } from './modules/student-success/student-success.module';
import { InterventionsModule } from './modules/interventions/interventions.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    DatabaseModule,
    AuthModule,
    SchoolsModule,
    UsersModule,
    StudentsModule,
    TeachersModule,
    ClassesModule,
    SubjectsModule,
    EnrollmentsModule,
    AttendanceModule,
    AssessmentsModule,
    CommunicationModule,
    OccurrencesModule,
    StudentSuccessModule,
    InterventionsModule,
    AuditModule,
  ],
})
export class AppModule {}
