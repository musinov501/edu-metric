import { Suspense } from 'react';
import { LoginForm } from '@/components/forms/login-form';

export const metadata = { title: 'Sign in · EduMetric' };

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
