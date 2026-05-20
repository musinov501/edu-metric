import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ScholarshipStatus } from '@prisma/client';

export class ListStudentsQuery {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, default: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  faculty?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  group?: string;

  @ApiProperty({ required: false, enum: ScholarshipStatus })
  @IsOptional()
  @IsEnum(ScholarshipStatus)
  scholarshipStatus?: ScholarshipStatus;

  /** Free-text search across student name / studentId */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  /** sort key, e.g. "finalScore:desc" */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sort?: string;
}
