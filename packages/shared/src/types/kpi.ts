/**
 * Canonical KPI breakdown shape. Used by:
 *  - backend KPI engine (scoring module)
 *  - frontend profile/leaderboard "why" panels
 *
 * NEVER ship a "totalScore-only" object. Always emit the full breakdown
 * so the UI can render transparent explanations.
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

/**
 * Single explainable entry rendered on profile/leaderboard.
 *
 *   { kind: 'POSITIVE', label: 'Excellent attendance', detail: '96% over 12 weeks' }
 */
export interface ExplainableScoreEntry {
  kind: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  label: string;
  detail?: string;
}
