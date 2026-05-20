'use client';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateMentorTutorDialog } from '@/components/forms/create-mentor-form';
import { useMentors } from '@/lib/hooks/use-admin-mutations';

export default function AdminMentorsPage() {
  const { data: mentors } = useMentors();

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mentors</h1>
          <p className="text-sm text-muted-foreground">
            Academic supervisors. Assign mentors to groups so they see those students automatically.
          </p>
        </div>
        <CreateMentorTutorDialog kind="mentor" />
      </header>

      {!mentors ? (
        <Skeleton className="h-64" />
      ) : mentors.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
          No mentors yet. Click "New mentor" to add one.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {mentors.map((m) => (
            <Card key={m.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-3">
                  <Avatar fallback={m.user.fullName} src={m.user.avatar ?? undefined} />
                  <div className="min-w-0">
                    <div className="font-medium">{m.user.fullName}</div>
                    <div className="truncate text-xs text-muted-foreground">{m.user.email}</div>
                  </div>
                </div>
                {m.specialization && (
                  <div className="text-xs">
                    <span className="text-muted-foreground">Specialization:</span>{' '}
                    <span className="font-medium">{m.specialization}</span>
                  </div>
                )}
                {m.assignedGroups.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {m.assignedGroups.map((g) => (
                      <Badge key={g} variant="muted">
                        {g}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
