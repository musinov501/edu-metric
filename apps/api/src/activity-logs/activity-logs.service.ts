import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityAction } from './activity-action.enum';
import { PaginationQuery, Paginated } from '../common/types/paginated';

interface LogInput {
  actorId: string;
  targetStudentId?: string | null;
  action: ActivityAction;
  description: string;
  metadata?: Record<string, unknown>;
}

type LogRow = Prisma.ActivityLogGetPayload<{
  include: { actor: { select: { id: true; fullName: true; role: true } } };
}>;

@Injectable()
export class ActivityLogsService {
  private readonly logger = new Logger(ActivityLogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Append a row to the activity log. Failures are swallowed (logged) so they
   * never break the calling business operation — transparency is best-effort,
   * not blocking.
   */
  async log(input: LogInput): Promise<void> {
    try {
      await this.prisma.activityLog.create({
        data: {
          actorId: input.actorId,
          targetStudentId: input.targetStudentId ?? null,
          actionType: input.action,
          description: input.description,
          metadata: (input.metadata as Prisma.InputJsonValue) ?? Prisma.DbNull,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to write activity log for ${input.action}`, err as Error);
    }
  }

  async findAll(query: PaginationQuery & { action?: string; studentId?: string }): Promise<Paginated<LogRow>> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const where: Prisma.ActivityLogWhereInput = {};
    if (query.action) where.actionType = query.action;
    if (query.studentId) where.targetStudentId = query.studentId;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.activityLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { actor: { select: { id: true, fullName: true, role: true } } },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByStudent(studentId: string, limit = 50): Promise<LogRow[]> {
    return this.prisma.activityLog.findMany({
      where: { targetStudentId: studentId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { actor: { select: { id: true, fullName: true, role: true } } },
    });
  }
}
