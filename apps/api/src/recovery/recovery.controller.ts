import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RecoveryService } from './recovery.service';
import {
  AssignRecoveryDto,
  CompleteRecoveryDto,
  RejectRecoveryDto,
} from './dto/recovery.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/types/role.enum';
import { AuthenticatedUser } from '../auth/strategies/jwt-payload.interface';

@ApiTags('recovery')
@ApiBearerAuth()
@Controller('recovery')
export class RecoveryController {
  constructor(private readonly recovery: RecoveryService) {}

  @Post('assign')
  @Roles(Role.TUTOR, Role.ADMIN, Role.SUPER_ADMIN)
  assign(@Body() dto: AssignRecoveryDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.recovery.assign(dto, actor);
  }

  @Post(':id/complete')
  @Roles(Role.TUTOR, Role.ADMIN, Role.SUPER_ADMIN)
  complete(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompleteRecoveryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.recovery.complete(id, dto, actor);
  }

  @Post(':id/reject')
  @Roles(Role.TUTOR, Role.ADMIN, Role.SUPER_ADMIN)
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectRecoveryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.recovery.reject(id, dto, actor);
  }

  @Get('student/:studentId')
  findByStudent(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.recovery.findByStudent(studentId, actor);
  }
}
