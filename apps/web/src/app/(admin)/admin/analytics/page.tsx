'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useGroupAnalytics, useUniversityOverview, useAdminAi } from '@/lib/hooks/use-analytics';

export default function AdminAnalyticsPage() {
  const { data: overview } = useUniversityOverview();
  const { data: groups } = useGroupAnalytics();
  const { data: ai } = useAdminAi();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          University-wide signals: scholarship distribution, risk roster, group performance.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Total" value={overview?.totalStudents} />
        <Stat label="Eligible" value={overview?.eligibleStudents} tone="text-success" />
        <Stat label="At risk" value={overview?.atRiskStudents} tone="text-warning" />
        <Stat label="Rejected" value={overview?.rejectedStudents} tone="text-danger" />
        <Stat label="Avg GPA" value={overview?.averageGpa} suffix="%" />
        <Stat label="Avg final score" value={overview?.averageScore} />
        <Stat label="Pending approvals" value={overview?.pendingAchievements} />
        <Stat label="Penalties (30d)" value={overview?.activePenalties30d} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI insights</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Group breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {!groups ? (
            <Skeleton className="h-32" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="pb-2">Faculty · Group</th>
                    <th className="pb-2 text-right">Students</th>
                    <th className="pb-2 text-right">Avg GPA</th>
                    <th className="pb-2 text-right">Avg score</th>
                    <th className="pb-2 text-right">Avg attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {groups.map((g) => (
                    <tr key={`${g.faculty}-${g.group}`}>
                      <td className="py-2.5">
                        <span className="text-muted-foreground">{g.faculty}</span> · {g.group}
                      </td>
                      <td className="py-2.5 text-right tabular-nums">{g.students}</td>
                      <td className="py-2.5 text-right tabular-nums">{g.avgGpa}%</td>
                      <td className="py-2.5 text-right tabular-nums">{g.avgFinalScore}</td>
                      <td className="py-2.5 text-right tabular-nums">{g.avgAttendance}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, suffix, tone }: { label: string; value?: number; suffix?: string; tone?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className={`text-2xl font-bold tabular-nums ${tone ?? ''}`}>
          {value ?? '—'}
          {suffix && value !== undefined ? suffix : ''}
        </div>
      </CardContent>
    </Card>
  );
}
