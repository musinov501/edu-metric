'use client';

import { useAuthStore } from '@/store/auth-store';
import { useLeaderboard, useLeaderboardWhy } from '@/lib/hooks/use-leaderboard';
import {
  useStudent,
  useStudentActivity,
  useStudentAchievements,
} from '@/lib/hooks/use-students';
import { ProfileHeader } from '@/components/profile/profile-header';
import { KpiBreakdownGrid } from '@/components/kpi/kpi-breakdown-grid';
import { WhyList } from '@/components/kpi/why-list';
import { ActivityTimeline } from '@/components/profile/activity-timeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function StudentProfilePage() {
  const user = useAuthStore((s) => s.user);
  const { data: lb } = useLeaderboard({ limit: 500 });
  const sid = lb?.find((e) => e.fullName === user?.fullName)?.studentId;

  const { data: student } = useStudent(sid);
  const { data: why } = useLeaderboardWhy(sid);
  const { data: activity } = useStudentActivity(sid);
  const { data: achievements } = useStudentAchievements(sid);

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
        {/* KPI breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-medium">KPI breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {why?.breakdown ? (
              <KpiBreakdownGrid breakdown={why.breakdown} />
            ) : (
              <Skeleton className="h-48" />
            )}
          </CardContent>
        </Card>

        {/* Why this score */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Why this score</CardTitle>
          </CardHeader>
          <CardContent>
            {why ? <WhyList entries={why.why} /> : <Skeleton className="h-32" />}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Activity timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {activity ? (
              <ActivityTimeline logs={activity.slice(0, 12)} />
            ) : (
              <Skeleton className="h-32" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            {achievements ? (
              achievements.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No certificates uploaded yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {achievements.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{a.title}</div>
                        <div className="text-xs text-muted-foreground">{a.type}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold tabular-nums">+{a.score}</span>
                        <Badge
                          variant={
                            a.status === 'APPROVED'
                              ? 'success'
                              : a.status === 'REJECTED'
                              ? 'danger'
                              : a.status === 'REVISION_REQUIRED'
                              ? 'warning'
                              : 'muted'
                          }
                        >
                          {a.status.toLowerCase().replace('_', ' ')}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <Skeleton className="h-32" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
