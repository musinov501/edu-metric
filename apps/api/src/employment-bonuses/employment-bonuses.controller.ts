import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EmploymentBonusesService } from './employment-bonuses.service';
import { ApproveEmploymentDto, SubmitEmploymentDto } from './dto/employment.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/types/role.enum';
import { AuthenticatedUser } from '../auth/strategies/jwt-payload.interface';

@ApiTags('employment-bonuses')
@ApiBearerAuth()
@Controller('employment-bonuses')
export class EmploymentBonusesController {
  constructor(private readonly bonuses: EmploymentBonusesService) {}

  @Post()
  @Roles(Role.STUDENT)
  submit(@Body() dto: SubmitEmploymentDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.bonuses.submit(dto, actor);
  }

  @Get('pending')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  findPending() {
    return this.bonuses.findPending();
  }

  @Post(':id/approve')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveEmploymentDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.bonuses.approve(id, dto, actor);
  }

  @Get('student/:studentId')
  findByStudent(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.bonuses.findByStudent(studentId, actor);
  }
}
