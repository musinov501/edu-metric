'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Operational settings. Scoring constants and platform-wide toggles are managed in Super Admin.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Approval queue</CardTitle>
          <CardDescription>Defaults applied when reviewing pending submissions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
          <Row label="Duplicate detection" value={<Badge variant="success">enabled</Badge>} />
          <Row label="Auto-recalculate KPI on approve" value={<Badge variant="success">enabled</Badge>} />
          <Row label="Auto-recalculate on penalty" value={<Badge variant="success">enabled</Badge>} />
          <Row label="Achievement file storage" value={<Badge variant="muted">Cloudinary</Badge>} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification triggers</CardTitle>
          <CardDescription>Events that push an in-app notification.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          {['Certificate approved', 'Penalty issued', 'Recovery completed', 'Ranking changed', 'Scholarship risk detected'].map(
            (t) => (
              <Row key={t} label={t} value={<Badge variant="success">on</Badge>} />
            ),
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <span>{label}</span>
      {value}
    </div>
  );
}
