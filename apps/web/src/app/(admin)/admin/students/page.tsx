import { CreateStudentDialog } from '@/components/forms/create-student-form';
import { StudentsTable } from '@/components/tables/students-table';

export const metadata = { title: 'Students · EduMetric' };

export default function AdminStudentsPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
          <p className="text-sm text-muted-foreground">
            Search, filter, and create student records. Click any row to view the full profile.
          </p>
        </div>
        <CreateStudentDialog />
      </header>
      <StudentsTable profileBase="/admin/students" />
    </div>
  );
}
