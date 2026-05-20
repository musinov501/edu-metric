'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useStudents } from '@/lib/hooks/use-students';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScholarshipBadge } from '@/components/kpi/scholarship-badge';
import type { ScholarshipStatus } from '@/lib/api/types';

const STATUSES: ScholarshipStatus[] = ['ELIGIBLE', 'AT_RISK', 'REJECTED', 'UNDER_REVIEW'];

export function StudentsTable({ profileBase = '/admin/students' }: { profileBase?: string }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ScholarshipStatus | ''>('');
  const { data } = useStudents({ search: search || undefined, scholarshipStatus: statusFilter || undefined, limit: 50 });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or student ID…"
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ScholarshipStatus | '')}
          className="h-10 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {!data ? (
        <Skeleton className="h-64" />
      ) : data.data.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
          No students match your filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3 hidden md:table-cell">Group</th>
                <th className="px-4 py-3 text-right">GPA</th>
                <th className="px-4 py-3 text-right">Attendance</th>
                <th className="px-4 py-3 text-right">Score</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.data.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`${profileBase}/${s.id}`}
                      className="flex items-center gap-3 hover:text-primary"
                    >
                      <Avatar fallback={s.user.fullName} src={s.user.avatar ?? undefined} size="sm" />
                      <div className="min-w-0">
                        <div className="font-medium">{s.user.fullName}</div>
                        <div className="text-xs text-muted-foreground">{s.studentId}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {s.faculty} · {s.group}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{s.gpa}%</td>
                  <td className="px-4 py-3 text-right tabular-nums">{s.attendancePercent}%</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">
                    {s.overallScore.toFixed(1)}
                  </td>
                  <td className="px-4 py-3">
                    <ScholarshipBadge status={s.scholarshipStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
            {data.meta.total} students · page {data.meta.page} of {data.meta.totalPages}
          </div>
        </div>
      )}
    </div>
  );
}
