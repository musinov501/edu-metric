import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EmploymentBonus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ActivityAction } from '../activity-logs/activity-action.enum';
import { ScoringService } from '../scoring/scoring.service';
import { StudentsService } from '../students/students.service';
import { ApproveEmploymentDto, SubmitEmploymentDto } from './dto/employment.dto';
import { Role } from '../common/types/role.enum';
import { AuthenticatedUser } from '../auth/strategies/jwt-payload.interface';

@Injectable()
export class EmploymentBonusesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogs: ActivityLogsService,
    private readonly scoring: ScoringService,
    private readonly students: StudentsService,
  ) {}

  async submit(dto: SubmitEmploymentDto, actor: AuthenticatedUser): Promise<EmploymentBonus> {
    if (actor.role !== Role.STUDENT || !actor.studentId) {
      throw new ForbiddenException('Only students can submit employment proofs');
    }
    const bonus = await this.prisma.employmentBonus.create({
      data: {
        studentId: actor.studentId,
        companyName: dto.companyName,
        employmentType: dto.employmentType,
        position: dto.position,
        proofFile: dto.proofFile,
        bonusPoints: 0,
      },
    });
    await this.activityLogs.log({
      actorId: actor.sub,
      targetStudentId: actor.studentId,
      action: ActivityAction.EMPLOYMENT_SUBMITTED,
      description: `Employment proof submitted: ${dto.companyName} · ${dto.position}`,
      metadata: { bonusId: bonus.id, type: dto.employmentType },
    });
    return bonus;
  }

  async findPending() {
    return this.prisma.employmentBonus.findMany({
      where: { approvedById: null },
      orderBy: { createdAt: 'asc' },
      include: {
        student: { include: { user: { select: { fullName: true, email: true } } } },
      },
    });
  }

  async approve(id: string, dto: ApproveEmploymentDto, actor: AuthenticatedUser): Promise<EmploymentBonus> {
    const bonus = await this.prisma.employmentBonus.findUnique({ where: { id } });
    if (!bonus) throw new NotFoundException('Employment bonus not found');
    if (bonus.approvedById) {
      throw new ForbiddenException('Employment bonus already approved');
    }

    const updated = await this.prisma.employmentBonus.update({
      where: { id },
      data: { bonusPoints: dto.bonusPoints, approvedById: actor.sub },
    });

    await this.activityLogs.log({
      actorId: actor.sub,
      targetStudentId: bonus.studentId,
      action: ActivityAction.EMPLOYMENT_APPROVED,
      description: `Employment bonus approved (+${dto.bonusPoints}) for ${bonus.companyName}`,
      metadata: { bonusId: id, bonusPoints: dto.bonusPoints },
    });

    await this.scoring.recalculate(bonus.studentId, {
      actorId: actor.sub,
      reason: `Employment bonus approved (+${dto.bonusPoints})`,
    });
    return updated;
  }

  async findByStudent(studentId: string, actor: AuthenticatedUser) {
    await this.students.assertCanRead(studentId, actor);
    return this.prisma.employmentBonus.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
