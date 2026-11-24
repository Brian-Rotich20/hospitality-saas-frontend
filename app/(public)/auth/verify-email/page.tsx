import { Suspense } from 'react';
import VerifyOtpForm from '../../../components/auth/VerifyOtpForm';

export const metadata = { title: 'Verify your email | LinkMart' };

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpForm />
    </Suspense>
  );
}
