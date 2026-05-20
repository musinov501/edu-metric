import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Mentor } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMentorDto, UpdateMentorDto } from './dto/create-mentor.dto';

const SALT_ROUNDS = 12;

@Injectable()
export class MentorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMentorDto): Promise<Mentor> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email is already registered');

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName: dto.fullName,
          email: dto.email,
          passwordHash,
          role: 'MENTOR',
        },
      });
      return tx.mentor.create({
        data: {
          userId: user.id,
          specialization: dto.specialization,
          assignedGroups: dto.assignedGroups ?? [],
        },
      });
    });
  }

  async findAll() {
    return this.prisma.mentor.findMany({
      include: { user: { select: { id: true, fullName: true, email: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const mentor = await this.prisma.mentor.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, email: true, avatar: true } },
        studentAssignments: {
          include: {
            student: { include: { user: { select: { fullName: true } } } },
          },
        },
      },
    });
    if (!mentor) throw new NotFoundException('Mentor not found');
    return mentor;
  }

  async update(id: string, dto: UpdateMentorDto) {
    await this.findById(id);
    return this.prisma.mentor.update({ where: { id }, data: { ...dto } });
  }

  async remove(id: string): Promise<{ id: string }> {
    const mentor = await this.prisma.mentor.findUnique({ where: { id }, select: { userId: true } });
    if (!mentor) throw new NotFoundException('Mentor not found');
    await this.prisma.user.delete({ where: { id: mentor.userId } });
    return { id };
  }
}
