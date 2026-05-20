import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '../types/role.enum';

/**
 * Enforces: students can only access their own data;
 * mentors/tutors can only access assigned students;
 * admins/super-admins bypass.
 *
 * Expects the route param `:id` or `:studentId` to identify the target student.
 * Concrete cross-checks (assignedGroups, etc.) live in the relevant services.
 */
@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) throw new ForbiddenException();

    if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) return true;

    const targetId = req.params.id ?? req.params.studentId;
    if (user.role === Role.STUDENT && user.studentId !== targetId) {
      throw new ForbiddenException('Students may only access their own data');
    }
    // Mentors/Tutors: leave the fine-grained assignment check to the service layer
    return true;
  }
}
