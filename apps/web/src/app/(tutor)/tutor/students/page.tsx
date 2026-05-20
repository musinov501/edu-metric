import { StudentsTable } from '@/components/tables/students-table';

export const metadata = { title: 'My Students · EduMetric' };

export default function TutorStudentsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">My students</h1>
        <p className="text-sm text-muted-foreground">
          Students you supervise socially — filtered to your assigned groups by the backend.
        </p>
      </header>
      <StudentsTable profileBase="/tutor/students" />
    </div>
  );
}
