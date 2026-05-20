import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TutorEvaluationsService } from './tutor-evaluations.service';
import { CreateTutorEvaluationDto } from './dto/create-tutor-evaluation.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/types/role.enum';
import { AuthenticatedUser } from '../auth/strategies/jwt-payload.interface';

@ApiTags('tutor-evaluations')
@ApiBearerAuth()
@Controller('tutor-evaluations')
export class TutorEvaluationsController {
  constructor(private readonly tutorEvaluations: TutorEvaluationsService) {}

  @Post()
  @Roles(Role.TUTOR, Role.ADMIN, Role.SUPER_ADMIN)
  create(@Body() dto: CreateTutorEvaluationDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.tutorEvaluations.create(dto, actor);
  }

  @Get('student/:studentId')
  findByStudent(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tutorEvaluations.findByStudent(studentId, actor);
  }
}
