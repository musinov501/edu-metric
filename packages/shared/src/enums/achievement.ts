export type AchievementType =
  | 'HACKATHON'
  | 'CERTIFICATE'
  | 'STARTUP'
  | 'VOLUNTEER'
  | 'MENTORING'
  | 'EMPLOYMENT'
  | 'OTHER';

export type AchievementStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUIRED';

export const ACHIEVEMENT_STATUS_LABELS: Record<AchievementStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  REVISION_REQUIRED: 'Needs Revision',
};
