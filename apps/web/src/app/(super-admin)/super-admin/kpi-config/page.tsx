'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const KPI_MAX = {
  ACADEMIC: 40,
  ATTENDANCE: 20,
  ASSIGNMENT: 15,
  ACTIVITY: 10,
  TUTOR: 5,
  DISCIPLINE: 10,
  PENALTY: -20,
  RECOVERY: 10,
  EMPLOYMENT_BONUS: 10,
};

const ACTIVITY_POINTS = [
  ['Hackathon participation', 1],
  ['Hackathon winner', 3],
  ['Startup project', 5],
  ['Mentoring weak students', 3],
  ['PDP online certificate', 2],
  ['PDP offline certificate', 3],
  ['National IT certificate', 2],
  ['English certificate', 3],
  ['International IT certificate', 5],
  ['PDP ecosystem work', 2],
] as const;

const PENALTY_SEVERITY = [
  ['MINOR', '-1'],
  ['MEDIUM', '-3'],
  ['MAJOR', '-5'],
  ['CRITICAL', '-10 to -15'],
] as const;

export default function KpiConfigPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">KPI configuration</h1>
        <p className="text-sm text-muted-foreground">
          The scoring rules currently active in the engine. Constants are version-controlled in code
          (<code>apps/api/src/scoring/kpi.constants.ts</code>) and may be made editable from this page in a
          future release.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scoring weights</CardTitle>
          <CardDescription>
            Base KPI sums to 100. Adjustments — Penalty (−20), Recovery (+10), Employment (+10) — bring the
            theoretical range to [0, 130].
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {Object.entries(KPI_MAX).map(([k, v]) => (
            <div key={k} className="space-y-1.5">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium">{k.replace(/_/g, ' ').toLowerCase()}</span>
                <span className="font-semibold tabular-nums">{v}</span>
              </div>
              <Progress value={(Math.abs(v) / 40) * 100} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity point table</CardTitle>
            <CardDescription>
              Defaults used when an admin approves an achievement without overriding the score.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y text-sm">
              {ACTIVITY_POINTS.map(([label, pts]) => (
                <li key={label} className="flex items-center justify-between py-2">
                  <span>{label}</span>
                  <span className="font-semibold tabular-nums">+{pts}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Penalty severity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y text-sm">
              {PENALTY_SEVERITY.map(([sev, range]) => (
                <li key={sev} className="flex items-center justify-between py-2">
                  <Badge variant={sev === 'CRITICAL' || sev === 'MAJOR' ? 'danger' : sev === 'MEDIUM' ? 'warning' : 'muted'}>
                    {sev}
                  </Badge>
                  <span className="font-semibold tabular-nums text-danger">{range}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Total penalties cap at −20. Recovery cap is <span className="font-mono">min(|penalty|/2, 10)</span>.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scholarship thresholds</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
          <div className="rounded-lg border p-3">
            <div className="text-muted-foreground text-xs">Auto-reject if</div>
            <div className="font-semibold">GPA &lt; 80%</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-muted-foreground text-xs">Not eligible if</div>
            <div className="font-semibold">Final score &lt; 80</div>
          </div>
          <div className="rounded-lg border p-3 sm:col-span-2">
            <div className="text-muted-foreground text-xs">Leaderboard tie-break order</div>
            <div className="font-medium">Final score → GPA → Attendance → Discipline → Activities</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
