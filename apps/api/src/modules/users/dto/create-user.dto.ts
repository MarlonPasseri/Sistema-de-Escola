import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '@edupulse/types';

export class CreateUserDto {
  @ApiProperty({ example: 'ana@aurora.edu.br' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Ana Souza' })
  @IsString()
  name: string;

  @ApiProperty({ minLength: 6, example: 'senha123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ example: '(11) 99999-0000' })
  @IsOptional()
  @IsString()
  phone?: string;
}
