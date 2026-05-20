import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Recovery } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ActivityAction } from '../activity-logs/activity-action.enum';
import { ScoringService } from '../scoring/scoring.service';
import { StudentsService } from '../students/students.service';
import { maxRecoveryFor } from '../scoring/kpi.constants';
import {
  AssignRecoveryDto,
  CompleteRecoveryDto,
  RejectRecoveryDto,
} from './dto/recovery.dto';
import { AuthenticatedUser } from '../auth/strategies/jwt-payload.interface';

@Injectable()
export class RecoveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogs: ActivityLogsService,
    private readonly scoring: ScoringService,
    private readonly students: StudentsService,
  ) {}

  async assign(dto: AssignRecoveryDto, actor: AuthenticatedUser): Promise<Recovery> {
    await this.students.assertCanRead(dto.studentId, actor);

    const recovery = await this.prisma.recovery.create({
      data: {
        studentId: dto.studentId,
        assignedTask: dto.assignedTask,
      },
    });

    await this.activityLogs.log({
      actorId: actor.sub,
      targetStudentId: dto.studentId,
      action: ActivityAction.RECOVERY_ASSIGNED,
      description: `Recovery task assigned: ${dto.assignedTask}`,
      metadata: { recoveryId: recovery.id },
    });
    return recovery;
  }

  async complete(id: string, dto: CompleteRecoveryDto, actor: AuthenticatedUser): Promise<Recovery> {
    const recovery = await this.prisma.recovery.findUnique({ where: { id } });
    if (!recovery) throw new NotFoundException('Recovery not found');
    if (recovery.status !== 'PENDING') {
      throw new BadRequestException(`Recovery already ${recovery.status.toLowerCase()}`);
    }

    // Resolve cap for this student
    const penalties = await this.prisma.penalty.findMany({
      where: { studentId: recovery.studentId },
      select: { points: true },
    });
    const totalPenaltyAbs = penalties.reduce((s, p) => s + Math.abs(p.points), 0);
    const cap = maxRecoveryFor(totalPenaltyAbs);

    // How much has the student already recovered?
    const alreadyRecovered = await this.prisma.recovery.aggregate({
      where: { studentId: recovery.studentId, status: 'COMPLETED' },
      _sum: { recoveredPoints: true },
    });
    const remaining = Math.max(0, cap - (alreadyRecovered._sum.recoveredPoints ?? 0));

    const requested = dto.recoveredPoints ?? remaining;
    const recoveredPoints = Math.min(requested, remaining);

    const updated = await this.prisma.recovery.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        recoveredPoints,
        verifiedById: actor.sub,
        completedAt: new Date(),
      },
    });

    await this.activityLogs.log({
      actorId: actor.sub,
      targetStudentId: recovery.studentId,
      action: ActivityAction.RECOVERY_COMPLETED,
      description: `Recovery completed (+${recoveredPoints} points). Cap was ${cap}.`,
      metadata: { recoveryId: id, recoveredPoints, cap, requested },
    });

    await this.scoring.recalculate(recovery.studentId, {
      actorId: actor.sub,
      reason: `Recovery completed (+${recoveredPoints})`,
    });
    return updated;
  }

  async reject(id: string, dto: RejectRecoveryDto, actor: AuthenticatedUser): Promise<Recovery> {
    const recovery = await this.prisma.recovery.findUnique({ where: { id } });
    if (!recovery) throw new NotFoundException('Recovery not found');
    if (recovery.status !== 'PENDING') {
      throw new BadRequestException(`Recovery already ${recovery.status.toLowerCase()}`);
    }

    const updated = await this.prisma.recovery.update({
      where: { id },
      data: { status: 'REJECTED', verifiedById: actor.sub },
    });
    await this.activityLogs.log({
      actorId: actor.sub,
      targetStudentId: recovery.studentId,
      action: ActivityAction.RECOVERY_REJECTED,
      description: `Recovery rejected: ${dto.reason}`,
      metadata: { recoveryId: id, reason: dto.reason },
    });
    return updated;
  }

  async findByStudent(studentId: string, actor: AuthenticatedUser) {
    await this.students.assertCanRead(studentId, actor);
    return this.prisma.recovery.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
