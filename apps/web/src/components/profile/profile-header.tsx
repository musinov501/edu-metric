import { Mail } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { ScholarshipBadge } from '@/components/kpi/scholarship-badge';
import type { StudentRow } from '@/lib/api/types';

export function ProfileHeader({ student }: { student: StudentRow }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 sm:flex-row sm:items-center">
      <Avatar fallback={student.user.fullName} src={student.user.avatar ?? undefined} size="xl" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-2xl font-semibold tracking-tight">{student.user.fullName}</h2>
          <ScholarshipBadge status={student.scholarshipStatus} />
        </div>
        <p className="text-sm text-muted-foreground">
          {student.faculty} · {student.group} · Course {student.courseYear}
        </p>
        <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <Mail className="h-3 w-3" />
          {student.user.email}
          <span className="text-muted-foreground/60">·</span>
          <span className="font-mono">{student.studentId}</span>
        </p>
      </div>
      <div className="text-right">
        <div className="text-3xl font-bold tabular-nums">{student.overallScore.toFixed(1)}</div>
        <div className="text-xs text-muted-foreground">Final score</div>
      </div>
    </div>
  );
}
