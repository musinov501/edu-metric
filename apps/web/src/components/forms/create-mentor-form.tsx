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
} from '@/components/ui/dialog';
import { useCreateMentor, useCreateTutor } from '@/lib/hooks/use-admin-mutations';

interface Props {
  kind: 'mentor' | 'tutor';
}

export function CreateMentorTutorDialog({ kind }: Props) {
  const createMentor = useCreateMentor();
  const createTutor = useCreateTutor();
  const submit = kind === 'mentor' ? createMentor : createTutor;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: 'Password123!',
    specialization: '',
    assignedDormitory: '',
    assignedGroups: '',
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const assignedGroups = form.assignedGroups
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);
    try {
      if (kind === 'mentor') {
        await createMentor.mutateAsync({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          specialization: form.specialization || undefined,
          assignedGroups,
        });
      } else {
        await createTutor.mutateAsync({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          assignedDormitory: form.assignedDormitory || undefined,
          assignedGroups,
        });
      }
      toast.success(`${form.fullName} added`);
      setOpen(false);
      setForm({ fullName: '', email: '', password: 'Password123!', specialization: '', assignedDormitory: '', assignedGroups: '' });
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? // @ts-expect-error axios
            (err.response?.data?.message ?? 'Failed to create')
          : 'Network error';
      toast.error(typeof message === 'string' ? message : 'Failed');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> New {kind}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {kind}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <Field label="Full name">
            <Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </Field>
          <Field label="Email">
            <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Initial password">
            <Input required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          {kind === 'mentor' ? (
            <Field label="Specialization">
              <Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="Software Engineering" />
            </Field>
          ) : (
            <Field label="Dormitory">
              <Input value={form.assignedDormitory} onChange={(e) => setForm({ ...form, assignedDormitory: e.target.value })} placeholder="Dorm A" />
            </Field>
          )}
          <Field label="Assigned groups (comma-separated)">
            <Input value={form.assignedGroups} onChange={(e) => setForm({ ...form, assignedGroups: e.target.value })} placeholder="SE-21-01, SE-21-02" />
          </Field>
          <Button type="submit" disabled={submit.isPending} className="w-full">
            {submit.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create {kind}
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
