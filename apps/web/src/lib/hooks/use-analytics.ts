'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { UniversityOverview, GroupRow, AiInsight, StudentRow } from '@/lib/api/types';

export function useUniversityOverview() {
  return useQuery({
    queryKey: ['analytics', 'university'],
    queryFn: async () => {
      const { data } = await apiClient.get<UniversityOverview>('/analytics/university');
      return data;
    },
    staleTime: 60_000,
  });
}

export function useGroupAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'groups'],
    queryFn: async () => {
      const { data } = await apiClient.get<GroupRow[]>('/analytics/groups');
      return data;
    },
    staleTime: 60_000,
  });
}

export function useRiskRoster() {
  return useQuery({
    queryKey: ['analytics', 'risk'],
    queryFn: async () => {
      const { data } = await apiClient.get<StudentRow[]>('/analytics/risk');
      return data;
    },
  });
}

export function useStudentAi(studentId: string | undefined) {
  return useQuery({
    enabled: Boolean(studentId),
    queryKey: ['ai', 'student', studentId],
    queryFn: async () => {
      const { data } = await apiClient.get<AiInsight>(`/ai/insights/student/${studentId}`);
      return data;
    },
  });
}

export function useAdminAi() {
  return useQuery({
    queryKey: ['ai', 'admin'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ insights: string[]; source: string }>('/ai/insights/admin');
      return data;
    },
  });
}
