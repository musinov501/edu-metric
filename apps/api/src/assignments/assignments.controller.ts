import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { FlagPlagiarismDto } from './dto/plagiarism.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/types/role.enum';
import { AuthenticatedUser } from '../auth/strategies/jwt-payload.interface';

@ApiTags('assignments')
@ApiBearerAuth()
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignments: AssignmentsService) {}

  @Post()
  @Roles(Role.MENTOR, Role.ADMIN, Role.SUPER_ADMIN)
  create(@Body() dto: CreateAssignmentDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.assignments.create(dto, actor);
  }

  @Post(':id/flag-plagiarism')
  @Roles(Role.MENTOR, Role.ADMIN, Role.SUPER_ADMIN)
  flagPlagiarism(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: FlagPlagiarismDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.assignments.flagPlagiarism(id, dto, actor);
  }

  @Get('student/:studentId')
  findByStudent(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.assignments.findByStudent(studentId, actor);
  }
}
