'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type {
  PaginatedResponse,
  StudentRow,
  ActivityLogRow,
  KpiBreakdown,
  AchievementRow,
  PenaltyRow,
} from '@/lib/api/types';

export interface StudentsQuery {
  page?: number;
  limit?: number;
  faculty?: string;
  group?: string;
  scholarshipStatus?: 'ELIGIBLE' | 'AT_RISK' | 'REJECTED' | 'UNDER_REVIEW';
  search?: string;
  sort?: string;
}

export function useStudents(query: StudentsQuery = {}) {
  return useQuery({
    queryKey: ['students', query],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<StudentRow>>('/students', {
        params: query,
      });
      return data;
    },
    staleTime: 30_000,
  });
}

export function useStudent(id: string | undefined) {
  return useQuery({
    enabled: Boolean(id),
    queryKey: ['students', id],
    queryFn: async () => {
      const { data } = await apiClient.get<StudentRow>(`/students/${id}`);
      return data;
    },
  });
}

export function useStudentKpi(id: string | undefined) {
  return useQuery({
    enabled: Boolean(id),
    queryKey: ['kpi', id],
    queryFn: async () => {
      const { data } = await apiClient.get<KpiBreakdown | null>(`/kpi/student/${id}`);
      return data;
    },
  });
}

export function useStudentActivity(id: string | undefined) {
  return useQuery({
    enabled: Boolean(id),
    queryKey: ['students', id, 'activity'],
    queryFn: async () => {
      const { data } = await apiClient.get<ActivityLogRow[]>(`/students/${id}/activity`);
      return data;
    },
  });
}

export function useStudentAchievements(id: string | undefined) {
  return useQuery({
    enabled: Boolean(id),
    queryKey: ['achievements', id],
    queryFn: async () => {
      const { data } = await apiClient.get<AchievementRow[]>(`/achievements/student/${id}`);
      return data;
    },
  });
}

export function useStudentPenalties(id: string | undefined) {
  return useQuery({
    enabled: Boolean(id),
    queryKey: ['penalties', id],
    queryFn: async () => {
      const { data } = await apiClient.get<PenaltyRow[]>(`/penalties/student/${id}`);
      return data;
    },
  });
}
