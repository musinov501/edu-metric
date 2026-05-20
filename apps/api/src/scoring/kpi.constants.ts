/**
 * Canonical KPI scoring constants for the backend.
 * Mirrors @edumetric/shared/constants/scoring; kept locally to avoid a
 * cross-package import loop while business logic stabilizes.
 *
 * Source-of-truth: Group 3 architecture.
 */

export const KPI_MAX = {
  ACADEMIC: 40,
  ATTENDANCE: 20,
  ASSIGNMENT: 15,
  ACTIVITY: 10,
  TUTOR: 5,
  DISCIPLINE: 10,
  PENALTY: 20,            // absolute, applied as negative
  RECOVERY: 10,
  EMPLOYMENT_BONUS: 10,
} as const;

export const ASSIGNMENT_WEIGHTS = {
  COMPLETION: 0.30,
  QUALITY: 0.30,
  ORIGINALITY: 0.25,
  DEADLINE: 0.15,
} as const;

/** GPA % below this auto-rejects scholarship. */
export const GPA_AUTO_REJECT_BELOW = 80;

/** Final score below this means NOT ELIGIBLE (but not auto-rejected). */
export const FINAL_SCORE_MIN_ELIGIBLE = 80;

/** RecoveryPoints = min(|penalty|/2, 10) */
export function maxRecoveryFor(totalPenaltyAbs: number): number {
  return Math.min(totalPenaltyAbs / 2, KPI_MAX.RECOVERY);
}

/** Canonical activity point table (Group 3). */
export const ACTIVITY_POINTS: Record<string, number> = {
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
};

/** Discipline starts at 10 and floors at 0. */
export const DISCIPLINE_START = 10;
export const DISCIPLINE_MIN = 0;

/** Penalty severity → numeric range (negative). Group 3. */
export const PENALTY_SEVERITY_POINTS: Record<string, number> = {
  MINOR: 1,
  MEDIUM: 3,
  MAJOR: 5,
  CRITICAL: 12, // mid-point of [-10, -15]
};
