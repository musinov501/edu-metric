'use client';

import type { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { useAuthBootstrap } from '@/lib/hooks/use-auth';

/**
 * Sidebar + Topbar shell. Hydrates the auth store from /auth/me on mount so
 * every authenticated page knows who the user is.
 */
export function AppShell({ children }: { children: ReactNode }) {
  useAuthBootstrap();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 px-4 md:px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
