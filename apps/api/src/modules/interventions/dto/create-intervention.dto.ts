import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateInterventionDto {
  @ApiProperty({ example: 'seed-student-1' })
  @IsString()
  studentId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  riskScoreId?: string;

  @ApiProperty({ example: 'Queda de frequencia e desempenho em Matematica' })
  @IsString()
  reason: string;

  @ApiProperty({ example: 'Recuperar frequencia acima de 85% e media acima de 6.0' })
  @IsString()
  goal: string;

  @ApiProperty({ example: '2026-05-15' })
  @IsDateString()
  reviewDate: string;
}
