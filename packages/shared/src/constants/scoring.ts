/**
 * Canonical KPI scoring constants. Source of truth for both apps.
 * Derived from Group 3 architecture.
 */

export const KPI_MAX = {
  ACADEMIC: 40,
  ATTENDANCE: 20,
  ASSIGNMENT: 15,
  ACTIVITY: 10,
  TUTOR: 5,
  DISCIPLINE: 10,
  PENALTY: -20,
  RECOVERY: 10,
  EMPLOYMENT_BONUS: 10,
} as const;

/**
 * Assignment weights (must sum to 1.0).
 */
export const ASSIGNMENT_WEIGHTS = {
  COMPLETION: 0.30,
  QUALITY: 0.30,
  ORIGINALITY: 0.25,
  DEADLINE: 0.15,
} as const;

/**
 * Activity point table (Group 3).
 */
export const ACTIVITY_POINTS = {
  HACKATHON_PARTICIPATION: 1,
  HACKATHON_WINNER: 3,
  STARTUP_PROJECT: 5,
  MENTORING_WEAK_STUDENTS: 3,
  PDP_ONLINE_CERTIFICATE: 2,
  PDP_OFFLINE_CERTIFICATE: 3,
  NATIONAL_IT_CERTIFICATE: 2,
  ENGLISH_CERTIFICATE: 3,
  INTERNATIONAL_IT_CERTIFICATE: 5,
  PDP_ECOSYSTEM_WORK: 2,
} as const;

/**
 * Disqualification thresholds.
 */
export const SCHOLARSHIP_RULES = {
  GPA_AUTO_REJECT_BELOW: 80,        // GPA % below this → auto REJECTED
  FINAL_SCORE_MIN_ELIGIBLE: 80,     // Below this → NOT_ELIGIBLE
} as const;

/**
 * Tie-break order for the leaderboard (Group 3, 5-tier).
 */
export const LEADERBOARD_TIEBREAKS = [
  'finalScore',
  'gpa',
  'attendancePercent',
  'disciplineScore',
  'activityScore',
] as const;

export type LeaderboardTiebreak = (typeof LEADERBOARD_TIEBREAKS)[number];

/**
 * Recovery cap formula:
 *   RecoveryPoints = min(|totalPenalty| / 2, 10)
 */
export function maxRecoveryFor(totalPenaltyAbs: number): number {
  return Math.min(totalPenaltyAbs / 2, KPI_MAX.RECOVERY);
}
