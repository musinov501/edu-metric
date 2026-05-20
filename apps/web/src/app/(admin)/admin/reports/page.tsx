'use client';

import { FileSpreadsheet, FileText, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const REPORTS = [
  {
    icon: Trophy,
    title: 'Leaderboard snapshot',
    description: 'Full ranking with KPI breakdown for the current semester.',
    formats: ['PDF', 'Excel', 'CSV'],
  },
  {
    icon: FileSpreadsheet,
    title: 'Scholarship candidates',
    description: 'Students with Final Score ≥ 80 and GPA ≥ 80, sorted by rank.',
    formats: ['PDF', 'Excel', 'CSV'],
  },
  {
    icon: FileText,
    title: 'Analytics summary',
    description: 'University-wide stats, group performance, penalty distribution.',
    formats: ['PDF', 'Excel'],
  },
];

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Generate downloadable exports for the dean's office, audits, or year-end reviews.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {REPORTS.map((r) => {
          const Icon = r.icon;
          return (
            <Card key={r.title}>
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{r.title}</CardTitle>
                <CardDescription>{r.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                {r.formats.map((f) => (
                  <Button key={f} variant="outline" size="sm" disabled>
                    {f}
                  </Button>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Export endpoints are reserved on the API surface (<code>/export/leaderboard?format=…</code>) and
        will wire up once the file-generation layer ships.
      </p>
    </div>
  );
}
