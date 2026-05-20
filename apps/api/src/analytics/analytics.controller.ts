import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/types/role.enum';
import { AuthenticatedUser } from '../auth/strategies/jwt-payload.interface';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('university')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  university() {
    return this.analytics.universityOverview();
  }

  @Get('groups')
  @Roles(Role.MENTOR, Role.TUTOR, Role.ADMIN, Role.SUPER_ADMIN)
  groups() {
    return this.analytics.byGroup();
  }

  @Get('student/:studentId')
  student(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.analytics.studentProfile(studentId, actor);
  }

  @Get('risk')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  risk() {
    return this.analytics.riskRoster();
  }
}
