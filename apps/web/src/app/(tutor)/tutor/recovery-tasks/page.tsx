'use client';

import { useState } from 'react';
import { Loader2, ListChecks } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudents } from '@/lib/hooks/use-students';
import { useAssignRecovery, useCompleteRecovery, useRecoveryByStudent } from '@/lib/hooks/use-admin-mutations';

export default function TutorRecoveryTasksPage() {
  const { data: students } = useStudents({ limit: 200 });
  const assign = useAssignRecovery();
  const complete = useCompleteRecovery();

  const [studentId, setStudentId] = useState('');
  const [task, setTask] = useState('');

  const { data: recoveries } = useRecoveryByStudent(studentId || undefined);

  async function onAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId) return toast.error('Pick a student');
    if (task.length < 5) return toast.error('Describe the task');
    try {
      await assign.mutateAsync({ studentId, assignedTask: task });
      toast.success('Recovery task assigned');
      setTask('');
    } catch {
      toast.error('Failed to assign');
    }
  }

  async function onComplete(id: string) {
    try {
      await complete.mutateAsync({ id });
      toast.success('Recovery verified — KPI updated');
    } catch {
      toast.error('Failed to complete');
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Recovery tasks</h1>
        <p className="text-sm text-muted-foreground">
          Assign volunteer / mentoring / support work. Verifying completion restores up to{' '}
          <span className="font-medium">min(|penalty|/2, 10)</span> points.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assign new task</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onAssign} className="space-y-3">
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
              <div className="space-y-1.5">
                <Label className="text-xs">Task</Label>
                <Input
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="Volunteer 5 hours at the university open day"
                  required
                  minLength={5}
                />
              </div>
              <Button type="submit" disabled={assign.isPending}>
                {assign.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Assign
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ListChecks className="h-4 w-4" /> Tasks for selected student
            </CardTitle>
            <CardDescription>{studentId ? 'Verify pending tasks below.' : 'Pick a student to see their tasks.'}</CardDescription>
          </CardHeader>
          <CardContent>
            {!studentId ? (
              <p className="text-sm text-muted-foreground">No student selected.</p>
            ) : !recoveries ? (
              <Skeleton className="h-32" />
            ) : recoveries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks assigned yet.</p>
            ) : (
              <ul className="space-y-2">
                {recoveries.map((r) => (
                  <li key={r.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{r.assignedTask}</div>
                      {r.status === 'COMPLETED' && (
                        <div className="text-xs text-muted-foreground">Recovered +{r.recoveredPoints} pts</div>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant={r.status === 'COMPLETED' ? 'success' : r.status === 'REJECTED' ? 'danger' : 'muted'}>
                        {r.status.toLowerCase()}
                      </Badge>
                      {r.status === 'PENDING' && (
                        <Button size="sm" onClick={() => onComplete(r.id)} disabled={complete.isPending}>
                          Verify
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
