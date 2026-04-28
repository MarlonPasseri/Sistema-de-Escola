import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString } from 'class-validator';

export class CreateAcademicYearDto {
  @ApiProperty({ example: '2026' })
  @IsString()
  name: string;

  @ApiProperty({ example: '2026-02-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-12-15' })
  @IsDateString()
  endDate: string;
}
