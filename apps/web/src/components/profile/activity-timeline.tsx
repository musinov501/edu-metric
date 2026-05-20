import { formatDistanceToNow } from '@/lib/utils/date';
import type { ActivityLogRow } from '@/lib/api/types';
import { cn } from '@/lib/utils';

const ICON_TONE: Record<string, string> = {
  KPI_RECALCULATED: 'bg-primary',
  ACHIEVEMENT_APPROVED: 'bg-success',
  ACHIEVEMENT_REJECTED: 'bg-danger',
  ACHIEVEMENT_UPLOADED: 'bg-primary',
  PENALTY_ADDED: 'bg-danger',
  PENALTY_REMOVED: 'bg-success',
  RECOVERY_COMPLETED: 'bg-success',
  RECOVERY_ASSIGNED: 'bg-warning',
  ATTENDANCE_RECORDED: 'bg-muted-foreground',
  ATTENDANCE_BULK_RECORDED: 'bg-muted-foreground',
  ASSIGNMENT_RECORDED: 'bg-primary',
  TUTOR_EVALUATION_RECORDED: 'bg-primary',
  STUDENT_GPA_CHANGED: 'bg-warning',
  SCHOLARSHIP_STATUS_CHANGED: 'bg-warning',
};

export function ActivityTimeline({ logs }: { logs: ActivityLogRow[] }) {
  if (!logs.length) {
    return (
      <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
        No activity yet.
      </div>
    );
  }

  return (
    <ol className="relative space-y-3 border-l pl-6">
      {logs.map((log) => (
        <li key={log.id} className="relative">
          <span
            className={cn(
              'absolute -left-[1.7rem] mt-1.5 flex h-3 w-3 items-center justify-center rounded-full ring-4 ring-card',
              ICON_TONE[log.actionType] ?? 'bg-muted-foreground',
            )}
          />
          <div className="text-sm">{log.description}</div>
          <div className="text-xs text-muted-foreground">
            {log.actor.fullName} · {log.actor.role.toLowerCase().replace('_', ' ')} ·{' '}
            {formatDistanceToNow(new Date(log.createdAt))} ago
          </div>
        </li>
      ))}
    </ol>
  );
}
