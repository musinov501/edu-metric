'use client';

import Link from 'next/link';
import { ExternalLink, Inbox } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { usePendingAchievements } from '@/lib/hooks/use-achievements';

export default function AdminAchievementsPage() {
  const { data: pending } = usePendingAchievements();

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Achievements</h1>
          <p className="text-sm text-muted-foreground">
            Pending submissions awaiting review.
          </p>
        </div>
        <Link href="/admin/approvals">
          <Button>
            <Inbox className="h-4 w-4" /> Open approvals queue
          </Button>
        </Link>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pending submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {!pending ? (
            <Skeleton className="h-32" />
          ) : pending.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">Queue is empty.</p>
          ) : (
            <ul className="divide-y">
              {pending.data.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{a.title}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {a.student?.user.fullName} · {a.type}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {a.externalLink && (
                      <a
                        href={a.externalLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" /> Link
                      </a>
                    )}
                    <Badge variant="muted">pending</Badge>
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
