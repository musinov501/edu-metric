'use client';

import { useState } from 'react';
import { useLeaderboard, type LeaderboardFilter } from '@/lib/hooks/use-leaderboard';
import { Top3Podium } from './top3-podium';
import { LeaderboardTable } from './leaderboard-table';
import { WhyDialog } from './why-dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  filter?: LeaderboardFilter;
  highlightStudentId?: string;
}

export function LeaderboardView({ filter, highlightStudentId }: Props) {
  const { data, isLoading } = useLeaderboard(filter);
  const [selected, setSelected] = useState<string | undefined>();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
        No students in the leaderboard yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Top3Podium entries={data} onSelect={setSelected} />
      <LeaderboardTable
        entries={data}
        onSelect={setSelected}
        highlightStudentId={highlightStudentId}
      />
      <WhyDialog
        studentId={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(undefined)}
      />
    </div>
  );
}
