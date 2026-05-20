import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ScoringService } from '../scoring/scoring.service';
import { KpiBreakdown } from '../scoring/scoring.types';

interface LeaderboardQuery {
  faculty?: string;
  group?: string;
  semester?: string;
  limit?: number;
}

@Injectable()
export class LeaderboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scoring: ScoringService,
  ) {}

  /**
   * Dynamic leaderboard ranking with 5-tier tiebreak:
   *   finalScore → gpa → attendancePercent → disciplineScore → activityScore
   */
  async getLeaderboard(query: LeaderboardQuery) {
    const where: Prisma.StudentWhereInput = {};
    if (query.faculty) where.faculty = query.faculty;
    if (query.group) where.group = query.group;

    // Fetch students with their latest KPI score (for tiebreak fields)
    const students = await this.prisma.student.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true, avatar: true } },
        kpiScores: {
          orderBy: { computedAt: 'desc' },
          take: 1,
          ...(query.semester ? { where: { semester: query.semester } } : {}),
        },
      },
    });

    // Sort in JS to apply the full 5-tier tiebreak across nested KPI fields.
    const sorted = students
      .map((s) => ({
        student: s,
        kpi: s.kpiScores[0],
      }))
      .sort((a, b) => {
        const aFinal = a.kpi?.finalScore ?? a.student.overallScore;
        const bFinal = b.kpi?.finalScore ?? b.student.overallScore;
        if (aFinal !== bFinal) return bFinal - aFinal;
        if (a.student.gpa !== b.student.gpa) return b.student.gpa - a.student.gpa;
        if (a.student.attendancePercent !== b.student.attendancePercent)
          return b.student.attendancePercent - a.student.attendancePercent;
        const aDisc = a.kpi?.disciplineScore ?? 10;
        const bDisc = b.kpi?.disciplineScore ?? 10;
        if (aDisc !== bDisc) return bDisc - aDisc;
        const aAct = a.kpi?.activityScore ?? 0;
        const bAct = b.kpi?.activityScore ?? 0;
        return bAct - aAct;
      });

    const limit = Math.min(query.limit ?? 100, 500);
    return sorted.slice(0, limit).map((entry, idx) => ({
      rank: idx + 1,
      studentId: entry.student.id,
      fullName: entry.student.user.fullName,
      avatar: entry.student.user.avatar,
      faculty: entry.student.faculty,
      group: entry.student.group,
      gpa: entry.student.gpa,
      attendancePercent: entry.student.attendancePercent,
      finalScore: entry.kpi?.finalScore ?? entry.student.overallScore,
      scholarshipStatus: entry.student.scholarshipStatus,
      breakdown: entry.kpi
        ? this.pickBreakdown(entry.kpi)
        : null,
    }));
  }

  /**
   * "Why this rank?" — explainable breakdown for a single student.
   */
  async explainStudent(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { id: true, fullName: true, avatar: true } },
        kpiScores: { orderBy: { computedAt: 'desc' }, take: 1 },
      },
    });
    if (!student) throw new NotFoundException('Student not found');
    const breakdown: KpiBreakdown | null = student.kpiScores[0]
      ? this.pickBreakdown(student.kpiScores[0])
      : null;

    const why = breakdown ? this.scoring.explain(breakdown, student.gpa) : [];

    return {
      studentId: student.id,
      fullName: student.user.fullName,
      avatar: student.user.avatar,
      gpa: student.gpa,
      attendancePercent: student.attendancePercent,
      scholarshipStatus: student.scholarshipStatus,
      breakdown,
      why,
    };
  }

  private pickBreakdown(kpi: {
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
  }): KpiBreakdown {
    return {
      academicScore: kpi.academicScore,
      attendanceScore: kpi.attendanceScore,
      assignmentScore: kpi.assignmentScore,
      activityScore: kpi.activityScore,
      tutorScore: kpi.tutorScore,
      disciplineScore: kpi.disciplineScore,
      penaltyScore: kpi.penaltyScore,
      recoveryScore: kpi.recoveryScore,
      employmentBonus: kpi.employmentBonus,
      finalScore: kpi.finalScore,
    };
  }
}
