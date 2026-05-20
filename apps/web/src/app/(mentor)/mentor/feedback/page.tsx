'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { IssuePenaltyForm } from '@/components/forms/issue-penalty-form';

export default function MentorFeedbackPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Feedback &amp; warnings</h1>
        <p className="text-sm text-muted-foreground">
          Issue penalties for class-related incidents. Tutors handle dormitory and social issues separately.
        </p>
      </header>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">Issue penalty</CardTitle>
          <CardDescription>Auto-recalculates the student's KPI and writes an activity log entry.</CardDescription>
        </CardHeader>
        <CardContent>
          <IssuePenaltyForm />
        </CardContent>
      </Card>
    </div>
  );
}
