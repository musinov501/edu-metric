import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Penalty } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ActivityAction } from '../activity-logs/activity-action.enum';
import { ScoringService } from '../scoring/scoring.service';
import { StudentsService } from '../students/students.service';
import { CreatePenaltyDto } from './dto/create-penalty.dto';
import { PENALTY_SEVERITY_POINTS } from '../scoring/kpi.constants';
import { AuthenticatedUser } from '../auth/strategies/jwt-payload.interface';
import { Role } from '../common/types/role.enum';

@Injectable()
export class PenaltiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogs: ActivityLogsService,
    private readonly scoring: ScoringService,
    private readonly students: StudentsService,
  ) {}

  async create(dto: CreatePenaltyDto, actor: AuthenticatedUser): Promise<Penalty> {
    // Mentor/Tutor must have permission to act on this student
    if (actor.role === Role.MENTOR || actor.role === Role.TUTOR) {
      await this.students.assertCanRead(dto.studentId, actor);
    }

    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
      select: { id: true, user: { select: { fullName: true } } },
    });
    if (!student) throw new NotFoundException('Student not found');

    const points = dto.points ?? PENALTY_SEVERITY_POINTS[dto.severity] ?? 1;

    const penalty = await this.prisma.penalty.create({
      data: {
        studentId: dto.studentId,
        type: dto.type,
        severity: dto.severity,
        reason: dto.reason,
        points,
        issuedById: actor.sub,
      },
    });

    await this.activityLogs.log({
      actorId: actor.sub,
      targetStudentId: dto.studentId,
      action: ActivityAction.PENALTY_ADDED,
      description: `Penalty issued (${dto.severity} · ${dto.type}): ${dto.reason}`,
      metadata: { penaltyId: penalty.id, type: dto.type, severity: dto.severity, points },
    });

    await this.scoring.recalculate(dto.studentId, {
      actorId: actor.sub,
      reason: `Penalty added: ${dto.type} (${dto.severity})`,
    });

    return penalty;
  }

  async findByStudent(studentId: string, actor: AuthenticatedUser) {
    await this.students.assertCanRead(studentId, actor);
    return this.prisma.penalty.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      include: {
        issuedBy: { select: { id: true, fullName: true, role: true } },
      },
    });
  }

  async remove(id: string, actor: AuthenticatedUser): Promise<{ id: string }> {
    const p = await this.prisma.penalty.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Penalty not found');
    if (actor.role !== Role.ADMIN && actor.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only admins can remove penalties');
    }

    await this.prisma.penalty.delete({ where: { id } });

    await this.activityLogs.log({
      actorId: actor.sub,
      targetStudentId: p.studentId,
      action: ActivityAction.PENALTY_REMOVED,
      description: `Penalty removed (was ${p.severity} · ${p.type})`,
      metadata: { penaltyId: id, originalPoints: p.points },
    });

    await this.scoring.recalculate(p.studentId, {
      actorId: actor.sub,
      reason: `Penalty removed: ${p.type}`,
    });

    return { id };
  }
}
