import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateOccurrenceDto {
  @ApiProperty({ example: 'seed-student-1' })
  @IsString()
  studentId: string;

  @ApiProperty({ example: 'DISCIPLINARY' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'Baixa participacao registrada em sala.' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: '2026-04-28' })
  @IsOptional()
  @IsDateString()
  date?: string;
}
