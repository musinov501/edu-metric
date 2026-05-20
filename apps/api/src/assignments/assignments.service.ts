import { Injectable, NotFoundException } from '@nestjs/common';
import { Assignment } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ActivityAction } from '../activity-logs/activity-action.enum';
import { ScoringService } from '../scoring/scoring.service';
import { StudentsService } from '../students/students.service';
import { PenaltiesService } from '../penalties/penalties.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { FlagPlagiarismDto } from './dto/plagiarism.dto';
import { ASSIGNMENT_WEIGHTS } from '../scoring/kpi.constants';
import { AuthenticatedUser } from '../auth/strategies/jwt-payload.interface';

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogs: ActivityLogsService,
    private readonly scoring: ScoringService,
    private readonly students: StudentsService,
    private readonly penalties: PenaltiesService,
  ) {}

  async create(dto: CreateAssignmentDto, actor: AuthenticatedUser): Promise<Assignment> {
    await this.students.assertCanRead(dto.studentId, actor);

    const totalScore = this.weightedTotal(dto);

    const assignment = await this.prisma.assignment.create({
      data: {
        studentId: dto.studentId,
        subject: dto.subject,
        title: dto.title,
        completionScore: dto.completionScore,
        qualityScore: dto.qualityScore,
        originalityScore: dto.originalityScore,
        deadlineScore: dto.deadlineScore,
        totalScore,
        reviewedById: actor.sub,
      },
    });

    await this.activityLogs.log({
      actorId: actor.sub,
      targetStudentId: dto.studentId,
      action: ActivityAction.ASSIGNMENT_RECORDED,
      description: `Assignment "${dto.title}" scored (total ${totalScore.toFixed(1)}/100)`,
      metadata: { assignmentId: assignment.id, totalScore, subject: dto.subject },
    });

    await this.scoring.recalculate(dto.studentId, {
      actorId: actor.sub,
      reason: `Assignment recorded: ${dto.title}`,
    });
    return assignment;
  }

  async flagPlagiarism(
    id: string,
    dto: FlagPlagiarismDto,
    actor: AuthenticatedUser,
  ): Promise<Assignment> {
    const existing = await this.prisma.assignment.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Assignment not found');

    const updated = await this.prisma.assignment.update({
      where: { id },
      data: {
        originalityScore: 0,
        plagiarismFlag: true,
        totalScore: this.weightedTotal({
          completionScore: existing.completionScore,
          qualityScore: existing.qualityScore,
          originalityScore: 0,
          deadlineScore: existing.deadlineScore,
        }),
      },
    });

    await this.activityLogs.log({
      actorId: actor.sub,
      targetStudentId: existing.studentId,
      action: ActivityAction.ASSIGNMENT_PLAGIARISM_FLAGGED,
      description: `Plagiarism flagged on "${existing.title}": ${dto.reason}`,
      metadata: { assignmentId: id, reason: dto.reason },
    });

    // Auto-trigger plagiarism penalty (CRITICAL severity per Group 3).
    await this.penalties.create(
      {
        studentId: existing.studentId,
        type: 'PLAGIARISM',
        severity: 'CRITICAL',
        reason: `Auto-penalty: plagiarism on assignment "${existing.title}" — ${dto.reason}`,
      },
      actor,
    );
    return updated;
  }

  async findByStudent(studentId: string, actor: AuthenticatedUser) {
    await this.students.assertCanRead(studentId, actor);
    return this.prisma.assignment.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private weightedTotal(scores: {
    completionScore: number;
    qualityScore: number;
    originalityScore: number;
    deadlineScore: number;
  }): number {
    return (
      scores.completionScore * ASSIGNMENT_WEIGHTS.COMPLETION +
      scores.qualityScore * ASSIGNMENT_WEIGHTS.QUALITY +
      scores.originalityScore * ASSIGNMENT_WEIGHTS.ORIGINALITY +
      scores.deadlineScore * ASSIGNMENT_WEIGHTS.DEADLINE
    );
  }
}
