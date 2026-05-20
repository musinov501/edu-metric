import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../common/types/role.enum';

const SALT_ROUNDS = 12;

export type SafeUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<SafeUser> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        passwordHash,
        role: (dto.role as Role) ?? Role.STUDENT,
        avatar: dto.avatar,
      },
    });
    return this.strip(user);
  }

  async findById(id: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.strip(user);
  }

  /** Internal — returns the full record incl. passwordHash. Use only inside AuthService. */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findAll(filter?: { role?: Role }): Promise<SafeUser[]> {
    const where: Prisma.UserWhereInput = {};
    if (filter?.role) where.role = filter.role;
    const users = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => this.strip(u));
  }

  async update(id: string, dto: UpdateUserDto): Promise<SafeUser> {
    await this.findById(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: { ...dto },
    });
    return this.strip(user);
  }

  async remove(id: string): Promise<{ id: string }> {
    await this.findById(id);
    await this.prisma.user.delete({ where: { id } });
    return { id };
  }

  private strip(user: User): SafeUser {
    const { passwordHash: _ignored, ...safe } = user;
    return safe;
  }
}
