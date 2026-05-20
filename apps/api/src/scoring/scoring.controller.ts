import { Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ScoringService } from './scoring.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/types/role.enum';
import { AuthenticatedUser } from '../auth/strategies/jwt-payload.interface';
import { StudentsService } from '../students/students.service';

@ApiTags('kpi')
@ApiBearerAuth()
@Controller('kpi')
export class ScoringController {
  constructor(
    private readonly scoring: ScoringService,
    private readonly students: StudentsService,
  ) {}

  /** Force-recompute a student's KPI. Admin-triggered or system-internal. */
  @Post('calculate/:studentId')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  recalculate(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.scoring.recalculate(studentId, {
      actorId: actor.sub,
      reason: 'Manual admin recalculation',
    });
  }

  /** Current breakdown for a student. */
  @Get('student/:studentId')
  async getBreakdown(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    await this.students.assertCanRead(studentId, actor);
    return this.scoring.getCurrent(studentId);
  }

  /** Snapshot history. */
  @Get('student/:studentId/history')
  async getHistory(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    await this.students.assertCanRead(studentId, actor);
    return this.scoring.getHistory(studentId);
  }
}
