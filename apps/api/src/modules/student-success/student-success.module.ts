import { Module } from '@nestjs/common';
import { RiskEngineService } from './risk-engine.service';
import { StudentSuccessController } from './student-success.controller';
import { StudentSuccessService } from './student-success.service';

@Module({
  controllers: [StudentSuccessController],
  providers: [RiskEngineService, StudentSuccessService],
  exports: [RiskEngineService, StudentSuccessService],
})
export class StudentSuccessModule {}
