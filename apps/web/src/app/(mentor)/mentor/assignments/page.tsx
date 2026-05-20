'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStudents } from '@/lib/hooks/use-students';
import { useRecordAssignment } from '@/lib/hooks/use-admin-mutations';

export default function MentorAssignmentsPage() {
  const { data: students } = useStudents({ limit: 200 });
  const record = useRecordAssignment();
  const [form, setForm] = useState({
    studentId: '',
    subject: 'Algorithms',
    title: '',
    completionScore: 80,
    qualityScore: 80,
    originalityScore: 80,
    deadlineScore: 80,
  });

  const weighted =
    form.completionScore * 0.3 + form.qualityScore * 0.3 + form.originalityScore * 0.25 + form.deadlineScore * 0.15;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.studentId) {
      toast.error('Pick a student');
      return;
    }
    try {
      await record.mutateAsync(form);
      toast.success(`Recorded "${form.title}" (total ${weighted.toFixed(1)})`);
      setForm((f) => ({ ...f, title: '' }));
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
        <h1 className="text-2xl font-semibold tracking-tight">Assignments</h1>
        <p className="text-sm text-muted-foreground">
          Score on Completion / Quality / Originality / Deadline. KPI weights them 30 / 30 / 25 / 15.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Record assignment</CardTitle>
          <CardDescription>
            Live weighted total: <span className="font-semibold tabular-nums">{weighted.toFixed(1)} / 100</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Student">
                <select
                  value={form.studentId}
                  onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  required
                >
                  <option value="">Select…</option>
                  {students?.data.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.user.fullName} · {s.studentId}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Subject">
                <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
              </Field>
            </div>
            <Field label="Title">
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required minLength={2} placeholder="Sorting Lab" />
            </Field>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ScoreField label="Completion (30%)" value={form.completionScore} onChange={(v) => setForm({ ...form, completionScore: v })} />
              <ScoreField label="Quality (30%)" value={form.qualityScore} onChange={(v) => setForm({ ...form, qualityScore: v })} />
              <ScoreField label="Originality (25%)" value={form.originalityScore} onChange={(v) => setForm({ ...form, originalityScore: v })} />
              <ScoreField label="Deadline (15%)" value={form.deadlineScore} onChange={(v) => setForm({ ...form, deadlineScore: v })} />
            </div>
            <Button type="submit" disabled={record.isPending}>
              {record.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save assignment
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function ScoreField({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <Field label={label}>
      <Input type="number" min={0} max={100} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </Field>
  );
}
