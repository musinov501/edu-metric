/**
 * Frontend mirrors of backend response shapes.
 * Kept here rather than in @edumetric/shared because they include
 * relation-loaded fields that only the API serializes.
 */

import type { Role } from '@edumetric/shared';

export interface KpiBreakdown {
  academicScore: number;
  attendanceScore: number;
  assignmentScore: number;
  activityScore: number;
  tutorScore: number;
  disciplineScore: number;
  penaltyScore: number;
  recoveryScore: number;
  employmentBonus: number;
  finalScore: number;
}

export interface ExplainableScoreEntry {
  kind: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  label: string;
  detail?: string;
}

export interface ScholarshipStatusValue {
  ELIGIBLE: 'ELIGIBLE';
  AT_RISK: 'AT_RISK';
  REJECTED: 'REJECTED';
  UNDER_REVIEW: 'UNDER_REVIEW';
}
export type ScholarshipStatus = keyof ScholarshipStatusValue;

export interface StudentRow {
  id: string;
  userId: string;
  studentId: string;
  faculty: string;
  group: string;
  courseYear: number;
  gpa: number;
  attendancePercent: number;
  scholarshipStatus: ScholarshipStatus;
  overallScore: number;
  createdAt: string;
  updatedAt: string;
  user: { id: string; fullName: string; email: string; avatar?: string | null };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  fullName: string;
  avatar?: string | null;
  faculty: string;
  group: string;
  gpa: number;
  attendancePercent: number;
  finalScore: number;
  scholarshipStatus: ScholarshipStatus;
  breakdown: KpiBreakdown | null;
}

export interface LeaderboardWhy {
  studentId: string;
  fullName: string;
  avatar?: string | null;
  gpa: number;
  attendancePercent: number;
  scholarshipStatus: ScholarshipStatus;
  breakdown: KpiBreakdown | null;
  why: ExplainableScoreEntry[];
}

export interface ActivityLogRow {
  id: string;
  actorId: string;
  targetStudentId: string | null;
  actionType: string;
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: { id: string; fullName: string; role: Role };
}

export interface AchievementRow {
  id: string;
  studentId: string;
  type: string;
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  externalLink?: string | null;
  score: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUIRED';
  reviewNotes?: string | null;
  createdAt: string;
  student?: { user: { fullName: string; email: string; avatar?: string | null } };
}

export interface PenaltyRow {
  id: string;
  studentId: string;
  type: string;
  severity: 'MINOR' | 'MEDIUM' | 'MAJOR' | 'CRITICAL';
  reason: string;
  points: number;
  createdAt: string;
  issuedBy?: { id: string; fullName: string; role: Role };
}

export interface UniversityOverview {
  totalStudents: number;
  eligibleStudents: number;
  atRiskStudents: number;
  rejectedStudents: number;
  pendingAchievements: number;
  activePenalties30d: number;
  averageGpa: number;
  averageScore: number;
}

export interface GroupRow {
  faculty: string;
  group: string;
  students: number;
  avgGpa: number;
  avgFinalScore: number;
  avgAttendance: number;
}

export interface AiInsight {
  riskLevel: 'EXCELLENT' | 'STRONG' | 'AT_RISK' | 'CRITICAL';
  scholarshipProbability: number;
  insights: string[];
  source: 'openai' | 'gemini' | 'rule-based';
}
