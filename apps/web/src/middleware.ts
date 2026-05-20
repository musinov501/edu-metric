import { NextResponse, type NextRequest } from 'next/server';
import { PUBLIC_ROUTES, ROLE_REDIRECTS } from '@/lib/constants/routes';

type Role = 'STUDENT' | 'MENTOR' | 'TUTOR' | 'ADMIN' | 'SUPER_ADMIN';

interface JwtPayload {
  sub: string;
  email?: string;
  role: Role;
  studentId?: string;
  exp?: number;
}

/**
 * Per Group 1/2 RBAC: each authenticated route is owned by a specific set
 * of roles. Anything else gets bounced to the role's home page.
 *
 *   /admin/**           ADMIN, SUPER_ADMIN
 *   /super-admin/**     SUPER_ADMIN only
 *   /mentor/**          MENTOR, ADMIN, SUPER_ADMIN
 *   /tutor/**           TUTOR, ADMIN, SUPER_ADMIN
 *   /dashboard, /profile, /achievements,
 *   /leaderboard, /analytics, /notifications,
 *   /settings (student bucket)
 *                       STUDENT only (admins use /admin/overview, etc.)
 *   /account/**         any authenticated user
 *   /guest/**           public (handled below)
 */
const ROUTE_RULES: Array<{ test: (p: string) => boolean; allow: Role[] }> = [
  { test: (p) => p.startsWith('/super-admin'),                allow: ['SUPER_ADMIN'] },
  { test: (p) => p.startsWith('/admin'),                      allow: ['ADMIN', 'SUPER_ADMIN'] },
  { test: (p) => p.startsWith('/mentor'),                     allow: ['MENTOR', 'ADMIN', 'SUPER_ADMIN'] },
  { test: (p) => p.startsWith('/tutor'),                      allow: ['TUTOR', 'ADMIN', 'SUPER_ADMIN'] },
  {
    test: (p) =>
      /^\/(dashboard|profile|achievements|leaderboard|analytics|notifications|settings)(\/|$)/.test(
        p,
      ),
    allow: ['STUDENT'],
  },
];

/**
 * Decode a JWT payload without verifying the signature. We only need to
 * read the `role` claim for routing — full verification happens server-side
 * on the API where the secret lives. Returns null if the token is malformed
 * or expired.
 */
function decode(token: string): JwtPayload | null {
  try {
    const [, payloadB64] = token.split('.');
    if (!payloadB64) return null;
    // base64url → base64
    const padded = payloadB64.replace(/-/g, '+').replace(/_/g, '/').padEnd(
      Math.ceil(payloadB64.length / 4) * 4,
      '=',
    );
    const decoded = atob(padded);
    const payload = JSON.parse(decoded) as JwtPayload;
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow Next internals + the public-route allowlist
  if (PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))) {
    return NextResponse.next();
  }

  // Account routes are gated by "any authenticated user"
  const sessionCookie = req.cookies.get('em_session');
  if (!sessionCookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  const payload = decode(sessionCookie.value);
  if (!payload) {
    // Stale/garbage token — clear it and force re-login
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    const res = NextResponse.redirect(url);
    res.cookies.delete('em_session');
    return res;
  }

  // Account routes only require authentication, not a specific role
  if (pathname.startsWith('/account')) return NextResponse.next();

  // Find the rule that owns this path; if none, leave it alone
  const rule = ROUTE_RULES.find((r) => r.test(pathname));
  if (!rule) return NextResponse.next();

  if (!rule.allow.includes(payload.role)) {
    // Wrong role → bounce to that role's home
    const url = req.nextUrl.clone();
    url.pathname = ROLE_REDIRECTS[payload.role] ?? '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|images|icons|.*\\.(?:png|jpg|jpeg|svg|ico)).*)'],
};
