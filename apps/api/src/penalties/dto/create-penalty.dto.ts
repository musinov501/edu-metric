import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { PenaltySeverity, PenaltyType } from '@prisma/client';

export class CreatePenaltyDto {
  @ApiProperty()
  @IsUUID()
  studentId!: string;

  @ApiProperty({ enum: PenaltyType })
  @IsEnum(PenaltyType)
  type!: PenaltyType;

  @ApiProperty({ enum: PenaltySeverity })
  @IsEnum(PenaltySeverity)
  severity!: PenaltySeverity;

  @ApiProperty({ example: 'Repeated tardiness over the past two weeks' })
  @IsString()
  @MinLength(3)
  reason!: string;

  /** Optional explicit override; otherwise derived from severity. */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  points?: number;
}
