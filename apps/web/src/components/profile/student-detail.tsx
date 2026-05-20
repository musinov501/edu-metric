'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ProfileHeader } from '@/components/profile/profile-header';
import { KpiBreakdownGrid } from '@/components/kpi/kpi-breakdown-grid';
import { WhyList } from '@/components/kpi/why-list';
import { ActivityTimeline } from '@/components/profile/activity-timeline';
import {
  useStudent,
  useStudentActivity,
  useStudentAchievements,
  useStudentPenalties,
} from '@/lib/hooks/use-students';
import { useLeaderboardWhy } from '@/lib/hooks/use-leaderboard';

const STATUS_VARIANT = {
  PENDING: 'muted',
  APPROVED: 'success',
  REJECTED: 'danger',
  REVISION_REQUIRED: 'warning',
} as const;

const SEVERITY_VARIANT = {
  MINOR: 'muted',
  MEDIUM: 'warning',
  MAJOR: 'danger',
  CRITICAL: 'danger',
} as const;

export function StudentDetail({ studentId }: { studentId: string }) {
  const { data: student } = useStudent(studentId);
  const { data: why } = useLeaderboardWhy(studentId);
  const { data: activity } = useStudentActivity(studentId);
  const { data: achievements } = useStudentAchievements(studentId);
  const { data: penalties } = useStudentPenalties(studentId);

  if (!student) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfileHeader student={student} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">KPI breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {why?.breakdown ? <KpiBreakdownGrid breakdown={why.breakdown} /> : <Skeleton className="h-48" />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Why this score</CardTitle>
          </CardHeader>
          <CardContent>{why ? <WhyList entries={why.why} /> : <Skeleton className="h-32" />}</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {activity ? <ActivityTimeline logs={activity.slice(0, 12)} /> : <Skeleton className="h-32" />}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {achievements ? (
                achievements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No achievements submitted yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {achievements.map((a) => (
                      <li key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{a.title}</div>
                          <div className="text-xs text-muted-foreground">{a.type}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold tabular-nums">+{a.score}</span>
                          <Badge variant={STATUS_VARIANT[a.status]}>
                            {a.status.toLowerCase().replace('_', ' ')}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              ) : (
                <Skeleton className="h-24" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Penalties</CardTitle>
            </CardHeader>
            <CardContent>
              {penalties ? (
                penalties.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No penalties.</p>
                ) : (
                  <ul className="space-y-2">
                    {penalties.map((p) => (
                      <li key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium">{p.type.replace('_', ' ')}</div>
                          <div className="text-xs text-muted-foreground">{p.reason}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold tabular-nums text-danger">-{p.points}</span>
                          <Badge variant={SEVERITY_VARIANT[p.severity]}>{p.severity}</Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              ) : (
                <Skeleton className="h-24" />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
