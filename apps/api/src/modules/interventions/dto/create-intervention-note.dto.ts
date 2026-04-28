import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateInterventionNoteDto {
  @ApiProperty({ example: 'Responsavel contatado e reuniao agendada.' })
  @IsString()
  content: string;
}
