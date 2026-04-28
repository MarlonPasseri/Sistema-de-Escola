import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssignSubjectDto {
  @ApiProperty({ example: 'seed-subject-math' })
  @IsString()
  subjectId: string;
}
