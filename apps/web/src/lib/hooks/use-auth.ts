'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, type AuthUser } from '@/lib/api/auth';
import { useAuthStore } from '@/store/auth-store';

/**
 * Bootstrap hook — fetches /auth/me on first mount of an authenticated layout
 * and hydrates the Zustand store.
 *
 * If /auth/me ever errors (stale/invalid token), we proactively nuke the
 * React Query cache + auth store so no per-role data from the prior session
 * leaks into the next sign-in.
 */
export function useAuthBootstrap() {
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clear);
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.me(),
    staleTime: 5 * 60_000,
    retry: false,
  });

  // Detect "role changed since last bootstrap" and wipe cross-role caches so
  // an admin's student list doesn't briefly appear when a mentor signs in.
  useEffect(() => {
    if (!query.data) return;
    const fresh = query.data as AuthUser;
    if (user && user.id !== fresh.id) {
      qc.removeQueries({ predicate: (q) => q.queryKey[0] !== 'auth' });
    }
    setUser(fresh);
  }, [query.data, user, setUser, qc]);

  useEffect(() => {
    if (query.error) {
      clear();
      qc.clear();
    }
  }, [query.error, clear, qc]);

  return { user, isLoading: query.isLoading, error: query.error };
}
