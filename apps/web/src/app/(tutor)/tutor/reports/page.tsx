'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudents } from '@/lib/hooks/use-students';

export default function TutorReportsPage() {
  const { data: students } = useStudents({ limit: 200 });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Aggregate view of your supervised students' scholarship status.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scholarship status distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {!students ? (
            <Skeleton className="h-24" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-4 text-sm">
              {(['ELIGIBLE', 'AT_RISK', 'REJECTED', 'UNDER_REVIEW'] as const).map((status) => {
                const count = students.data.filter((s) => s.scholarshipStatus === status).length;
                return (
                  <div key={status} className="rounded-lg border p-3">
                    <div className="text-xs uppercase text-muted-foreground">
                      {status.replace('_', ' ')}
                    </div>
                    <div className="text-2xl font-bold tabular-nums">{count}</div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
