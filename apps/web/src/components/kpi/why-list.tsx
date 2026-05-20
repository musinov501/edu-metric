import { CheckCircle2, MinusCircle, AlertCircle } from 'lucide-react';
import type { ExplainableScoreEntry } from '@/lib/api/types';
import { cn } from '@/lib/utils';

const ICONS = {
  POSITIVE: CheckCircle2,
  NEGATIVE: AlertCircle,
  NEUTRAL: MinusCircle,
};

const TONES = {
  POSITIVE: 'text-success',
  NEGATIVE: 'text-danger',
  NEUTRAL: 'text-muted-foreground',
};

export function WhyList({ entries }: { entries: ExplainableScoreEntry[] }) {
  if (!entries.length) {
    return <div className="text-sm text-muted-foreground">No explanation available yet.</div>;
  }
  return (
    <ul className="space-y-2 text-sm">
      {entries.map((e, i) => {
        const Icon = ICONS[e.kind];
        return (
          <li key={i} className="flex items-start gap-2">
            <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', TONES[e.kind])} />
            <div>
              <span className="font-medium">{e.label}</span>
              {e.detail && <span className="text-muted-foreground"> — {e.detail}</span>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
