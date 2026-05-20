'use client';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useActivityLogs } from '@/lib/hooks/use-admin-mutations';
import { formatDistanceToNow } from '@/lib/utils/date';

const ACTION_TONE: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'muted'> = {
  ACHIEVEMENT_APPROVED: 'success',
  ACHIEVEMENT_REJECTED: 'danger',
  PENALTY_ADDED: 'danger',
  PENALTY_REMOVED: 'success',
  RECOVERY_COMPLETED: 'success',
  RECOVERY_REJECTED: 'warning',
  KPI_RECALCULATED: 'default',
  SCHOLARSHIP_STATUS_CHANGED: 'warning',
  STUDENT_CREATED: 'success',
  STUDENT_DELETED: 'danger',
};

export default function SystemLogsPage() {
  const { data } = useActivityLogs({ limit: 50 });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">System logs</h1>
        <p className="text-sm text-muted-foreground">
          Every state-changing action across the platform. This is the transparency engine.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {!data ? (
            <Skeleton className="h-64" />
          ) : data.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="divide-y">
              {data.data.map((log) => (
                <li key={log.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <Avatar fallback={log.actor.fullName} size="sm" />
                    <div className="min-w-0">
                      <div className="truncate text-sm">{log.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {log.actor.fullName} · {log.actor.role.toLowerCase().replace('_', ' ')} ·{' '}
                        {formatDistanceToNow(new Date(log.createdAt))} ago
                      </div>
                    </div>
                  </div>
                  <Badge variant={ACTION_TONE[log.actionType] ?? 'muted'} className="shrink-0">
                    {log.actionType.replace(/_/g, ' ').toLowerCase()}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
