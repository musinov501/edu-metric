'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { IssuePenaltyForm } from '@/components/forms/issue-penalty-form';
import { useActivityLogs } from '@/lib/hooks/use-admin-mutations';

const SEVERITY_VARIANT = {
  MINOR: 'muted',
  MEDIUM: 'warning',
  MAJOR: 'danger',
  CRITICAL: 'danger',
} as const;

export default function AdminPenaltiesPage() {
  // Re-use activity-logs filtered to PENALTY_ADDED to get a chronological feed.
  const { data: feed } = useActivityLogs({ action: 'PENALTY_ADDED', limit: 30 });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Penalties</h1>
        <p className="text-sm text-muted-foreground">
          Issue penalties or review recent ones. Every penalty auto-recalculates the student's KPI.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Issue penalty</CardTitle>
          </CardHeader>
          <CardContent>
            <IssuePenaltyForm />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent penalties</CardTitle>
          </CardHeader>
          <CardContent>
            {!feed ? (
              <Skeleton className="h-48" />
            ) : feed.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">No penalties issued recently.</p>
            ) : (
              <ul className="divide-y">
                {feed.data.map((log) => {
                  const meta = (log.metadata ?? {}) as { severity?: keyof typeof SEVERITY_VARIANT; type?: string; points?: number };
                  return (
                    <li key={log.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar fallback={log.actor.fullName} size="sm" />
                        <div className="min-w-0">
                          <div className="truncate text-sm">{log.description}</div>
                          <div className="text-xs text-muted-foreground">
                            by {log.actor.fullName} · {log.actor.role.toLowerCase().replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-semibold tabular-nums text-danger">-{meta.points ?? '—'}</span>
                        {meta.severity && (
                          <Badge variant={SEVERITY_VARIANT[meta.severity]}>{meta.severity}</Badge>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
