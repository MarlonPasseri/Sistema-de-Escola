import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssignTeacherDto {
  @ApiProperty({ example: 'seed-cs-8a-math' })
  @IsString()
  classSubjectId: string;
}
