import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Achievement, AchievementStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ActivityAction } from '../activity-logs/activity-action.enum';
import { ScoringService } from '../scoring/scoring.service';
import { ACTIVITY_POINTS } from '../scoring/kpi.constants';
import { UploadAchievementDto } from './dto/upload-achievement.dto';
import {
  ApproveAchievementDto,
  RejectAchievementDto,
  RevisionAchievementDto,
} from './dto/approve-achievement.dto';
import { Role } from '../common/types/role.enum';
import { AuthenticatedUser } from '../auth/strategies/jwt-payload.interface';
import { StudentsService } from '../students/students.service';

@Injectable()
export class AchievementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogs: ActivityLogsService,
    private readonly scoring: ScoringService,
    private readonly students: StudentsService,
  ) {}

  /**
   * Student uploads an achievement (status starts as PENDING).
   */
  async upload(dto: UploadAchievementDto, actor: AuthenticatedUser): Promise<Achievement> {
    if (actor.role !== Role.STUDENT || !actor.studentId) {
      throw new ForbiddenException('Only students can upload achievements');
    }

    // Smart duplicate detection: same hash, same student, not REJECTED → conflict
    if (dto.fileHash) {
      const dup = await this.prisma.achievement.findFirst({
        where: {
          studentId: actor.studentId,
          fileHash: dto.fileHash,
          status: { in: ['PENDING', 'APPROVED', 'REVISION_REQUIRED'] },
        },
        select: { id: true, title: true, status: true },
      });
      if (dup) {
        throw new ConflictException(
          `Duplicate certificate already submitted (id ${dup.id}, status ${dup.status})`,
        );
      }
    }

    const previewScore = dto.pointsKey ? ACTIVITY_POINTS[dto.pointsKey] ?? 0 : 0;

    const achievement = await this.prisma.achievement.create({
      data: {
        studentId: actor.studentId,
        type: dto.type,
        title: dto.title,
        description: dto.description,
        fileUrl: dto.fileUrl,
        externalLink: dto.externalLink,
        fileHash: dto.fileHash,
        score: previewScore,
        status: 'PENDING',
      },
    });

    await this.activityLogs.log({
      actorId: actor.sub,
      targetStudentId: actor.studentId,
      action: ActivityAction.ACHIEVEMENT_UPLOADED,
      description: `Uploaded "${dto.title}" (${dto.type})`,
      metadata: { achievementId: achievement.id, type: dto.type, pointsKey: dto.pointsKey },
    });

    return achievement;
  }

  async findPending(query: { page?: number; limit?: number }) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, query.limit ?? 20);
    const where: Prisma.AchievementWhereInput = { status: 'PENDING' };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.achievement.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          student: {
            include: { user: { select: { fullName: true, email: true, avatar: true } } },
          },
        },
      }),
      this.prisma.achievement.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findByStudent(studentId: string, actor: AuthenticatedUser) {
    await this.students.assertCanRead(studentId, actor);
    return this.prisma.achievement.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(id: string, dto: ApproveAchievementDto, actor: AuthenticatedUser): Promise<Achievement> {
    const a = await this.getEditable(id);
    const score = this.resolveScore(a, dto.score);

    const updated = await this.prisma.achievement.update({
      where: { id },
      data: {
        status: 'APPROVED',
        score,
        reviewNotes: dto.notes,
        verifiedById: actor.sub,
      },
    });

    await this.activityLogs.log({
      actorId: actor.sub,
      targetStudentId: a.studentId,
      action: ActivityAction.ACHIEVEMENT_APPROVED,
      description: `Approved "${a.title}" (+${score})`,
      metadata: { achievementId: id, score, type: a.type },
    });

    await this.scoring.recalculate(a.studentId, {
      actorId: actor.sub,
      reason: `Achievement approved: ${a.title}`,
    });

    return updated;
  }

  async reject(id: string, dto: RejectAchievementDto, actor: AuthenticatedUser): Promise<Achievement> {
    const a = await this.getEditable(id);
    const updated = await this.prisma.achievement.update({
      where: { id },
      data: { status: 'REJECTED', reviewNotes: dto.reason, verifiedById: actor.sub, score: 0 },
    });
    await this.activityLogs.log({
      actorId: actor.sub,
      targetStudentId: a.studentId,
      action: ActivityAction.ACHIEVEMENT_REJECTED,
      description: `Rejected "${a.title}": ${dto.reason}`,
      metadata: { achievementId: id, reason: dto.reason },
    });
    return updated;
  }

  async requestRevision(id: string, dto: RevisionAchievementDto, actor: AuthenticatedUser): Promise<Achievement> {
    const a = await this.getEditable(id);
    const updated = await this.prisma.achievement.update({
      where: { id },
      data: { status: 'REVISION_REQUIRED', reviewNotes: dto.reason, verifiedById: actor.sub },
    });
    await this.activityLogs.log({
      actorId: actor.sub,
      targetStudentId: a.studentId,
      action: ActivityAction.ACHIEVEMENT_REVISION_REQUESTED,
      description: `Revision requested for "${a.title}": ${dto.reason}`,
      metadata: { achievementId: id, reason: dto.reason },
    });
    return updated;
  }

  // ─────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────

  private async getEditable(id: string) {
    const a = await this.prisma.achievement.findUnique({ where: { id } });
    if (!a) throw new NotFoundException('Achievement not found');
    if (a.status === 'APPROVED' || a.status === 'REJECTED') {
      throw new BadRequestException(`Achievement already ${a.status.toLowerCase()}`);
    }
    return a;
  }

  private resolveScore(a: Achievement, override?: number): number {
    if (override !== undefined) return Math.min(Math.max(override, 0), 10);
    // Default by type: lookup table closest to ACTIVITY_POINTS
    const fallback: Record<string, number> = {
      HACKATHON: 3,
      CERTIFICATE: 2,
      STARTUP: 5,
      VOLUNTEER: 3,
      MENTORING: 3,
      EMPLOYMENT: 5,
      OTHER: 1,
    };
    return fallback[a.type] ?? 1;
  }
}
