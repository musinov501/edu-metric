import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PenaltiesService } from './penalties.service';
import { CreatePenaltyDto } from './dto/create-penalty.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/types/role.enum';
import { AuthenticatedUser } from '../auth/strategies/jwt-payload.interface';

@ApiTags('penalties')
@ApiBearerAuth()
@Controller('penalties')
export class PenaltiesController {
  constructor(private readonly penalties: PenaltiesService) {}

  @Post()
  @Roles(Role.MENTOR, Role.TUTOR, Role.ADMIN, Role.SUPER_ADMIN)
  create(@Body() dto: CreatePenaltyDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.penalties.create(dto, actor);
  }

  @Get('student/:studentId')
  findByStudent(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.penalties.findByStudent(studentId, actor);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.penalties.remove(id, actor);
  }
}
