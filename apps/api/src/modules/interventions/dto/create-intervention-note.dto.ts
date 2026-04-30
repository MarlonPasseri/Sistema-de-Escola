import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateInterventionNoteDto {
  @ApiProperty({ example: 'Responsável contatado e reunião agendada.' })
  @IsString()
  content: string;
}
