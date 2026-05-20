import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, ScholarshipStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ActivityAction } from '../activity-logs/activity-action.enum';
import {
  ACTIVITY_POINTS,
  ASSIGNMENT_WEIGHTS,
  DISCIPLINE_MIN,
  DISCIPLINE_START,
  FINAL_SCORE_MIN_ELIGIBLE,
  GPA_AUTO_REJECT_BELOW,
  KPI_MAX,
  PENALTY_SEVERITY_POINTS,
  maxRecoveryFor,
} from './kpi.constants';
import {
  ExplainableScoreEntry,
  KpiBreakdown,
  ScholarshipDecision,
} from './scoring.types';

interface RecalcOptions {
  actorId: string;
  reason: string;
  semester?: string;
}

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  /**
   * Recalculate the full KPI breakdown for a student, persist a kpi_scores
   * row, write a kpi_history snapshot, update Student.overallScore +
   * scholarshipStatus, and emit an activity log entry.
   *
   * Idempotent per semester — kpi_scores row is upserted on (studentId, semester).
   */
  async recalculate(studentId: string, opts: RecalcOptions): Promise<KpiBreakdown> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        achievements: { where: { status: 'APPROVED' } },
        studentAssignments: true,
        tutorEvaluations: true,
        penalties: true,
        recoveries: { where: { status: 'COMPLETED' } },
        employmentBonuses: true,
      },
    });
    if (!student) throw new NotFoundException('Student not found');

    const semester = opts.semester ?? currentSemester();

    // 1. Academic (40)
    const academicScore = round((student.gpa / 100) * KPI_MAX.ACADEMIC, 2);

    // 2. Attendance (20)
    const attendanceScore = round(
      (student.attendancePercent / 100) * KPI_MAX.ATTENDANCE,
      2,
    );

    // 3. Assignments (15)
    const assignmentScore = round(this.computeAssignmentScore(student.studentAssignments), 2);

    // 4. Activities (10) — sum of approved achievement points, clamped to 10
    const activityScore = round(
      Math.min(
        student.achievements.reduce((sum, a) => sum + (a.score ?? 0), 0),
        KPI_MAX.ACTIVITY,
      ),
      2,
    );

    // 5. Tutor evaluation (5)
    const tutorScore = round(this.computeTutorScore(student.tutorEvaluations), 2);

    // 6. Discipline (10)
    const disciplineScore = this.computeDisciplineScore(student.penalties);

    // 7. Penalty (negative, capped at -20)
    const penaltyScore = round(
      -Math.min(this.sumPenaltyPoints(student.penalties), KPI_MAX.PENALTY),
      2,
    );

    // 8. Recovery (positive, capped at min(|penalty|/2, 10))
    const cap = maxRecoveryFor(Math.abs(penaltyScore));
    const recoveryGrossRaw = student.recoveries.reduce((sum, r) => sum + (r.recoveredPoints ?? 0), 0);
    const recoveryScore = round(Math.min(recoveryGrossRaw, cap), 2);

    // 9. Employment bonus (capped at +10)
    const employmentBonus = round(
      Math.min(
        student.employmentBonuses.reduce((sum, b) => sum + (b.bonusPoints ?? 0), 0),
        KPI_MAX.EMPLOYMENT_BONUS,
      ),
      2,
    );

    const baseKpi =
      academicScore +
      attendanceScore +
      assignmentScore +
      activityScore +
      tutorScore +
      disciplineScore;
    const finalScore = round(baseKpi + penaltyScore + recoveryScore + employmentBonus, 2);

    const breakdown: KpiBreakdown = {
      academicScore,
      attendanceScore,
      assignmentScore,
      activityScore,
      tutorScore,
      disciplineScore,
      penaltyScore,
      recoveryScore,
      employmentBonus,
      finalScore,
    };

    const decision = this.decideScholarship(student.gpa, finalScore, student.scholarshipStatus);

    const previous = await this.prisma.kpiScore.findUnique({
      where: { studentId_semester: { studentId, semester } },
      select: { finalScore: true },
    });

    await this.prisma.$transaction([
      this.prisma.kpiScore.upsert({
        where: { studentId_semester: { studentId, semester } },
        create: { studentId, semester, ...breakdown },
        update: { ...breakdown, computedAt: new Date() },
      }),
      this.prisma.student.update({
        where: { id: studentId },
        data: { overallScore: finalScore, scholarshipStatus: decision.status },
      }),
      this.prisma.kpiHistory.create({
        data: {
          studentId,
          oldScore: previous?.finalScore ?? 0,
          newScore: finalScore,
          reason: opts.reason,
          metadata: breakdown as unknown as Prisma.InputJsonValue,
        },
      }),
    ]);

    await this.activityLogs.log({
      actorId: opts.actorId,
      targetStudentId: studentId,
      action: ActivityAction.KPI_RECALCULATED,
      description: `KPI recalculated: ${previous?.finalScore ?? 0} → ${finalScore} (${opts.reason})`,
      metadata: { ...breakdown, decision } as Record<string, unknown>,
    });

    if (decision.status !== student.scholarshipStatus) {
      await this.activityLogs.log({
        actorId: opts.actorId,
        targetStudentId: studentId,
        action: ActivityAction.SCHOLARSHIP_STATUS_CHANGED,
        description: `Scholarship status: ${student.scholarshipStatus} → ${decision.status}`,
        metadata: { reasons: decision.reasons },
      });
    }

    return breakdown;
  }

  async getCurrent(studentId: string): Promise<KpiBreakdown | null> {
    const row = await this.prisma.kpiScore.findFirst({
      where: { studentId },
      orderBy: { computedAt: 'desc' },
    });
    if (!row) return null;
    const { academicScore, attendanceScore, assignmentScore, activityScore, tutorScore, disciplineScore, penaltyScore, recoveryScore, employmentBonus, finalScore } = row;
    return { academicScore, attendanceScore, assignmentScore, activityScore, tutorScore, disciplineScore, penaltyScore, recoveryScore, employmentBonus, finalScore };
  }

  async getHistory(studentId: string, limit = 50) {
    return this.prisma.kpiHistory.findMany({
      where: { studentId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  /**
   * Produce "why" entries for a student's current score.
   * Used by leaderboard and profile breakdowns.
   */
  explain(breakdown: KpiBreakdown, gpa: number): ExplainableScoreEntry[] {
    const out: ExplainableScoreEntry[] = [];
    if (gpa >= 90) out.push({ kind: 'POSITIVE', label: 'Excellent GPA', detail: `${gpa}%` });
    else if (gpa >= 80) out.push({ kind: 'POSITIVE', label: 'Strong GPA', detail: `${gpa}%` });
    else out.push({ kind: 'NEGATIVE', label: 'GPA below scholarship threshold', detail: `${gpa}% (need ≥ ${GPA_AUTO_REJECT_BELOW}%)` });

    if (breakdown.attendanceScore >= 18) out.push({ kind: 'POSITIVE', label: 'Excellent attendance' });
    else if (breakdown.attendanceScore < 14) out.push({ kind: 'NEGATIVE', label: 'Low attendance', detail: `${breakdown.attendanceScore}/20` });

    if (breakdown.activityScore >= 7) out.push({ kind: 'POSITIVE', label: 'Strong achievement portfolio' });
    if (breakdown.penaltyScore < 0) out.push({ kind: 'NEGATIVE', label: 'Active penalties', detail: `${breakdown.penaltyScore} pts` });
    if (breakdown.recoveryScore > 0) out.push({ kind: 'POSITIVE', label: 'Recovery in progress', detail: `+${breakdown.recoveryScore}` });
    if (breakdown.employmentBonus > 0) out.push({ kind: 'POSITIVE', label: 'Employment bonus', detail: `+${breakdown.employmentBonus}` });
    return out;
  }

  // ─────────────────────────────────────────────────────────────
  // Sub-calculators
  // ─────────────────────────────────────────────────────────────

  private computeAssignmentScore(
    assignments: Array<{
      completionScore: number;
      qualityScore: number;
      originalityScore: number;
      deadlineScore: number;
    }>,
  ): number {
    if (!assignments.length) return 0;
    const perAssignment = assignments.map(
      (a) =>
        a.completionScore * ASSIGNMENT_WEIGHTS.COMPLETION +
        a.qualityScore * ASSIGNMENT_WEIGHTS.QUALITY +
        a.originalityScore * ASSIGNMENT_WEIGHTS.ORIGINALITY +
        a.deadlineScore * ASSIGNMENT_WEIGHTS.DEADLINE,
    );
    const avg = perAssignment.reduce((s, v) => s + v, 0) / perAssignment.length;
    return Math.min((avg / 100) * KPI_MAX.ASSIGNMENT, KPI_MAX.ASSIGNMENT);
  }

  private computeTutorScore(
    evals: Array<{
      ethics: number;
      communication: number;
      socialActivity: number;
      discipline: number;
      motivation: number;
      createdAt: Date;
    }>,
  ): number {
    if (!evals.length) return 0;
    const latest = [...evals].sort((a, b) => +b.createdAt - +a.createdAt)[0];
    const axisAvg =
      (latest.ethics +
        latest.communication +
        latest.socialActivity +
        latest.discipline +
        latest.motivation) /
      5;
    return Math.min(Math.max(axisAvg, 0), KPI_MAX.TUTOR);
  }

  private computeDisciplineScore(penalties: Array<{ type: string; points: number }>): number {
    let score = DISCIPLINE_START;
    for (const p of penalties) {
      switch (p.type) {
        case 'LATE':
        case 'PHONE_USAGE':
          score -= 1;
          break;
        case 'ABSENCE':
          score -= 3;
          break;
        case 'PLAGIARISM':
          score -= 15;
          break;
        case 'DORMITORY_VIOLATION':
        case 'DISRESPECT':
        case 'OTHER':
          score -= 3;
          break;
      }
    }
    return Math.max(score, DISCIPLINE_MIN);
  }

  private sumPenaltyPoints(penalties: Array<{ points: number; severity: string }>): number {
    return penalties.reduce((acc, p) => {
      const explicit = Math.abs(p.points ?? 0);
      if (explicit > 0) return acc + explicit;
      return acc + (PENALTY_SEVERITY_POINTS[p.severity] ?? 0);
    }, 0);
  }

  private decideScholarship(gpa: number, finalScore: number, current: ScholarshipStatus): ScholarshipDecision {
    if (gpa < GPA_AUTO_REJECT_BELOW) {
      return {
        status: 'REJECTED',
        reasons: [`GPA ${gpa}% below ${GPA_AUTO_REJECT_BELOW}% threshold (auto-rejected)`],
      };
    }
    if (finalScore < FINAL_SCORE_MIN_ELIGIBLE) {
      return {
        status: 'AT_RISK',
        reasons: [`Final score ${finalScore} below ${FINAL_SCORE_MIN_ELIGIBLE} threshold`],
      };
    }
    return {
      status: 'ELIGIBLE',
      reasons: [
        `Final score ${finalScore} ≥ ${FINAL_SCORE_MIN_ELIGIBLE}, GPA ${gpa}% ≥ ${GPA_AUTO_REJECT_BELOW}%`,
      ],
    };
  }
}

// ─────────────────────────────────────────────────────────────
// Pure helpers
// ─────────────────────────────────────────────────────────────

function round(n: number, decimals = 2): number {
  const m = 10 ** decimals;
  return Math.round(n * m) / m;
}

function currentSemester(): string {
  const d = new Date();
  const year = d.getFullYear();
  const term = d.getMonth() < 6 ? 'SPRING' : 'FALL';
  return `${year}-${term}`;
}

export { ACTIVITY_POINTS };
