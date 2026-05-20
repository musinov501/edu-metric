import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Notification, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/strategies/jwt-payload.interface';

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';

interface PushInput {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async push(input: PushInput): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        userId: input.userId,
        title: input.title,
        message: input.message,
        type: input.type ?? 'INFO',
        metadata: (input.metadata as Prisma.InputJsonValue) ?? Prisma.DbNull,
      },
    });
  }

  async findForCurrentUser(actor: AuthenticatedUser, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: { userId: actor.sub, ...(unreadOnly ? { isRead: false } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async markRead(id: string, actor: AuthenticatedUser): Promise<Notification> {
    const n = await this.prisma.notification.findUnique({ where: { id } });
    if (!n) throw new NotFoundException('Notification not found');
    if (n.userId !== actor.sub) throw new ForbiddenException();
    return this.prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  async markAllRead(actor: AuthenticatedUser): Promise<{ count: number }> {
    const { count } = await this.prisma.notification.updateMany({
      where: { userId: actor.sub, isRead: false },
      data: { isRead: true },
    });
    return { count };
  }
}
