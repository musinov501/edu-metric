import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AchievementsService } from './achievements.service';
import { UploadAchievementDto } from './dto/upload-achievement.dto';
import {
  ApproveAchievementDto,
  RejectAchievementDto,
  RevisionAchievementDto,
} from './dto/approve-achievement.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/types/role.enum';
import { AuthenticatedUser } from '../auth/strategies/jwt-payload.interface';

@ApiTags('achievements')
@ApiBearerAuth()
@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievements: AchievementsService) {}

  @Post('upload')
  @Roles(Role.STUDENT)
  upload(@Body() dto: UploadAchievementDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.achievements.upload(dto, actor);
  }

  @Get('pending')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  findPending(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.achievements.findPending({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('student/:studentId')
  findByStudent(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.achievements.findByStudent(studentId, actor);
  }

  @Post(':id/approve')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveAchievementDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.achievements.approve(id, dto, actor);
  }

  @Post(':id/reject')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectAchievementDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.achievements.reject(id, dto, actor);
  }

  @Post(':id/request-revision')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  requestRevision(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RevisionAchievementDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.achievements.requestRevision(id, dto, actor);
  }
}
