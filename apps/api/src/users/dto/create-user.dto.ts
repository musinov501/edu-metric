import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '../../common/types/role.enum';

export class CreateUserDto {
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

  @ApiProperty({ enum: Role, default: Role.STUDENT })
  @IsOptional()
  @IsEnum(Role)
  role?: Role = Role.STUDENT;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  avatar?: string;
}
