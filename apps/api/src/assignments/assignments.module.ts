import { Module } from '@nestjs/common';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { ScoringModule } from '../scoring/scoring.module';
import { StudentsModule } from '../students/students.module';
import { PenaltiesModule } from '../penalties/penalties.module';

@Module({
  imports: [ScoringModule, StudentsModule, PenaltiesModule],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
