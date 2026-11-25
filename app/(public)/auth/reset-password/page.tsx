import { Suspense } from 'react';
import { ResetPasswordForm } from '../../../components/auth/ResetPasswordForm';

export const metadata = { title: 'Choose a new password | LinkMart' };

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
