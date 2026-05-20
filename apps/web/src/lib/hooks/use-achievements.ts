'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { AchievementRow, PaginatedResponse } from '@/lib/api/types';

export function usePendingAchievements() {
  return useQuery({
    queryKey: ['achievements', 'pending'],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<AchievementRow>>('/achievements/pending');
      return data;
    },
  });
}

export interface UploadAchievementInput {
  type: 'HACKATHON' | 'CERTIFICATE' | 'STARTUP' | 'VOLUNTEER' | 'MENTORING' | 'EMPLOYMENT' | 'OTHER';
  title: string;
  description?: string;
  fileUrl?: string;
  externalLink?: string;
  fileHash?: string;
  pointsKey?: string;
}

export function useUploadAchievement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UploadAchievementInput) => {
      const { data } = await apiClient.post<AchievementRow>('/achievements/upload', input);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['achievements'] });
    },
  });
}

export function useApproveAchievement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, score, notes }: { id: string; score?: number; notes?: string }) => {
      const { data } = await apiClient.post<AchievementRow>(`/achievements/${id}/approve`, { score, notes });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['achievements'] });
      qc.invalidateQueries({ queryKey: ['leaderboard'] });
      qc.invalidateQueries({ queryKey: ['kpi'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useRejectAchievement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data } = await apiClient.post<AchievementRow>(`/achievements/${id}/reject`, { reason });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['achievements'] }),
  });
}
