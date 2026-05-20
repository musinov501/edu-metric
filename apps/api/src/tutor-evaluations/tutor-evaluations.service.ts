import { Injectable } from '@nestjs/common';
import { TutorEvaluation } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ActivityAction } from '../activity-logs/activity-action.enum';
import { ScoringService } from '../scoring/scoring.service';
import { StudentsService } from '../students/students.service';
import { CreateTutorEvaluationDto } from './dto/create-tutor-evaluation.dto';
import { AuthenticatedUser } from '../auth/strategies/jwt-payload.interface';

@Injectable()
export class TutorEvaluationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogs: ActivityLogsService,
    private readonly scoring: ScoringService,
    private readonly students: StudentsService,
  ) {}

  async create(dto: CreateTutorEvaluationDto, actor: AuthenticatedUser): Promise<TutorEvaluation> {
    await this.students.assertCanRead(dto.studentId, actor);

    const evaluation = await this.prisma.tutorEvaluation.create({
      data: {
        studentId: dto.studentId,
        tutorId: actor.sub,
        ethics: dto.ethics,
        communication: dto.communication,
        socialActivity: dto.socialActivity,
        discipline: dto.discipline,
        motivation: dto.motivation,
        notes: dto.notes,
      },
    });

    const avg =
      (dto.ethics + dto.communication + dto.socialActivity + dto.discipline + dto.motivation) / 5;

    await this.activityLogs.log({
      actorId: actor.sub,
      targetStudentId: dto.studentId,
      action: ActivityAction.TUTOR_EVALUATION_RECORDED,
      description: `Tutor evaluation recorded (avg ${avg.toFixed(2)}/5)`,
      metadata: {
        ethics: dto.ethics,
        communication: dto.communication,
        socialActivity: dto.socialActivity,
        discipline: dto.discipline,
        motivation: dto.motivation,
        average: avg,
      },
    });

    await this.scoring.recalculate(dto.studentId, {
      actorId: actor.sub,
      reason: 'Tutor evaluation recorded',
    });
    return evaluation;
  }

  async findByStudent(studentId: string, actor: AuthenticatedUser) {
    await this.students.assertCanRead(studentId, actor);
    return this.prisma.tutorEvaluation.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      include: {
        tutor: { select: { id: true, fullName: true } },
      },
    });
  }
}
