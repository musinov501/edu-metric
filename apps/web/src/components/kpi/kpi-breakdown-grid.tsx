import { Progress } from '@/components/ui/progress';
import type { KpiBreakdown } from '@/lib/api/types';

interface Row {
  label: string;
  value: number;
  max: number;
  tone?: 'default' | 'success' | 'warning' | 'danger';
  helper?: string;
}

export function KpiBreakdownGrid({ breakdown }: { breakdown: KpiBreakdown }) {
  const rows: Row[] = [
    { label: 'Academic Performance', value: breakdown.academicScore, max: 40, helper: 'GPA × 40' },
    { label: 'Attendance', value: breakdown.attendanceScore, max: 20, helper: 'Attendance % × 20' },
    { label: 'Assignments', value: breakdown.assignmentScore, max: 15, helper: 'C·30 + Q·30 + O·25 + D·15' },
    { label: 'Activities & Certs', value: breakdown.activityScore, max: 10, helper: 'Approved achievements' },
    { label: 'Tutor Evaluation', value: breakdown.tutorScore, max: 5, helper: 'Ethics / Comm / Social / Discipline / Motivation' },
    {
      label: 'Discipline',
      value: breakdown.disciplineScore,
      max: 10,
      tone: breakdown.disciplineScore < 5 ? 'danger' : breakdown.disciplineScore < 8 ? 'warning' : 'success',
      helper: 'Starts at 10, floor 0',
    },
    {
      label: 'Penalties',
      value: Math.abs(breakdown.penaltyScore),
      max: 20,
      tone: 'danger',
      helper: 'Capped at −20',
    },
    {
      label: 'Recovery',
      value: breakdown.recoveryScore,
      max: 10,
      tone: 'success',
      helper: 'min(|penalty|/2, 10)',
    },
    {
      label: 'Employment Bonus',
      value: breakdown.employmentBonus,
      max: 10,
      tone: 'success',
      helper: 'Internship 0–5, Part-time 5–7, Full-time 7–10',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {rows.map((r) => (
        <div key={r.label} className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-sm font-medium">{r.label}</div>
              <div className="text-[11px] text-muted-foreground">{r.helper}</div>
            </div>
            <div className="text-sm tabular-nums">
              <span className="font-semibold">{r.value}</span>
              <span className="text-muted-foreground"> / {r.max}</span>
            </div>
          </div>
          <Progress value={(r.value / r.max) * 100} tone={r.tone} />
        </div>
      ))}
    </div>
  );
}
