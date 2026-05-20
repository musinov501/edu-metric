'use client';

import { useAuthStore } from '@/store/auth-store';
import { useLeaderboard } from '@/lib/hooks/use-leaderboard';
import { useStudent, useStudentKpi } from '@/lib/hooks/use-students';
import { useStudentAi } from '@/lib/hooks/use-analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { KpiBreakdownGrid } from '@/components/kpi/kpi-breakdown-grid';
import { Sparkles } from 'lucide-react';

export default function StudentAnalyticsPage() {
  const user = useAuthStore((s) => s.user);
  const { data: lb } = useLeaderboard({ limit: 500 });
  const sid = lb?.find((e) => e.fullName === user?.fullName)?.studentId;

  const { data: student } = useStudent(sid);
  const { data: kpi } = useStudentKpi(sid);
  const { data: ai } = useStudentAi(sid);

  if (!student) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Your performance signals — see exactly where your score is coming from.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">GPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{student.gpa}%</div>
            <Progress
              className="mt-2"
              value={student.gpa}
              tone={student.gpa >= 80 ? 'success' : 'danger'}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{student.attendancePercent}%</div>
            <Progress
              className="mt-2"
              value={student.attendancePercent}
              tone={student.attendancePercent >= 90 ? 'success' : student.attendancePercent >= 75 ? 'warning' : 'danger'}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Final score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">
              {(kpi?.finalScore ?? student.overallScore).toFixed(1)}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Eligible if ≥ 80 and GPA ≥ 80%.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">KPI breakdown</CardTitle>
        </CardHeader>
        <CardContent>{kpi ? <KpiBreakdownGrid breakdown={kpi} /> : <Skeleton className="h-48" />}</CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" /> AI insights
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            Scholarship probability: <span className="font-semibold text-foreground">{ai?.scholarshipProbability ?? '—'}%</span>
          </span>
        </CardHeader>
        <CardContent>
          {ai ? (
            <ul className="space-y-2 text-sm">
              {ai.insights.map((i, idx) => (
                <li key={idx}>• {i}</li>
              ))}
            </ul>
          ) : (
            <Skeleton className="h-24" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
