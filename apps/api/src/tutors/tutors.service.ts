import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Tutor } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTutorDto, UpdateTutorDto } from './dto/create-tutor.dto';

const SALT_ROUNDS = 12;

@Injectable()
export class TutorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTutorDto): Promise<Tutor> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email is already registered');

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName: dto.fullName,
          email: dto.email,
          passwordHash,
          role: 'TUTOR',
        },
      });
      return tx.tutor.create({
        data: {
          userId: user.id,
          assignedDormitory: dto.assignedDormitory,
          assignedGroups: dto.assignedGroups ?? [],
        },
      });
    });
  }

  async findAll() {
    return this.prisma.tutor.findMany({
      include: { user: { select: { id: true, fullName: true, email: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const tutor = await this.prisma.tutor.findUnique({
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
    if (!tutor) throw new NotFoundException('Tutor not found');
    return tutor;
  }

  async update(id: string, dto: UpdateTutorDto) {
    await this.findById(id);
    return this.prisma.tutor.update({ where: { id }, data: { ...dto } });
  }

  async remove(id: string): Promise<{ id: string }> {
    const tutor = await this.prisma.tutor.findUnique({ where: { id }, select: { userId: true } });
    if (!tutor) throw new NotFoundException('Tutor not found');
    await this.prisma.user.delete({ where: { id: tutor.userId } });
    return { id };
  }
}
