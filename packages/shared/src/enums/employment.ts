export type EmploymentType = 'INTERNSHIP' | 'PART_TIME' | 'FULL_TIME';

export const EMPLOYMENT_BONUS_RANGE: Record<EmploymentType, [number, number]> = {
  INTERNSHIP: [0, 5],
  PART_TIME: [5, 7],
  FULL_TIME: [7, 10],
};
