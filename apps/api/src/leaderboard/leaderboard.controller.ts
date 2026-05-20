import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboard: LeaderboardService) {}

  /** Public leaderboard — guests can see this. */
  @Public()
  @Get()
  list(
    @Query('faculty') faculty?: string,
    @Query('group') group?: string,
    @Query('semester') semester?: string,
    @Query('limit') limit?: string,
  ) {
    return this.leaderboard.getLeaderboard({
      faculty,
      group,
      semester,
      limit: limit ? Number(limit) : undefined,
    });
  }

  /** Explainable breakdown for a single student — also public. */
  @Public()
  @Get('student/:studentId/why')
  explain(@Param('studentId', ParseUUIDPipe) studentId: string) {
    return this.leaderboard.explainStudent(studentId);
  }
}
