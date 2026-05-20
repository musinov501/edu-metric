'use client';

import { Cloud, Sparkles, Lock, FileImage } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const INTEGRATIONS = [
  { icon: Lock, name: 'Authentication', detail: 'JWT (in-house). Clerk/Auth.js compatible.', envKey: 'JWT_SECRET', status: 'connected' as const },
  { icon: FileImage, name: 'Cloudinary', detail: 'File uploads for certificates + employment proof.', envKey: 'CLOUDINARY_API_KEY', status: 'pending' as const },
  { icon: Sparkles, name: 'OpenAI', detail: 'AI insights generator (student + admin).', envKey: 'OPENAI_API_KEY', status: 'pending' as const },
  { icon: Sparkles, name: 'Gemini', detail: 'Alternative AI provider.', envKey: 'GEMINI_API_KEY', status: 'pending' as const },
  { icon: Cloud, name: 'Database', detail: 'PostgreSQL 16 (local Homebrew in dev).', envKey: 'DATABASE_URL', status: 'connected' as const },
];

const TONE = { connected: 'success', pending: 'warning' } as const;

export default function ApiIntegrationsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">API integrations</h1>
        <p className="text-sm text-muted-foreground">
          External services the platform depends on. Configure each via environment variables on the
          API server.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {INTEGRATIONS.map((i) => {
          const Icon = i.icon;
          return (
            <Card key={i.name}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{i.name}</CardTitle>
                    <CardDescription className="text-xs">{i.detail}</CardDescription>
                  </div>
                </div>
                <Badge variant={TONE[i.status]}>{i.status}</Badge>
              </CardHeader>
              <CardContent>
                <code className="rounded bg-muted px-2 py-1 text-xs">{i.envKey}</code>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
