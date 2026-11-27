'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, MailCheck } from 'lucide-react';
import Field from '../ui/Field';
import Spinner from '../ui/Spinner';
import { passwordService } from '../../lib/api/endpoints';
import type { ApiError } from '../../lib/api/client';

const schema = z.object({ email: z.string().min(1, 'Email is required').email('Invalid email address') });
type FormData = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }: FormData) => {
    setError(null);
    try {
      await passwordService.requestReset(email);
      // Same message whether or not the account exists (the backend never says).
      setSent(true);
    } catch (err) {
      const e = err as ApiError;
      setError(e.status === 429 ? 'Too many requests. Please wait a few minutes and try again.' : e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-300 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Image src="/images/logo.png" alt="LinkMart Logo" width={120} height={28} className="h-7 w-auto" priority />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          {sent ? (
            <div role="status">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                <MailCheck size={18} className="text-emerald-600" />
              </div>
              <h1 className="text-[22px] leading-tight font-bold tracking-[-0.01em] text-gray-900 mb-1">Check your email</h1>
              <p className="text-xs text-gray-500 mb-5">
                If an account exists for that address, we&apos;ve sent a link to reset your password.
                The link works once and expires in 60 minutes.
              </p>
              <Link href="/auth/login" className="text-xs font-semibold text-ink hover:underline">Back to sign in</Link>
            </div>
          ) : (
            <>
              <h1 className="text-[22px] leading-tight font-bold tracking-[-0.01em] text-gray-900 mb-1">Forgot your password?</h1>
              <p className="text-xs text-gray-400 mb-5">Enter your email and we&apos;ll send you a reset link.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
                <Field label="Email" error={errors.email?.message}>
                  <Mail className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                  <input type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} disabled={isSubmitting}
                    className={`w-full pl-8 pr-3 py-2 text-xs rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-bg focus:border-transparent transition ${errors.email ? 'border-red-400' : 'border-gray-200'}`} />
                </Field>
                {error && <p role="alert" className="text-red-500 text-[11px]">{error}</p>}
                <button type="submit" disabled={isSubmitting}
                  className="w-full py-2 rounded-lg bg-ink hover:bg-ink-hover text-white text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isSubmitting ? <><Spinner /> Sending…</> : 'Send reset link'}
                </button>
              </form>
              <p className="text-[11px] text-gray-500 mt-4">
                Remembered it? <Link href="/auth/login" className="font-semibold text-ink hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
