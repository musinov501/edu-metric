import type { Role } from '@edumetric/shared';

/**
 * Canonical role → landing-page map (Group 5 spec).
 */
export const ROLE_REDIRECTS: Record<Role, string> = {
  STUDENT: '/dashboard',
  MENTOR: '/mentor/dashboard',
  TUTOR: '/tutor/dashboard',
  ADMIN: '/admin/overview',
  SUPER_ADMIN: '/admin/overview',
  GUEST: '/guest/leaderboard',
};

export const PUBLIC_ROUTES = ['/', '/login', '/register', '/guest'];
