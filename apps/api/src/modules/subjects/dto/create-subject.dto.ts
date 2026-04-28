import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({ example: 'Matematica' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'MAT' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
