import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService, SafeUser } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../common/types/role.enum';
import { JwtPayload } from './strategies/jwt-payload.interface';

export interface AuthResponse {
  accessToken: string;
  user: SafeUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const user = await this.users.create({
      fullName: dto.fullName,
      email: dto.email,
      password: dto.password,
      avatar: dto.avatar,
      role: Role.STUDENT,
    });
    return { accessToken: await this.sign(user.id, user.email, user.role as Role), user };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const raw = await this.users.findByEmailWithPassword(dto.email);
    if (!raw) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, raw.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const { passwordHash: _ignored, ...safe } = raw;
    return { accessToken: await this.sign(raw.id, raw.email, raw.role as Role), user: safe };
  }

  async me(userId: string): Promise<SafeUser> {
    return this.users.findById(userId);
  }

  private async sign(userId: string, email: string, role: Role): Promise<string> {
    // Attach studentId for STUDENT role so OwnershipGuard can short-circuit
    // without an extra DB roundtrip on every request.
    let studentId: string | undefined;
    if (role === Role.STUDENT) {
      const student = await this.prisma.student.findUnique({ where: { userId }, select: { id: true } });
      studentId = student?.id;
    }
    const payload: JwtPayload = { sub: userId, email, role, studentId };
    return this.jwt.signAsync(payload);
  }
}
