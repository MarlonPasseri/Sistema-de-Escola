import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateClassDto {
  @ApiProperty({ example: 'seed-year-2026' })
  @IsString()
  academicYearId: string;

  @ApiProperty({ example: '8 Ano A' })
  @IsString()
  name: string;

  @ApiProperty({ example: '8' })
  @IsString()
  grade: string;

  @ApiPropertyOptional({ example: 'Manha' })
  @IsOptional()
  @IsString()
  shift?: string;

  @ApiPropertyOptional({ example: 35 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxStudents?: number;
}
