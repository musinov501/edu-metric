'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useStudents } from '@/lib/hooks/use-students';
import { useRecordTutorEvaluation } from '@/lib/hooks/use-admin-mutations';

export default function TutorSocialEvaluationPage() {
  const { data: students } = useStudents({ limit: 200 });
  const record = useRecordTutorEvaluation();
  const [studentId, setStudentId] = useState('');
  const [scores, setScores] = useState({
    ethics: 4,
    communication: 4,
    socialActivity: 4,
    discipline: 4,
    motivation: 4,
  });
  const [notes, setNotes] = useState('');

  const avg = (scores.ethics + scores.communication + scores.socialActivity + scores.discipline + scores.motivation) / 5;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId) {
      toast.error('Pick a student');
      return;
    }
    try {
      await record.mutateAsync({ studentId, ...scores, notes: notes || undefined });
      toast.success(`Recorded evaluation (avg ${avg.toFixed(2)}/5)`);
      setNotes('');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? // @ts-expect-error axios
            (err.response?.data?.message ?? 'Failed')
          : 'Network error';
      toast.error(typeof message === 'string' ? message : 'Failed');
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Social evaluation</h1>
        <p className="text-sm text-muted-foreground">
          Five axes, each on a 0–5 scale. Most recent evaluation feeds the KPI Tutor Score (max 5).
        </p>
      </header>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Record evaluation</CardTitle>
          <CardDescription>
            Live average: <span className="font-semibold tabular-nums">{avg.toFixed(2)} / 5</span> · Tutor Score impact: <span className="font-semibold tabular-nums">{avg.toFixed(2)} / 5</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs">Student</Label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                required
              >
                <option value="">Select student…</option>
                {students?.data.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.user.fullName} · {s.studentId}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <Slider label="Ethics" value={scores.ethics} onChange={(v) => setScores({ ...scores, ethics: v })} />
              <Slider label="Communication" value={scores.communication} onChange={(v) => setScores({ ...scores, communication: v })} />
              <Slider label="Social activity" value={scores.socialActivity} onChange={(v) => setScores({ ...scores, socialActivity: v })} />
              <Slider label="Discipline" value={scores.discipline} onChange={(v) => setScores({ ...scores, discipline: v })} />
              <Slider label="Motivation" value={scores.motivation} onChange={(v) => setScores({ ...scores, motivation: v })} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Notes (optional)</Label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Context for this evaluation…"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <Button type="submit" disabled={record.isPending}>
              {record.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save evaluation
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
