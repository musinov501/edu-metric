'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { IssuePenaltyForm } from '@/components/forms/issue-penalty-form';

export default function TutorDisciplinePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Discipline</h1>
        <p className="text-sm text-muted-foreground">
          Discipline starts at 10 and drops as violations are recorded. Penalties auto-recompute KPI.
        </p>
      </header>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">Record violation</CardTitle>
          <CardDescription>
            Use this for dormitory, social, or ethical issues. Use the mentor "Feedback" panel for class-related issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IssuePenaltyForm />
        </CardContent>
      </Card>
    </div>
  );
}
