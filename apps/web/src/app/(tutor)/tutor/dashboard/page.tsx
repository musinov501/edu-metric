'use client';

import Link from 'next/link';
import { HeartHandshake, ListChecks, Shield, Users } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ScholarshipBadge } from '@/components/kpi/scholarship-badge';
import { useStudents } from '@/lib/hooks/use-students';

export default function TutorDashboardPage() {
  const { data: students } = useStudents({ limit: 100 });
  const assigned = students?.data ?? [];
  const lowDiscipline = assigned.filter((s) => s.scholarshipStatus !== 'ELIGIBLE');

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Tutor dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Social, ethical, and discipline supervisors get a focused view of who needs intervention.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Assigned students" value={assigned.length} icon={Users} />
        <Stat label="Need attention" value={lowDiscipline.length} icon={Shield} tone="warning" />
        <Stat
          label="Active recovery tasks"
          value={assigned.reduce((acc, _s) => acc + 0, 0)}
          icon={ListChecks}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Watch list</CardTitle>
            <Link href="/tutor/students">
              <Button variant="outline" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {!students ? (
              <Skeleton className="h-32" />
            ) : lowDiscipline.length === 0 ? (
              <p className="text-sm text-muted-foreground">Everyone is on track.</p>
            ) : (
              <ul className="divide-y">
                {lowDiscipline.slice(0, 8).map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar fallback={s.user.fullName} src={s.user.avatar ?? undefined} size="sm" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{s.user.fullName}</div>
                        <div className="text-xs text-muted-foreground">{s.group}</div>
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
            <Link href="/tutor/social-evaluation">
              <Button variant="outline" className="w-full justify-start">
                <HeartHandshake className="h-4 w-4" /> Score social evaluation
              </Button>
            </Link>
            <Link href="/tutor/recovery-tasks">
              <Button variant="outline" className="w-full justify-start">
                <ListChecks className="h-4 w-4" /> Assign / verify recovery
              </Button>
            </Link>
            <Link href="/tutor/discipline">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4" /> Discipline log
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
  tone?: 'warning';
}) {
  const color = tone === 'warning' ? 'text-warning bg-warning/10' : 'text-primary bg-primary/10';
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
