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

  @ApiProperty({ example: 'Queda de frequência e desempenho em Matemática' })
  @IsString()
  reason: string;

  @ApiProperty({ example: 'Recuperar frequência acima de 85% e média acima de 6.0' })
  @IsString()
  goal: string;

  @ApiProperty({ example: '2026-05-15' })
  @IsDateString()
  reviewDate: string;
}
