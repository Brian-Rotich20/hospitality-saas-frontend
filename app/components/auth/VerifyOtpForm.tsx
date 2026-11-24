'use client';

// Email verification with the 6-digit code emailed at sign-up. After verifying, users who
// signed up as vendors become vendors (the backend requires a verified email for that).
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { MailCheck } from 'lucide-react';
import Spinner from '../ui/Spinner';
import { useAuth, getSafeRedirect } from '../../lib/auth/auth.context';
import { otpService, vendorsService } from '../../lib/api/endpoints';
import type { ApiError } from '../../lib/api/client';

const ROLE_HOME = { customer: '/store', vendor: '/vendor/dashboard', admin: '/admin/dashboard' } as const;
const RESEND_COOLDOWN_SECONDS = 60;

const asApiError = (err: unknown): ApiError =>
  (err && typeof err === 'object' && 'message' in err ? err : { message: 'Something went wrong' }) as ApiError;

export default function VerifyOtpForm() {
  const { user, isLoading, refetchUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const asVendor = searchParams.get('intent') === 'vendor';
  const redirectTo = getSafeRedirect(searchParams.get('redirect'));

  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Verified users continue; signed-out users sign in first.
  useEffect(() => {
    if (isLoading || finishing) return;
    if (!user) {
      const back = `/auth/verify-email${searchParams.toString() ? `?${searchParams}` : ''}`;
      router.replace(`/auth/login?redirect=${encodeURIComponent(back)}`);
    } else if (user.emailVerified) {
      void finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when the session settles
  }, [isLoading, user?.userId, user?.emailVerified]);

  async function finish() {
    setFinishing(true);
    try {
      if (asVendor && user?.role !== 'vendor') {
        await vendorsService.become();
        await refetchUser();
        router.replace('/vendor/onboarding?intent=vendor');
        return;
      }
      router.replace(redirectTo ?? ROLE_HOME[user?.role ?? 'customer']);
    } catch (err) {
      setFinishing(false);
      toast.error(asApiError(err).message);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) { setError('Enter the 6-digit code from your email'); return; }
    setSubmitting(true);
    setError(null);
    try {
      await otpService.verify(code);
      toast.success('Email verified');
      await refetchUser(); // the effect above continues once the session shows verified
    } catch (err) {
      const e2 = asApiError(err);
      if (e2.code === 'ALREADY_VERIFIED') { await refetchUser(); return; }
      setError(e2.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function onResend() {
    setError(null);
    try {
      await otpService.resend();
      toast.success('A new code is on its way');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      const e2 = asApiError(err);
      if (e2.code === 'ALREADY_VERIFIED') { await refetchUser(); return; }
      if (e2.code === 'OTP_RESEND_TOO_SOON') setCooldown(RESEND_COOLDOWN_SECONDS);
      setError(e2.message);
    }
  }

  const busy = submitting || finishing;

  return (
    <div className="min-h-screen bg-[#2D3B45] flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Image src="/images/logo.png" alt="LinkMart" width={120} height={28} className="h-7 w-auto" priority />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mb-3">
            <MailCheck size={18} className="text-amber-600" />
          </div>
          <h2 className="text-base font-black text-gray-900 mb-0.5">Verify your email</h2>
          <p className="text-xs text-gray-400 mb-5">
            We sent a 6-digit code to <span className="font-semibold text-gray-600">{user?.email ?? 'your email'}</span>.
            It expires in 15 minutes.
          </p>

          {finishing ? (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              {asVendor ? 'Setting up your vendor account…' : 'Continuing…'}
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3" noValidate>
              <div>
                <label htmlFor="otp" className="block text-xs font-semibold mb-1 text-gray-700">Verification code</label>
                <input
                  id="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={busy}
                  aria-invalid={!!error}
                  aria-describedby={error ? 'otp-error' : undefined}
                  placeholder="123456"
                  className={`w-full px-3 py-2 text-lg tracking-[0.4em] text-center rounded-lg border bg-gray-50 text-gray-900
                    placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F5C842] focus:border-transparent transition
                    ${error ? 'border-red-400' : 'border-gray-200'}`}
                />
                {error && <p id="otp-error" role="alert" className="text-red-500 text-[10px] mt-1">{error}</p>}
              </div>

              <button type="submit" disabled={busy || code.length !== 6}
                className="w-full py-2 rounded-lg bg-[#2D3B45] hover:bg-[#3a4d5a] text-white text-xs font-bold transition
                  disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {submitting ? <><Spinner /> Verifying…</> : 'Verify email'}
              </button>

              <button type="button" onClick={onResend} disabled={busy || cooldown > 0}
                className="w-full py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600
                  hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
