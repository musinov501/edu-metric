import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { BulkAttendanceDto, MarkAttendanceDto } from './dto/mark-attendance.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/types/role.enum';
import { AuthenticatedUser } from '../auth/strategies/jwt-payload.interface';

@ApiTags('attendance')
@ApiBearerAuth()
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendance: AttendanceService) {}

  @Post()
  @Roles(Role.MENTOR, Role.ADMIN, Role.SUPER_ADMIN)
  mark(@Body() dto: MarkAttendanceDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.attendance.mark(dto, actor);
  }

  @Post('bulk')
  @Roles(Role.MENTOR, Role.ADMIN, Role.SUPER_ADMIN)
  bulk(@Body() dto: BulkAttendanceDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.attendance.bulk(dto, actor);
  }

  @Get('student/:studentId')
  findByStudent(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.attendance.findByStudent(studentId, actor);
  }
}
