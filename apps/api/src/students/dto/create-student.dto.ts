import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

/**
 * Admin-side student creation. Creates BOTH the User and Student rows in
 * a single transaction (see StudentsService.create).
 *
 * Public student signup is via POST /auth/register — that path doesn't
 * yet attach a Student row; an admin must follow up to attach faculty/group
 * info. (We can later extend register to accept these fields.)
 */
export class CreateStudentDto {
  @ApiProperty({ example: 'Aziza Karimova' })
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiProperty({ example: 'aziza@university.uz' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'SE-2024-001' })
  @IsString()
  @MinLength(2)
  studentId!: string;

  @ApiProperty({ example: 'Software Engineering' })
  @IsString()
  faculty!: string;

  @ApiProperty({ example: 'SE-21-01' })
  @IsString()
  group!: string;

  @ApiProperty({ example: 3, minimum: 1, maximum: 6 })
  @IsInt()
  @Min(1)
  @Max(6)
  courseYear!: number;

  @ApiProperty({ required: false, default: 0, minimum: 0, maximum: 100 })
  @IsOptional()
  @Min(0)
  @Max(100)
  gpa?: number;

  @ApiProperty({ required: false, default: 0, minimum: 0, maximum: 100 })
  @IsOptional()
  @Min(0)
  @Max(100)
  attendancePercent?: number;
}
