import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '@prisma/client';

export class MarkAttendanceDto {
  @ApiProperty()
  @IsUUID()
  studentId!: string;

  @ApiProperty()
  @IsString()
  subject!: string;

  @ApiProperty({ example: '2026-05-19' })
  @IsDateString()
  date!: string;

  @ApiProperty({ enum: AttendanceStatus })
  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;
}

class BulkAttendanceItem {
  @IsUUID()
  studentId!: string;

  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;
}

export class BulkAttendanceDto {
  @ApiProperty()
  @IsString()
  subject!: string;

  @ApiProperty({ example: '2026-05-19' })
  @IsDateString()
  date!: string;

  @ApiProperty({ type: [BulkAttendanceItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkAttendanceItem)
  entries!: BulkAttendanceItem[];
}
