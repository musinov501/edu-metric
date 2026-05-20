'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import { useStudents } from '@/lib/hooks/use-students';
import { useMarkAttendance } from '@/lib/hooks/use-admin-mutations';

type Status = 'PRESENT' | 'LATE' | 'EXCUSED' | 'ABSENT';

const STATUS_COLOR: Record<Status, string> = {
  PRESENT: 'bg-success text-success-foreground',
  LATE: 'bg-warning text-warning-foreground',
  EXCUSED: 'bg-muted text-muted-foreground',
  ABSENT: 'bg-danger text-danger-foreground',
};

export default function MentorAttendancePage() {
  const { data: students } = useStudents({ limit: 100 });
  const mark = useMarkAttendance();
  const [subject, setSubject] = useState('Algorithms');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [statuses, setStatuses] = useState<Record<string, Status>>({});

  function setStatus(id: string, s: Status) {
    setStatuses((prev) => ({ ...prev, [id]: s }));
  }

  async function submitAll() {
    if (!students) return;
    const entries = Object.entries(statuses);
    if (entries.length === 0) {
      toast.error('Pick at least one status');
      return;
    }
    try {
      for (const [studentId, status] of entries) {
        await mark.mutateAsync({ studentId, subject, date, status });
      }
      toast.success(`Saved ${entries.length} attendance record${entries.length === 1 ? '' : 's'}`);
      setStatuses({});
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? // @ts-expect-error axios
            (err.response?.data?.message ?? 'Failed')
          : 'Network error';
      toast.error(typeof message === 'string' ? message : 'Failed');
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
        <p className="text-sm text-muted-foreground">
          Pick a subject + date, then tag each student. Submitting recalculates attendance % and KPI.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session</CardTitle>
          <CardDescription>Same subject + date applies to every status you set below.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button onClick={submitAll} disabled={mark.isPending} className="w-full">
              {mark.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save attendance
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Students</CardTitle>
        </CardHeader>
        <CardContent>
          {!students ? (
            <Skeleton className="h-48" />
          ) : students.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assigned students.</p>
          ) : (
            <ul className="divide-y">
              {students.data.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar fallback={s.user.fullName} src={s.user.avatar ?? undefined} size="sm" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{s.user.fullName}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.group} · attendance {s.attendancePercent}%
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {(['PRESENT', 'LATE', 'EXCUSED', 'ABSENT'] as Status[]).map((st) => {
                      const active = statuses[s.id] === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStatus(s.id, st)}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                            active ? STATUS_COLOR[st] : 'border bg-background text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {st[0]}
                          <span className="ml-1 hidden sm:inline">{st.slice(1).toLowerCase()}</span>
                        </button>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
