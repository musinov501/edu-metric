import { Module } from '@nestjs/common';
import { EmploymentBonusesController } from './employment-bonuses.controller';
import { EmploymentBonusesService } from './employment-bonuses.service';
import { ScoringModule } from '../scoring/scoring.module';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [ScoringModule, StudentsModule],
  controllers: [EmploymentBonusesController],
  providers: [EmploymentBonusesService],
  exports: [EmploymentBonusesService],
})
export class EmploymentBonusesModule {}
