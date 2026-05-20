import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0..100
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

const tones = {
  default: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

export function Progress({ value = 0, tone = 'default', className, ...props }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)} {...props}>
      <div
        className={cn('h-full transition-all', tones[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
