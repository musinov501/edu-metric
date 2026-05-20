/**
 * The 6 EduMetric roles. GUEST has no DB account — parents/visitors browse
 * the public leaderboard and limited stats without signing in.
 */
export type Role = 'STUDENT' | 'MENTOR' | 'TUTOR' | 'ADMIN' | 'SUPER_ADMIN' | 'GUEST';

export const ROLES: Role[] = ['STUDENT', 'MENTOR', 'TUTOR', 'ADMIN', 'SUPER_ADMIN', 'GUEST'];

export const ROLE_LABELS: Record<Role, string> = {
  STUDENT: 'Student',
  MENTOR: 'Mentor',
  TUTOR: 'Tutor',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
  GUEST: 'Guest',
};
