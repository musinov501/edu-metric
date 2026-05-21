import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { configValidationSchema } from './config/config.schema';
import { PrismaModule } from './prisma/prisma.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { MentorsModule } from './mentors/mentors.module';
import { TutorsModule } from './tutors/tutors.module';
import { AchievementsModule } from './achievements/achievements.module';
import { AttendanceModule } from './attendance/attendance.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { TutorEvaluationsModule } from './tutor-evaluations/tutor-evaluations.module';
import { PenaltiesModule } from './penalties/penalties.module';
import { RecoveryModule } from './recovery/recovery.module';
import { EmploymentBonusesModule } from './employment-bonuses/employment-bonuses.module';
import { ScoringModule } from './scoring/scoring.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { UploadsModule } from './uploads/uploads.module';
import { AiModule } from './ai/ai.module';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: Number(config.get('THROTTLE_TTL') ?? 60) * 1000,
          limit: Number(config.get('THROTTLE_LIMIT') ?? 100),
        },
      ],
    }),
    PrismaModule,

    AuthModule,
    UsersModule,
    StudentsModule,
    MentorsModule,
    TutorsModule,
    AchievementsModule,
    AttendanceModule,
    AssignmentsModule,
    TutorEvaluationsModule,
    PenaltiesModule,
    RecoveryModule,
    EmploymentBonusesModule,
    ScoringModule,
    LeaderboardModule,
    AnalyticsModule,
    NotificationsModule,
    ActivityLogsModule,
    UploadsModule,
    AiModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
