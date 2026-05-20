import { Module } from '@nestjs/common';
import { TutorEvaluationsController } from './tutor-evaluations.controller';
import { TutorEvaluationsService } from './tutor-evaluations.service';
import { ScoringModule } from '../scoring/scoring.module';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [ScoringModule, StudentsModule],
  controllers: [TutorEvaluationsController],
  providers: [TutorEvaluationsService],
  exports: [TutorEvaluationsService],
})
export class TutorEvaluationsModule {}
