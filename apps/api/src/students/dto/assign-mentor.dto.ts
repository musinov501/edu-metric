import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class AssignMentorTutorDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  mentorId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  tutorId?: string;
}
