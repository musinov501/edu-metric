'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  className?: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

const TONES = {
  default: 'accent-primary',
  success: 'accent-success',
  warning: 'accent-warning',
  danger: 'accent-danger',
};

/**
 * Lightweight slider built on the native range input — full accent-color support,
 * 0 deps. For the tutor evaluation form we just need a visible knob + numeric value.
 */
export function Slider({ value, onChange, min = 0, max = 5, step = 1, label, className, tone = 'default' }: SliderProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium">{label}</span>
          <span className="tabular-nums text-muted-foreground">
            {value} / {max}
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn('w-full cursor-pointer', TONES[tone])}
      />
    </div>
  );
}
