import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * Public registration. We deliberately do NOT accept `role` here — every public
 * signup is a STUDENT. Mentors / tutors / admins are seeded or created by
 * Admin/Super-Admin via POST /users.
 */
export class RegisterDto {
  @ApiProperty({ example: 'Aziz Karimov' })
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiProperty({ example: 'aziz@university.uz' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPass123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  avatar?: string;
}
