'use client';

import Link from 'next/link';
import { AlertTriangle, CalendarCheck, ClipboardList, Users } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScholarshipBadge } from '@/components/kpi/scholarship-badge';
import { Button } from '@/components/ui/button';
import { useStudents } from '@/lib/hooks/use-students';

export default function MentorDashboardPage() {
  const { data: students } = useStudents({ limit: 100 });

  const assigned = students?.data ?? [];
  const atRisk = assigned.filter((s) => s.scholarshipStatus === 'AT_RISK' || s.scholarshipStatus === 'REJECTED');
  const lowAttendance = assigned.filter((s) => s.attendancePercent < 75);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Mentor dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your assigned students and the ones who need attention right now.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Assigned students" value={assigned.length} icon={Users} />
        <Stat label="At-risk students" value={atRisk.length} icon={AlertTriangle} tone="warning" />
        <Stat label="Low attendance (<75%)" value={lowAttendance.length} icon={CalendarCheck} tone="danger" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Weak performance alerts</CardTitle>
            <Link href="/mentor/students">
              <Button variant="outline" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {!students ? (
              <Skeleton className="h-32" />
            ) : atRisk.length === 0 ? (
              <p className="text-sm text-muted-foreground">No students at risk.</p>
            ) : (
              <ul className="divide-y">
                {atRisk.slice(0, 8).map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar fallback={s.user.fullName} src={s.user.avatar ?? undefined} size="sm" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{s.user.fullName}</div>
                        <div className="text-xs text-muted-foreground">
                          GPA {s.gpa}% · Attendance {s.attendancePercent}%
                        </div>
                      </div>
                    </div>
                    <ScholarshipBadge status={s.scholarshipStatus} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link href="/mentor/attendance">
              <Button variant="outline" className="w-full justify-start">
                <CalendarCheck className="h-4 w-4" /> Mark attendance
              </Button>
            </Link>
            <Link href="/mentor/assignments">
              <Button variant="outline" className="w-full justify-start">
                <ClipboardList className="h-4 w-4" /> Score assignment
              </Button>
            </Link>
            <Link href="/mentor/feedback">
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="h-4 w-4" /> Issue penalty
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  tone?: 'warning' | 'danger';
}) {
  const color =
    tone === 'warning' ? 'text-warning bg-warning/10' : tone === 'danger' ? 'text-danger bg-danger/10' : 'text-primary bg-primary/10';
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="text-2xl font-bold tabular-nums">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
