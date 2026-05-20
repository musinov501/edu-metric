import { Module } from '@nestjs/common';
import { PenaltiesController } from './penalties.controller';
import { PenaltiesService } from './penalties.service';
import { ScoringModule } from '../scoring/scoring.module';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [ScoringModule, StudentsModule],
  controllers: [PenaltiesController],
  providers: [PenaltiesService],
  exports: [PenaltiesService],
})
export class PenaltiesModule {}
