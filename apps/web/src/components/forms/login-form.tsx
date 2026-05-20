'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api/auth';
import { ROLE_REDIRECTS } from '@/lib/constants/routes';

export function LoginForm() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { user } = await authApi.login(email, password);
      // Full reload — drops React Query cache + Zustand store + re-runs
      // middleware with the new cookie. Prevents the "old role still showing"
      // bug when switching accounts in the same tab.
      const next = searchParams.get('next');
      const dest = next ?? ROLE_REDIRECTS[user.role];
      window.location.assign(dest);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? // @ts-expect-error axios error shape
            (err.response?.data?.message ?? 'Invalid credentials')
          : 'Network error';
      toast.error(typeof message === 'string' ? message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  function fillDemo(role: 'student' | 'mentor' | 'tutor' | 'admin' | 'superadmin') {
    setEmail(`${role}@edumetric.dev`);
    setPassword('Password123!');
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to EduMetric</h1>
        <p className="text-sm text-muted-foreground">Transparent scholarship evaluation.</p>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@edumetric.dev"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? 'Signing in…' : 'Sign in'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        New here?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>

      <div className="border-t pt-4">
        <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Demo accounts · click to fill
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(['student', 'mentor', 'tutor', 'admin', 'superadmin'] as const).map((r) => (
            <Button
              key={r}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fillDemo(r)}
              disabled={submitting}
              className="capitalize"
            >
              {r === 'superadmin' ? 'Super Admin' : r}
            </Button>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          All demo passwords: <code className="rounded bg-muted px-1.5 py-0.5">Password123!</code>
        </p>
      </div>
    </form>
  );
}
