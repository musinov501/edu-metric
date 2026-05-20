'use client';

import { Award, Bell, BookOpen, GraduationCap, Sparkles, Target, TrendingUp, Trophy } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import {
  useStudent,
  useStudentKpi,
  useStudentAchievements,
  useStudentPenalties,
} from '@/lib/hooks/use-students';
import { useStudentAi } from '@/lib/hooks/use-analytics';
import { useLeaderboard } from '@/lib/hooks/use-leaderboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ScholarshipBadge } from '@/components/kpi/scholarship-badge';
import { cn } from '@/lib/utils';

function tone(score: number) {
  if (score >= 90) return 'success' as const;
  if (score >= 80) return 'default' as const;
  if (score >= 70) return 'warning' as const;
  return 'danger' as const;
}

export default function StudentDashboardPage() {
  const user = useAuthStore((s) => s.user);
  // The JWT payload encodes studentId for STUDENT users; the /me endpoint
  // doesn't expose it, so we resolve it from the leaderboard by matching name.
  const { data: lb } = useLeaderboard({ limit: 500 });
  const sid = lb?.find((entry) => entry.fullName === user?.fullName)?.studentId;

  const { data: student, isLoading: studentLoading } = useStudent(sid);
  const { data: kpi } = useStudentKpi(sid);
  const { data: achievements } = useStudentAchievements(sid);
  const { data: penalties } = useStudentPenalties(sid);
  const { data: ai } = useStudentAi(sid);

  const rankRow = lb?.find((r) => r.studentId === sid);

  if (studentLoading || !student) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      </div>
    );
  }

  const approvedAchievements = achievements?.filter((a) => a.status === 'APPROVED').length ?? 0;
  const pendingAchievements = achievements?.filter((a) => a.status === 'PENDING').length ?? 0;

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hello, {student.user.fullName.split(' ')[0]}
          </h1>
          <p className="text-sm text-muted-foreground">
            {student.faculty} · {student.group} · Course {student.courseYear}
          </p>
        </div>
        <ScholarshipBadge status={student.scholarshipStatus} />
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* KPI Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-medium text-muted-foreground">
                Current KPI Score
              </CardTitle>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold tabular-nums">
                  {Math.round(kpi?.finalScore ?? student.overallScore)}
                </span>
                <span className="text-sm text-muted-foreground">/ 110</span>
              </div>
            </div>
            <Target className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress
              value={((kpi?.finalScore ?? student.overallScore) / 110) * 100}
              tone={tone(kpi?.finalScore ?? student.overallScore)}
            />
            <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
              <div>
                <div className="text-muted-foreground">Academic</div>
                <div className="font-semibold">{kpi?.academicScore ?? '–'}/40</div>
              </div>
              <div>
                <div className="text-muted-foreground">Attendance</div>
                <div className="font-semibold">{kpi?.attendanceScore ?? '–'}/20</div>
              </div>
              <div>
                <div className="text-muted-foreground">Activities</div>
                <div className="font-semibold">{kpi?.activityScore ?? '–'}/10</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ranking */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-medium text-muted-foreground">Ranking</CardTitle>
            <Trophy className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tabular-nums">#{rankRow?.rank ?? '—'}</span>
              <span className="text-sm text-muted-foreground">
                {lb ? `of ${lb.length}` : ''}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Tie-break order: final → GPA → attendance → discipline → activities
            </p>
          </CardContent>
        </Card>

        {/* GPA */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-medium text-muted-foreground">GPA</CardTitle>
            <GraduationCap className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{student.gpa}%</div>
            <Progress className="mt-2" value={student.gpa} tone={student.gpa >= 80 ? 'success' : 'danger'} />
            <p className="mt-2 text-xs text-muted-foreground">
              {student.gpa >= 80 ? 'Above scholarship threshold' : 'Below 80% — scholarship at risk'}
            </p>
          </CardContent>
        </Card>

        {/* Attendance */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-medium text-muted-foreground">Attendance</CardTitle>
            <BookOpen className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{student.attendancePercent}%</div>
            <Progress
              className="mt-2"
              value={student.attendancePercent}
              tone={
                student.attendancePercent >= 90
                  ? 'success'
                  : student.attendancePercent >= 75
                  ? 'warning'
                  : 'danger'
              }
            />
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-medium text-muted-foreground">
              Achievements
            </CardTitle>
            <Award className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{approvedAchievements}</div>
            <p className="mt-2 text-xs text-muted-foreground">
              {pendingAchievements > 0
                ? `${pendingAchievements} pending review`
                : 'All caught up'}
            </p>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-medium">AI Insights</CardTitle>
            <Sparkles className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-2">
            {ai ? (
              <>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">Scholarship probability:</span>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      ai.scholarshipProbability >= 80
                        ? 'bg-success/10 text-success'
                        : ai.scholarshipProbability >= 50
                        ? 'bg-warning/10 text-warning'
                        : 'bg-danger/10 text-danger',
                    )}
                  >
                    {ai.scholarshipProbability}%
                  </span>
                  <span className="text-xs text-muted-foreground">({ai.source})</span>
                </div>
                <ul className="space-y-1.5 pt-1 text-sm">
                  {ai.insights.map((insight, i) => (
                    <li key={i} className="flex gap-2">
                      <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <Skeleton className="h-20 w-full" />
            )}
          </CardContent>
        </Card>

        {/* Penalties */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-medium text-muted-foreground">Penalties</CardTitle>
            <Bell className="h-5 w-5 text-danger" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{penalties?.length ?? 0}</div>
            <p className="mt-2 text-xs text-muted-foreground">
              {penalties?.length
                ? `Latest: ${penalties[0].severity} ${penalties[0].type}`
                : 'No active penalties'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
