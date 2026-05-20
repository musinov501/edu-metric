import { StudentsTable } from '@/components/tables/students-table';

export const metadata = { title: 'My Students · EduMetric' };

export default function MentorStudentsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">My students</h1>
        <p className="text-sm text-muted-foreground">
          The backend filters this list to your assigned groups automatically.
        </p>
      </header>
      <StudentsTable profileBase="/mentor/students" />
    </div>
  );
}
