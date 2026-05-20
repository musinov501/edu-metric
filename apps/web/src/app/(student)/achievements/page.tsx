'use client';

import { useAuthStore } from '@/store/auth-store';
import { useLeaderboard } from '@/lib/hooks/use-leaderboard';
import { useStudentAchievements } from '@/lib/hooks/use-students';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { UploadAchievementForm } from '@/components/forms/upload-achievement-form';

const STATUS_VARIANT = {
  PENDING: 'muted',
  APPROVED: 'success',
  REJECTED: 'danger',
  REVISION_REQUIRED: 'warning',
} as const;

export default function AchievementsPage() {
  const user = useAuthStore((s) => s.user);
  const { data: lb } = useLeaderboard({ limit: 500 });
  const sid = lb?.find((e) => e.fullName === user?.fullName)?.studentId;
  const { data: achievements } = useStudentAchievements(sid);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Achievements</h1>
        <p className="text-sm text-muted-foreground">
          Upload certificates and hackathon proofs. Admin verifies before points count toward your KPI.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Submit new achievement</CardTitle>
          </CardHeader>
          <CardContent>
            <UploadAchievementForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {!achievements ? (
              <Skeleton className="h-32" />
            ) : achievements.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing submitted yet — your first upload appears here once it leaves the form.
              </p>
            ) : (
              <ul className="space-y-2">
                {achievements.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-start justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-sm">{a.title}</div>
                      <div className="text-xs text-muted-foreground">{a.type}</div>
                      {a.reviewNotes && (
                        <div className="mt-1.5 rounded bg-muted/40 p-2 text-xs">
                          <span className="font-semibold">Admin notes:</span> {a.reviewNotes}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-semibold tabular-nums">+{a.score}</span>
                      <Badge variant={STATUS_VARIANT[a.status]}>
                        {a.status.toLowerCase().replace('_', ' ')}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
