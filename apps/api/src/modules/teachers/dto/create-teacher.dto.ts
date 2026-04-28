import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTeacherDto {
  @ApiProperty({ example: 'Carlos Andrade' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'professor@aurora.edu.br' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 6, example: 'senha123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'PROF-001' })
  @IsOptional()
  @IsString()
  registrationId?: string;

  @ApiPropertyOptional({ type: [String], example: ['Matematica'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;
}
