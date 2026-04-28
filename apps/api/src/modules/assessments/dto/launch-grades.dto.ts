import { IsArray, IsString, IsNumber, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GradeItemDto {
  @ApiProperty()
  @IsString()
  studentId: string;

  @ApiProperty({ example: 7.5 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  score: number;

  @ApiPropertyOptional({ example: 'Dificuldade em interpretação de problemas' })
  @IsOptional()
  @IsString()
  feedback?: string;
}

export class LaunchGradesDto {
  @ApiProperty({ type: [GradeItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradeItemDto)
  grades: GradeItemDto[];
}
