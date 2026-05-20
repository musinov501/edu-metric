import type { ScholarshipStatus } from '../enums/scholarship-status';
import type { ExplainableScoreEntry, KpiBreakdown } from './kpi';

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  fullName: string;
  avatar?: string;
  faculty: string;
  group: string;
  gpa: number;
  attendancePercent: number;
  finalScore: number;
  scholarshipStatus: ScholarshipStatus;
  breakdown: KpiBreakdown;
  why: ExplainableScoreEntry[];
}
