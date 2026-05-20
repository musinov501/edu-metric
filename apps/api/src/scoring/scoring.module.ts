import { Module, forwardRef } from '@nestjs/common';
import { ScoringController } from './scoring.controller';
import { ScoringService } from './scoring.service';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [forwardRef(() => StudentsModule)],
  controllers: [ScoringController],
  providers: [ScoringService],
  exports: [ScoringService],
})
export class ScoringModule {}
