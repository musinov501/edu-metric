import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { ScoringModule } from '../scoring/scoring.module';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [ScoringModule, StudentsModule],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
