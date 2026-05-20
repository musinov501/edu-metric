'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ScholarshipBadge } from '@/components/kpi/scholarship-badge';
import { KpiBreakdownGrid } from '@/components/kpi/kpi-breakdown-grid';
import { WhyList } from '@/components/kpi/why-list';
import { useLeaderboardWhy } from '@/lib/hooks/use-leaderboard';

interface Props {
  studentId: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WhyDialog({ studentId, open, onOpenChange }: Props) {
  const { data, isLoading } = useLeaderboardWhy(open ? studentId : undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{data?.fullName ?? 'Why this ranking?'}</DialogTitle>
          <DialogDescription>
            Transparent breakdown of every score that produced this rank.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !data ? (
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-32" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
              <div>
                <div className="text-xs uppercase text-muted-foreground">Final score</div>
                <div className="text-3xl font-bold tabular-nums">
                  {data.breakdown?.finalScore.toFixed(1) ?? '—'}
                </div>
              </div>
              <ScholarshipBadge status={data.scholarshipStatus} />
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Why this score
              </h3>
              <WhyList entries={data.why} />
            </div>

            {data.breakdown && (
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Full breakdown
                </h3>
                <KpiBreakdownGrid breakdown={data.breakdown} />
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
