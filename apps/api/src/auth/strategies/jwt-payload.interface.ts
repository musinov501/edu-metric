import { Role } from '../../common/types/role.enum';

/**
 * Payload encoded into every JWT.
 * `studentId` is set only for STUDENT users (used by OwnershipGuard).
 */
export interface JwtPayload {
  sub: string;            // user id
  email: string;
  role: Role;
  studentId?: string;
}

/**
 * Shape attached to `request.user` after JwtStrategy validates.
 */
export interface AuthenticatedUser extends JwtPayload {}
