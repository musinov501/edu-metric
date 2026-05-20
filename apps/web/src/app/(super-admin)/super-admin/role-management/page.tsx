'use client';

import { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUsers, type UserRow } from '@/lib/hooks/use-admin-mutations';

const ROLE_TONE: Record<UserRow['role'], 'default' | 'success' | 'warning' | 'danger' | 'muted'> = {
  STUDENT: 'default',
  MENTOR: 'success',
  TUTOR: 'success',
  ADMIN: 'warning',
  SUPER_ADMIN: 'danger',
};

const ROLES: UserRow['role'][] = ['STUDENT', 'MENTOR', 'TUTOR', 'ADMIN', 'SUPER_ADMIN'];

export default function RoleManagementPage() {
  const [filter, setFilter] = useState<UserRow['role'] | ''>('');
  const { data: users } = useUsers(filter || undefined);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Role management</h1>
        <p className="text-sm text-muted-foreground">
          Every account on the platform. Filter by role to scope your view.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">{users?.length ?? 0} users</CardTitle>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as UserRow['role'] | '')}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r.replace('_', ' ')}
              </option>
            ))}
          </select>
        </CardHeader>
        <CardContent>
          {!users ? (
            <Skeleton className="h-64" />
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users match.</p>
          ) : (
            <ul className="divide-y">
              {users.map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar fallback={u.fullName} src={u.avatar ?? undefined} size="sm" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{u.fullName}</div>
                      <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                    </div>
                  </div>
                  <Badge variant={ROLE_TONE[u.role]}>{u.role.replace('_', ' ')}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
