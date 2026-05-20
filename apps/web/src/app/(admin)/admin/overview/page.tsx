'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  ArrowUpRight,
  Award,
  CheckCircle2,
  Inbox,
  Sparkles,
  Users,
  XCircle,
} from 'lucide-react';
import { useUniversityOverview, useGroupAnalytics, useRiskRoster, useAdminAi } from '@/lib/hooks/use-analytics';
import { usePendingAchievements } from '@/lib/hooks/use-achievements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScholarshipBadge } from '@/components/kpi/scholarship-badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: typeof Users;
  tone?: 'default' | 'success' | 'warning' | 'danger';
  href?: string;
}

const TONE_COLORS = {
  default: 'text-primary bg-primary/10',
  success: 'text-success bg-success/10',
  warning: 'text-warning bg-warning/10',
  danger: 'text-danger bg-danger/10',
};

function StatCard({ label, value, icon: Icon, tone = 'default', href }: StatCardProps) {
  const inner = (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${TONE_COLORS[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
          <div className="text-2xl font-bold tabular-nums">{value}</div>
        </div>
        {href && <ArrowUpRight className="h-4 w-4 text-muted-foreground" />}
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function AdminOverviewPage() {
  const { data: overview } = useUniversityOverview();
  const { data: groups } = useGroupAnalytics();
  const { data: risk } = useRiskRoster();
  const { data: pending } = usePendingAchievements();
  const { data: ai } = useAdminAi();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">
          Live snapshot across the cohort. Pending approvals update KPIs instantly.
        </p>
      </header>

      {/* Top stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overview ? (
          <>
            <StatCard
              label="Total students"
              value={overview.totalStudents}
              icon={Users}
              href="/admin/students"
            />
            <StatCard
              label="Eligible"
              value={overview.eligibleStudents}
              icon={CheckCircle2}
              tone="success"
            />
            <StatCard
              label="At risk"
              value={overview.atRiskStudents}
              icon={AlertTriangle}
              tone="warning"
            />
            <StatCard
              label="Pending approvals"
              value={overview.pendingAchievements}
              icon={Inbox}
              tone="default"
              href="/admin/approvals"
            />
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        )}
      </div>

      {/* Secondary metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average GPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{overview?.averageGpa ?? '—'}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average final score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{overview?.averageScore ?? '—'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Penalties (30 d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">
              {overview?.activePenalties30d ?? '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Sparkles className="h-4 w-4 text-primary" />
            AI insights
          </CardTitle>
          <span className="text-xs text-muted-foreground">{ai?.source ?? '…'}</span>
        </CardHeader>
        <CardContent>
          {ai ? (
            <ul className="space-y-2 text-sm">
              {ai.insights.map((i, idx) => (
                <li key={idx} className="flex gap-2">
                  <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Skeleton className="h-16 w-full" />
          )}
        </CardContent>
      </Card>

      {/* Two columns: pending approvals + risk roster */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Inbox className="h-4 w-4" />
              Pending approvals
            </CardTitle>
            <Link href="/admin/approvals">
              <Button variant="outline" size="sm">
                Review all
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pending ? (
              pending.data.length === 0 ? (
                <p className="text-sm text-muted-foreground">Queue is empty.</p>
              ) : (
                <ul className="divide-y">
                  {pending.data.slice(0, 5).map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          fallback={a.student?.user.fullName ?? '?'}
                          src={a.student?.user.avatar ?? undefined}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{a.title}</div>
                          <div className="truncate text-xs text-muted-foreground">
                            {a.student?.user.fullName} · {a.type}
                          </div>
                        </div>
                      </div>
                      <Award className="h-4 w-4 text-muted-foreground" />
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <Skeleton className="h-32 w-full" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <XCircle className="h-4 w-4 text-danger" />
              Risk roster
            </CardTitle>
          </CardHeader>
          <CardContent>
            {risk ? (
              risk.length === 0 ? (
                <p className="text-sm text-muted-foreground">No at-risk students. </p>
              ) : (
                <ul className="divide-y">
                  {risk.slice(0, 6).map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          fallback={s.user.fullName}
                          src={s.user.avatar ?? undefined}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{s.user.fullName}</div>
                          <div className="truncate text-xs text-muted-foreground">
                            GPA {s.gpa}% · Attendance {s.attendancePercent}%
                          </div>
                        </div>
                      </div>
                      <ScholarshipBadge status={s.scholarshipStatus} />
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <Skeleton className="h-32 w-full" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Group breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Group breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {groups ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="pb-2">Faculty</th>
                    <th className="pb-2">Group</th>
                    <th className="pb-2 text-right">Students</th>
                    <th className="pb-2 text-right">Avg GPA</th>
                    <th className="pb-2 text-right">Avg score</th>
                    <th className="pb-2 text-right">Avg attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {groups.map((g) => (
                    <tr key={`${g.faculty}-${g.group}`} className="py-2">
                      <td className="py-2.5">{g.faculty}</td>
                      <td className="py-2.5 font-mono text-xs">{g.group}</td>
                      <td className="py-2.5 text-right tabular-nums">{g.students}</td>
                      <td className="py-2.5 text-right tabular-nums">{g.avgGpa}%</td>
                      <td className="py-2.5 text-right tabular-nums">{g.avgFinalScore}</td>
                      <td className="py-2.5 text-right tabular-nums">{g.avgAttendance}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Skeleton className="h-32 w-full" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
