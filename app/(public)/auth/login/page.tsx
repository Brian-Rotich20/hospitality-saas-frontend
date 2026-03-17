// app/(public)/auth/login/page.tsx
import { Suspense } from 'react';
import { LoginForm } from '../../../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}