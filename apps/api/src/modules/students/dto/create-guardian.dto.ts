import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGuardianDto {
  @ApiProperty({ example: 'Ana Silva' })
  @IsString()
  name: string;

  @ApiProperty({ example: '(11) 99999-1234' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: 'ana@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '000.000.000-00' })
  @IsOptional()
  @IsString()
  cpf?: string;

  @ApiProperty({ example: 'Mãe', description: 'Grau de parentesco' })
  @IsString()
  relationship: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  isPrimary?: boolean;
}
