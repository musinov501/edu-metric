'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { LeaderboardEntry, LeaderboardWhy } from '@/lib/api/types';

export interface LeaderboardFilter {
  faculty?: string;
  group?: string;
  semester?: string;
  limit?: number;
}

export function useLeaderboard(filter: LeaderboardFilter = {}) {
  return useQuery({
    queryKey: ['leaderboard', filter],
    queryFn: async () => {
      const { data } = await apiClient.get<LeaderboardEntry[]>('/leaderboard', { params: filter });
      return data;
    },
    staleTime: 30_000,
  });
}

export function useLeaderboardWhy(studentId: string | undefined) {
  return useQuery({
    enabled: Boolean(studentId),
    queryKey: ['leaderboard', 'why', studentId],
    queryFn: async () => {
      const { data } = await apiClient.get<LeaderboardWhy>(`/leaderboard/student/${studentId}/why`);
      return data;
    },
  });
}
