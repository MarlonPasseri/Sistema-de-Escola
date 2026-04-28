import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class CreateEnrollmentDto {
  @ApiPropertyOptional({ example: '2026-02-01' })
  @IsOptional()
  @IsDateString()
  enrolledAt?: string;
}
