/**
 * Penalty taxonomy.
 *
 * NOTE on naming: Group 2 architecture (DB schema) uses `DISRESPECT`.
 * Group 5 workflow text uses "Misconduct" as the human label.
 * We keep `DISRESPECT` as the canonical enum value and treat
 * "Misconduct" as the display label where it reads more naturally.
 */
export type PenaltyType =
  | 'LATE'
  | 'PHONE_USAGE'
  | 'ABSENCE'
  | 'PLAGIARISM'
  | 'DORMITORY_VIOLATION'
  | 'DISRESPECT'
  | 'OTHER';

export type PenaltySeverity = 'MINOR' | 'MEDIUM' | 'MAJOR' | 'CRITICAL';

export const PENALTY_SEVERITY_RANGE: Record<PenaltySeverity, [number, number]> = {
  MINOR: [-1, -1],
  MEDIUM: [-3, -3],
  MAJOR: [-5, -5],
  CRITICAL: [-15, -10],
};
