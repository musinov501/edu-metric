'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStudents } from '@/lib/hooks/use-students';
import { useIssuePenalty, type IssuePenaltyInput } from '@/lib/hooks/use-admin-mutations';

const TYPES: IssuePenaltyInput['type'][] = [
  'LATE',
  'PHONE_USAGE',
  'ABSENCE',
  'PLAGIARISM',
  'DORMITORY_VIOLATION',
  'DISRESPECT',
  'OTHER',
];
const SEVERITIES: IssuePenaltyInput['severity'][] = ['MINOR', 'MEDIUM', 'MAJOR', 'CRITICAL'];

export function IssuePenaltyForm({ defaultStudentId }: { defaultStudentId?: string }) {
  const { data: students } = useStudents({ limit: 200 });
  const issue = useIssuePenalty();

  const [studentId, setStudentId] = useState(defaultStudentId ?? '');
  const [type, setType] = useState<IssuePenaltyInput['type']>('LATE');
  const [severity, setSeverity] = useState<IssuePenaltyInput['severity']>('MINOR');
  const [reason, setReason] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId) {
      toast.error('Pick a student');
      return;
    }
    try {
      await issue.mutateAsync({ studentId, type, severity, reason });
      toast.success(`Penalty issued (${severity} · ${type})`);
      setReason('');
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
    <form onSubmit={onSubmit} className="space-y-3">
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
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Type</Label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as IssuePenaltyInput['type'])}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Severity</Label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as IssuePenaltyInput['severity'])}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Reason</Label>
        <Input required minLength={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="What happened?" />
      </div>
      <Button type="submit" variant="danger" disabled={issue.isPending}>
        {issue.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Issue penalty
      </Button>
      <p className="text-xs text-muted-foreground">
        Submitting recalculates the student's KPI and writes an activity log entry.
      </p>
    </form>
  );
}
