'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PlatformSettingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Platform settings</h1>
        <p className="text-sm text-muted-foreground">
          Global configuration. Edit in <code>apps/api/.env</code> for now; UI configuration coming.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Runtime</CardTitle>
          <CardDescription>Environment-driven values currently in effect.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <Row label="API base URL" value="/api/v1" />
          <Row label="Rate limit (default)" value="10,000 req / 60s (dev)" />
          <Row label="Frontend port" value="3001" />
          <Row label="Backend port" value="4000" />
          <Row label="JWT lifetime" value="7 days" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feature flags</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <Row label="Guest mode" value={<Badge variant="success">on</Badge>} />
          <Row label="AI insights" value={<Badge variant="warning">rule-based (no key)</Badge>} />
          <Row label="Cloudinary uploads" value={<Badge variant="warning">not configured</Badge>} />
          <Row label="Email notifications" value={<Badge variant="muted">planned</Badge>} />
          <Row label="Telegram bot" value={<Badge variant="muted">out of MVP scope</Badge>} />
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
