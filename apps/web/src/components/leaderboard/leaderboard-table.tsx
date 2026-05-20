'use client';

import { ChevronRight } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { ScholarshipBadge } from '@/components/kpi/scholarship-badge';
import type { LeaderboardEntry } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface Props {
  entries: LeaderboardEntry[];
  onSelect?: (studentId: string) => void;
  highlightStudentId?: string;
}

export function LeaderboardTable({ entries, onSelect, highlightStudentId }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 w-12">#</th>
            <th className="px-4 py-3">Student</th>
            <th className="px-4 py-3 hidden md:table-cell">Faculty · Group</th>
            <th className="px-4 py-3 text-right">GPA</th>
            <th className="px-4 py-3 text-right">Attendance</th>
            <th className="px-4 py-3 text-right">Score</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {entries.map((entry) => (
            <tr
              key={entry.studentId}
              className={cn(
                'transition-colors cursor-pointer hover:bg-muted/30',
                entry.studentId === highlightStudentId && 'bg-primary/5',
              )}
              onClick={() => onSelect?.(entry.studentId)}
            >
              <td className="px-4 py-3 font-bold tabular-nums">{entry.rank}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar fallback={entry.fullName} src={entry.avatar ?? undefined} size="sm" />
                  <span className="font-medium">{entry.fullName}</span>
                </div>
              </td>
              <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                {entry.faculty} · {entry.group}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{entry.gpa}%</td>
              <td className="px-4 py-3 text-right tabular-nums">{entry.attendancePercent}%</td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums">
                {entry.finalScore.toFixed(1)}
              </td>
              <td className="px-4 py-3">
                <ScholarshipBadge status={entry.scholarshipStatus} />
              </td>
              <td className="px-4 py-3">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
