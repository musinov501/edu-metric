import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class ApproveAchievementDto {
  /**
   * Final score for this achievement. If omitted, server uses
   * ACTIVITY_POINTS[type] or pointsKey lookup. Capped at 10.
   */
  @ApiProperty({ required: false, minimum: 0, maximum: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  score?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectAchievementDto {
  @ApiProperty({ required: true })
  @IsString()
  reason!: string;
}

export class RevisionAchievementDto {
  @ApiProperty({ required: true })
  @IsString()
  reason!: string;
}
