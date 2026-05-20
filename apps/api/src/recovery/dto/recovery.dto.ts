import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, Max, Min, MinLength } from 'class-validator';

export class AssignRecoveryDto {
  @ApiProperty()
  @IsUUID()
  studentId!: string;

  @ApiProperty({ example: 'Volunteer 5 hours at the university open day' })
  @IsString()
  @MinLength(5)
  assignedTask!: string;
}

export class CompleteRecoveryDto {
  /**
   * Points recovered (server clamps to min(|penalty|/2, 10) per student).
   * Default = full available cap.
   */
  @ApiProperty({ required: false, minimum: 0, maximum: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  recoveredPoints?: number;
}

export class RejectRecoveryDto {
  @ApiProperty()
  @IsString()
  reason!: string;
}
