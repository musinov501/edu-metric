'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { NAV_BY_ROLE } from '@/lib/constants/nav';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-card">
      <div className="flex h-14 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GraduationCap className="h-4 w-4" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight">EduMetric</div>
          <div className="text-[10px] text-muted-foreground">Scholarship intelligence</div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {!user ? (
          // Loading state — prevents a flash of "default STUDENT nav" when the
          // user is actually an admin/mentor/tutor mid-bootstrap.
          <div className="space-y-2 px-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : (
          (NAV_BY_ROLE[user.role] ?? []).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })
        )}
      </nav>

      <div className="border-t px-6 py-3 text-[11px] text-muted-foreground">
        v0.1.0
        {user && <> · {user.role.toLowerCase().replace('_', ' ')}</>}
      </div>
    </aside>
  );
}
