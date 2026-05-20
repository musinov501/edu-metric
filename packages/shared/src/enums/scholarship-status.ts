export type ScholarshipStatus = 'ELIGIBLE' | 'AT_RISK' | 'REJECTED' | 'UNDER_REVIEW';

export const SCHOLARSHIP_LABELS: Record<ScholarshipStatus, string> = {
  ELIGIBLE: 'Eligible',
  AT_RISK: 'At Risk',
  REJECTED: 'Rejected',
  UNDER_REVIEW: 'Under Review',
};
