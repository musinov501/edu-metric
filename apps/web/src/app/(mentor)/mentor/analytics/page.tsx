'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useGroupAnalytics } from '@/lib/hooks/use-analytics';

export default function MentorAnalyticsPage() {
  const { data: groups } = useGroupAnalytics();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Group-level performance across the cohort.</p>
      </header>

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
