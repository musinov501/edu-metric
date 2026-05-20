/**
 * Server-side KPI breakdown contract. Always emit the full breakdown,
 * never just totalScore. Group 3 transparency requirement.
 */
export interface KpiBreakdown {
  academicScore: number;       // 0-40
  attendanceScore: number;     // 0-20
  assignmentScore: number;     // 0-15
  activityScore: number;       // 0-10
  tutorScore: number;          // 0-5
  disciplineScore: number;     // 0-10
  penaltyScore: number;        // 0 .. -20
  recoveryScore: number;       // 0 .. +10
  employmentBonus: number;     // 0 .. +10
  finalScore: number;
}

export interface ExplainableScoreEntry {
  kind: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  label: string;
  detail?: string;
}

export interface ScholarshipDecision {
  status: 'ELIGIBLE' | 'AT_RISK' | 'REJECTED' | 'UNDER_REVIEW';
  reasons: string[];
}
