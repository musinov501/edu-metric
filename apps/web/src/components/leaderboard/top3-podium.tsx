import { Crown, Medal } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import type { LeaderboardEntry } from '@/lib/api/types';
import { cn } from '@/lib/utils';

const RANK_DECOR = {
  1: {
    height: 'h-40',
    bg: 'bg-gradient-to-b from-warning/30 to-warning/5',
    label: '1st',
    icon: <Crown className="h-5 w-5 text-warning" />,
    avatarSize: 'xl' as const,
  },
  2: {
    height: 'h-32',
    bg: 'bg-gradient-to-b from-muted/50 to-muted/10',
    label: '2nd',
    icon: <Medal className="h-5 w-5 text-muted-foreground" />,
    avatarSize: 'lg' as const,
  },
  3: {
    height: 'h-28',
    bg: 'bg-gradient-to-b from-orange-500/20 to-orange-500/5',
    label: '3rd',
    icon: <Medal className="h-5 w-5 text-orange-600" />,
    avatarSize: 'lg' as const,
  },
};

interface Props {
  entries: LeaderboardEntry[];
  onSelect?: (studentId: string) => void;
}

export function Top3Podium({ entries, onSelect }: Props) {
  const top3 = entries.slice(0, 3);
  if (top3.length === 0) return null;

  // Render order: 2 · 1 · 3
  const ordered = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className="grid grid-cols-3 items-end gap-3">
      {ordered.map((entry) => {
        const decor = RANK_DECOR[entry.rank as 1 | 2 | 3];
        if (!decor) return null;
        return (
          <button
            key={entry.studentId}
            type="button"
            onClick={() => onSelect?.(entry.studentId)}
            className={cn(
              'group flex flex-col items-center rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md text-left',
              decor.bg,
              decor.height,
            )}
          >
            <Avatar
              fallback={entry.fullName}
              src={entry.avatar ?? undefined}
              size={decor.avatarSize}
              className="ring-4 ring-card"
            />
            <div className="mt-2 flex items-center gap-1.5">
              {decor.icon}
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {decor.label}
              </span>
            </div>
            <div className="mt-1 truncate w-full text-center text-sm font-semibold">
              {entry.fullName}
            </div>
            <div className="text-xs text-muted-foreground">
              {entry.finalScore.toFixed(1)} pts
            </div>
          </button>
        );
      })}
    </div>
  );
}
