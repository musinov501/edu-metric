/**
 * Backend role enum — mirrors Prisma's `Role` enum exactly (5 values).
 *
 * NOTE: GUEST is intentionally NOT in this list. Guests have no DB user —
 * they hit public endpoints anonymously. The 6th "GUEST" role only exists
 * in the frontend (@edumetric/shared) for client-side routing.
 */
export enum Role {
  STUDENT = 'STUDENT',
  MENTOR = 'MENTOR',
  TUTOR = 'TUTOR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}
