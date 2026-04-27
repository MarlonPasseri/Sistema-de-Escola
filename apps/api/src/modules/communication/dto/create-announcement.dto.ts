import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AnnouncementAudience } from '@edupulse/types';

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'Reunião de pais — 1º Bimestre' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Informamos que a reunião de pais ocorrerá no dia 10/05...' })
  @IsString()
  content: string;

  @ApiProperty({ enum: AnnouncementAudience, default: AnnouncementAudience.ALL })
  @IsEnum(AnnouncementAudience)
  audience: AnnouncementAudience;

  // Usado quando audience = CLASS
  @ApiPropertyOptional({ example: 'seed-class-8a' })
  @IsOptional()
  @IsString()
  classId?: string;

  // Usado quando audience = STUDENT (pode ser vários)
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  studentIds?: string[];

  // Usado quando audience = GUARDIAN (userId dos responsáveis)
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetUserIds?: string[];
}
