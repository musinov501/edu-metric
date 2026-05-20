'use client';

import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { useCreateStudent } from '@/lib/hooks/use-admin-mutations';

export function CreateStudentDialog() {
  const create = useCreateStudent();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: 'Password123!',
    studentId: '',
    faculty: 'Software Engineering',
    group: 'SE-21-01',
    courseYear: 1,
    gpa: 80,
    attendancePercent: 90,
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await create.mutateAsync(form);
      toast.success(`${form.fullName} added`);
      setOpen(false);
      setForm((f) => ({ ...f, fullName: '', email: '', studentId: '' }));
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? // @ts-expect-error axios
            (err.response?.data?.message ?? 'Failed to create student')
          : 'Network error';
      toast.error(typeof message === 'string' ? message : 'Failed');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> New student
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add student</DialogTitle>
          <DialogDescription>Creates a user account and student record in one step.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full name">
              <Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </Field>
            <Field label="Student ID">
              <Input required value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} placeholder="SE-2024-001" />
            </Field>
          </div>
          <Field label="Email">
            <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Initial password">
            <Input type="text" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Faculty">
              <Input required value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} />
            </Field>
            <Field label="Group">
              <Input required value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} />
            </Field>
            <Field label="Course year">
              <Input type="number" min={1} max={6} required value={form.courseYear} onChange={(e) => setForm({ ...form, courseYear: Number(e.target.value) })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Initial GPA %">
              <Input type="number" min={0} max={100} value={form.gpa} onChange={(e) => setForm({ ...form, gpa: Number(e.target.value) })} />
            </Field>
            <Field label="Attendance %">
              <Input type="number" min={0} max={100} value={form.attendancePercent} onChange={(e) => setForm({ ...form, attendancePercent: Number(e.target.value) })} />
            </Field>
          </div>
          <Button type="submit" disabled={create.isPending} className="w-full">
            {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create student
          </Button>
        </form>
      </DialogContent>
    </Dialog>
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
