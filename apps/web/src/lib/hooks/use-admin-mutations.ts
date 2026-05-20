'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { PaginatedResponse, StudentRow, PenaltyRow } from '@/lib/api/types';

// ─── Students ────────────────────────────────────────────────

export interface CreateStudentInput {
  fullName: string;
  email: string;
  password: string;
  studentId: string;
  faculty: string;
  group: string;
  courseYear: number;
  gpa?: number;
  attendancePercent?: number;
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateStudentInput) => {
      const { data } = await apiClient.post<StudentRow>('/students', input);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      qc.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

// ─── Mentors / Tutors ────────────────────────────────────────

export interface MentorRow {
  id: string;
  userId: string;
  specialization?: string | null;
  assignedGroups: string[];
  createdAt: string;
  user: { id: string; fullName: string; email: string; avatar?: string | null };
}

export interface TutorRow {
  id: string;
  userId: string;
  assignedDormitory?: string | null;
  assignedGroups: string[];
  createdAt: string;
  user: { id: string; fullName: string; email: string; avatar?: string | null };
}

export function useMentors() {
  return useQuery({
    queryKey: ['mentors'],
    queryFn: async () => {
      const { data } = await apiClient.get<MentorRow[]>('/mentors');
      return data;
    },
  });
}

export function useTutors() {
  return useQuery({
    queryKey: ['tutors'],
    queryFn: async () => {
      const { data } = await apiClient.get<TutorRow[]>('/tutors');
      return data;
    },
  });
}

export function useCreateMentor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      fullName: string;
      email: string;
      password: string;
      specialization?: string;
      assignedGroups?: string[];
    }) => {
      const { data } = await apiClient.post<MentorRow>('/mentors', input);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mentors'] }),
  });
}

export function useCreateTutor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      fullName: string;
      email: string;
      password: string;
      assignedDormitory?: string;
      assignedGroups?: string[];
    }) => {
      const { data } = await apiClient.post<TutorRow>('/tutors', input);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tutors'] }),
  });
}

// ─── Penalties ───────────────────────────────────────────────

export interface IssuePenaltyInput {
  studentId: string;
  type: 'LATE' | 'PHONE_USAGE' | 'ABSENCE' | 'PLAGIARISM' | 'DORMITORY_VIOLATION' | 'DISRESPECT' | 'OTHER';
  severity: 'MINOR' | 'MEDIUM' | 'MAJOR' | 'CRITICAL';
  reason: string;
  points?: number;
}

export function useIssuePenalty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: IssuePenaltyInput) => {
      const { data } = await apiClient.post<PenaltyRow>('/penalties', input);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['penalties'] });
      qc.invalidateQueries({ queryKey: ['kpi'] });
      qc.invalidateQueries({ queryKey: ['leaderboard'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

// ─── Attendance ──────────────────────────────────────────────

export interface MarkAttendanceInput {
  studentId: string;
  subject: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
}

export function useMarkAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: MarkAttendanceInput) => {
      const { data } = await apiClient.post('/attendance', input);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      qc.invalidateQueries({ queryKey: ['kpi'] });
    },
  });
}

// ─── Assignments ─────────────────────────────────────────────

export interface RecordAssignmentInput {
  studentId: string;
  subject: string;
  title: string;
  completionScore: number;
  qualityScore: number;
  originalityScore: number;
  deadlineScore: number;
}

export function useRecordAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: RecordAssignmentInput) => {
      const { data } = await apiClient.post('/assignments', input);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kpi'] });
      qc.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

export function useFlagPlagiarism() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data } = await apiClient.post(`/assignments/${id}/flag-plagiarism`, { reason });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kpi'] });
      qc.invalidateQueries({ queryKey: ['penalties'] });
    },
  });
}

// ─── Tutor evaluations ───────────────────────────────────────

export interface TutorEvaluationInput {
  studentId: string;
  ethics: number;
  communication: number;
  socialActivity: number;
  discipline: number;
  motivation: number;
  notes?: string;
}

export function useRecordTutorEvaluation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TutorEvaluationInput) => {
      const { data } = await apiClient.post('/tutor-evaluations', input);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kpi'] });
      qc.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

// ─── Recovery ────────────────────────────────────────────────

export function useAssignRecovery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { studentId: string; assignedTask: string }) => {
      const { data } = await apiClient.post('/recovery/assign', input);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recoveries'] }),
  });
}

export function useCompleteRecovery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, recoveredPoints }: { id: string; recoveredPoints?: number }) => {
      const { data } = await apiClient.post(`/recovery/${id}/complete`, { recoveredPoints });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recoveries'] });
      qc.invalidateQueries({ queryKey: ['kpi'] });
    },
  });
}

export function useRecoveryByStudent(studentId: string | undefined) {
  return useQuery({
    enabled: Boolean(studentId),
    queryKey: ['recoveries', studentId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/recovery/student/${studentId}`);
      return data as Array<{
        id: string;
        assignedTask: string;
        recoveredPoints: number;
        status: 'PENDING' | 'COMPLETED' | 'REJECTED';
        createdAt: string;
        completedAt?: string | null;
      }>;
    },
  });
}

// ─── Activity logs (admin-wide) ──────────────────────────────

export function useActivityLogs(params: { page?: number; limit?: number; action?: string; studentId?: string } = {}) {
  return useQuery({
    queryKey: ['activity-logs', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/activity-logs', { params });
      return data as PaginatedResponse<{
        id: string;
        actorId: string;
        targetStudentId: string | null;
        actionType: string;
        description: string;
        metadata: Record<string, unknown> | null;
        createdAt: string;
        actor: { id: string; fullName: string; role: string };
      }>;
    },
  });
}

// ─── Users (super-admin) ─────────────────────────────────────

export interface UserRow {
  id: string;
  fullName: string;
  email: string;
  role: 'STUDENT' | 'MENTOR' | 'TUTOR' | 'ADMIN' | 'SUPER_ADMIN';
  avatar?: string | null;
  createdAt: string;
}

export function useUsers(role?: UserRow['role']) {
  return useQuery({
    queryKey: ['users', role],
    queryFn: async () => {
      const { data } = await apiClient.get<UserRow[]>('/users', { params: role ? { role } : undefined });
      return data;
    },
  });
}

// Re-export the StudentRow row type for convenience.
export type { StudentRow, PenaltyRow };
