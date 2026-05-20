'use client';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateMentorTutorDialog } from '@/components/forms/create-mentor-form';
import { useTutors } from '@/lib/hooks/use-admin-mutations';

export default function AdminTutorsPage() {
  const { data: tutors } = useTutors();

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tutors</h1>
          <p className="text-sm text-muted-foreground">
            Social, ethical, and discipline supervisors. Each tutor evaluates the soft-skill axes that
            feed the KPI's Tutor Score and Discipline categories.
          </p>
        </div>
        <CreateMentorTutorDialog kind="tutor" />
      </header>

      {!tutors ? (
        <Skeleton className="h-64" />
      ) : tutors.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
          No tutors yet.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tutors.map((t) => (
            <Card key={t.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-3">
                  <Avatar fallback={t.user.fullName} src={t.user.avatar ?? undefined} />
                  <div className="min-w-0">
                    <div className="font-medium">{t.user.fullName}</div>
                    <div className="truncate text-xs text-muted-foreground">{t.user.email}</div>
                  </div>
                </div>
                {t.assignedDormitory && (
                  <div className="text-xs">
                    <span className="text-muted-foreground">Dormitory:</span>{' '}
                    <span className="font-medium">{t.assignedDormitory}</span>
                  </div>
                )}
                {t.assignedGroups.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {t.assignedGroups.map((g) => (
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
