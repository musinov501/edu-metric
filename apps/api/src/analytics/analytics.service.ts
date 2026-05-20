import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StudentsService } from '../students/students.service';
import { AuthenticatedUser } from '../auth/strategies/jwt-payload.interface';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly students: StudentsService,
  ) {}

  /** University-wide overview — top cards on the admin dashboard. */
  async universityOverview() {
    const [
      totalStudents,
      eligibleStudents,
      atRiskStudents,
      rejectedStudents,
      pendingAchievements,
      activePenalties30d,
      avgGpa,
      avgScore,
    ] = await this.prisma.$transaction([
      this.prisma.student.count(),
      this.prisma.student.count({ where: { scholarshipStatus: 'ELIGIBLE' } }),
      this.prisma.student.count({ where: { scholarshipStatus: 'AT_RISK' } }),
      this.prisma.student.count({ where: { scholarshipStatus: 'REJECTED' } }),
      this.prisma.achievement.count({ where: { status: 'PENDING' } }),
      this.prisma.penalty.count({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),
      this.prisma.student.aggregate({ _avg: { gpa: true } }),
      this.prisma.student.aggregate({ _avg: { overallScore: true } }),
    ]);

    return {
      totalStudents,
      eligibleStudents,
      atRiskStudents,
      rejectedStudents,
      pendingAchievements,
      activePenalties30d,
      averageGpa: round(avgGpa._avg.gpa ?? 0, 2),
      averageScore: round(avgScore._avg.overallScore ?? 0, 2),
    };
  }

  /** Faculty / group breakdown for the admin analytics page. */
  async byGroup() {
    const rows = await this.prisma.student.groupBy({
      by: ['faculty', 'group'],
      _avg: { gpa: true, overallScore: true, attendancePercent: true },
      _count: { _all: true },
    });
    return rows.map((r) => ({
      faculty: r.faculty,
      group: r.group,
      students: r._count._all,
      avgGpa: round(r._avg.gpa ?? 0, 2),
      avgFinalScore: round(r._avg.overallScore ?? 0, 2),
      avgAttendance: round(r._avg.attendancePercent ?? 0, 2),
    }));
  }

  /**
   * Per-student timeline: KPI history, recent activity, attendance trend.
   * Used by the Student Profile page.
   */
  async studentProfile(studentId: string, actor: AuthenticatedUser) {
    await this.students.assertCanRead(studentId, actor);

    const [student, kpiHistory, recentPenalties, recentAchievements] =
      await this.prisma.$transaction([
        this.prisma.student.findUnique({
          where: { id: studentId },
          include: { user: { select: { id: true, fullName: true, email: true, avatar: true } } },
        }),
        this.prisma.kpiHistory.findMany({
          where: { studentId },
          orderBy: { timestamp: 'desc' },
          take: 20,
        }),
        this.prisma.penalty.findMany({
          where: { studentId },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
        this.prisma.achievement.findMany({
          where: { studentId },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
      ]);
    return { student, kpiHistory, recentPenalties, recentAchievements };
  }

  /** Risk detection — students likely to drop out / lose scholarship. */
  async riskRoster() {
    return this.prisma.student.findMany({
      where: {
        OR: [
          { scholarshipStatus: 'AT_RISK' },
          { attendancePercent: { lt: 75 } },
          { gpa: { lt: 80 } },
        ],
      },
      include: {
        user: { select: { fullName: true, email: true, avatar: true } },
        kpiScores: { orderBy: { computedAt: 'desc' }, take: 1 },
      },
      orderBy: { overallScore: 'asc' },
      take: 50,
    });
  }
}

function round(n: number, decimals = 2): number {
  const m = 10 ** decimals;
  return Math.round(n * m) / m;
}
