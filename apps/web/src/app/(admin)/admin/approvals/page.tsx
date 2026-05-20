'use client';

import { useState } from 'react';
import { Check, ExternalLink, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  usePendingAchievements,
  useApproveAchievement,
  useRejectAchievement,
} from '@/lib/hooks/use-achievements';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function ApprovalsPage() {
  const { data } = usePendingAchievements();
  const approve = useApproveAchievement();
  const reject = useRejectAchievement();
  const [scoreOverride, setScoreOverride] = useState<Record<string, string>>({});
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  async function onApprove(id: string) {
    const raw = scoreOverride[id];
    const score = raw ? Math.max(0, Math.min(10, Number(raw))) : undefined;
    try {
      await approve.mutateAsync({ id, score });
      toast.success('Achievement approved — KPI recalculated');
    } catch {
      toast.error('Approval failed');
    }
  }

  async function onReject(id: string) {
    const reason = rejectReason[id] ?? 'Not eligible';
    if (reason.length < 3) {
      toast.error('Please add a short reason');
      return;
    }
    try {
      await reject.mutateAsync({ id, reason });
      toast.success('Achievement rejected');
    } catch {
      toast.error('Rejection failed');
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pending approvals</h1>
          <p className="text-sm text-muted-foreground">
            Approving triggers an instant KPI recalc + leaderboard update.
          </p>
        </div>
        {data && (
          <Badge variant="default" className="text-sm">
            {data.meta.total} in queue
          </Badge>
        )}
      </header>

      {!data ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : data.data.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
          🎉 Queue is empty.
        </div>
      ) : (
        <div className="space-y-3">
          {data.data.map((a) => (
            <Card key={a.id}>
              <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <Avatar
                  fallback={a.student?.user.fullName ?? '?'}
                  src={a.student?.user.avatar ?? undefined}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base font-semibold">{a.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {a.student?.user.fullName} · {a.type}
                  </p>
                  {a.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
                  )}
                </div>
                {a.externalLink && (
                  <a
                    href={a.externalLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" /> Link
                  </a>
                )}
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    placeholder="Score (default by type)"
                    value={scoreOverride[a.id] ?? ''}
                    onChange={(e) =>
                      setScoreOverride((prev) => ({ ...prev, [a.id]: e.target.value }))
                    }
                  />
                  <Button
                    variant="default"
                    onClick={() => onApprove(a.id)}
                    disabled={approve.isPending}
                  >
                    {approve.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Approve
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Reason for rejection…"
                    value={rejectReason[a.id] ?? ''}
                    onChange={(e) =>
                      setRejectReason((prev) => ({ ...prev, [a.id]: e.target.value }))
                    }
                  />
                  <Button
                    variant="danger"
                    onClick={() => onReject(a.id)}
                    disabled={reject.isPending}
                  >
                    {reject.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
