'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import PasswordField from '../ui/PasswordField';
import Spinner from '../ui/Spinner';
import { passwordService } from '../../lib/api/endpoints';
import type { ApiError } from '../../lib/api/client';

// Same password rules as registration.
const schema = z.object({
  password: z.string().min(8, 'At least 8 characters').regex(/[A-Z]/, 'Needs uppercase').regex(/[0-9]/, 'Needs a number'),
  confirmPassword: z.string().min(1, 'Required'),
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });
type FormData = z.infer<typeof schema>;

const inp = (err: boolean) =>
  `w-full pl-8 pr-8 py-2 text-xs rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F5C842] focus:border-transparent transition ${err ? 'border-red-400' : 'border-gray-200'}`;

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get('token');
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [invalidLink, setInvalidLink] = useState(!token);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ password }: FormData) => {
    if (!token) return;
    setError(null);
    try {
      await passwordService.reset(token, password);
      toast.success('Password updated. Please sign in.');
      router.replace('/auth/login');
    } catch (err) {
      const e = err as ApiError;
      if (e.code === 'INVALID_TOKEN') setInvalidLink(true);
      else setError(e.status === 429 ? 'Too many attempts. Please wait a few minutes.' : e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-300 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Image src="/images/logo.png" alt="LinkMart Logo" width={120} height={28} className="h-7 w-auto" priority />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          {invalidLink ? (
            <div role="alert">
              <h2 className="text-base font-bold text-gray-900 mb-1">This link has expired</h2>
              <p className="text-xs text-gray-500 mb-5">
                Reset links work once and expire after 60 minutes. Request a new one to continue.
              </p>
              <Link href="/auth/forgot-password"
                className="inline-block py-2 px-4 rounded-lg bg-[#2D3B45] hover:bg-[#3a4d5a] text-white text-xs font-bold transition">
                Request a new link
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-base font-bold text-gray-900 mb-1">Choose a new password</h2>
              <p className="text-xs text-gray-400 mb-5">You&apos;ll be signed out everywhere and asked to sign in again.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
                <PasswordField label="New password" name="password" register={register} error={errors.password?.message}
                  hint="At least 8 characters, with an uppercase letter and a number" show={show} toggle={() => setShow((v) => !v)} disabled={isSubmitting} inp={inp} />
                <PasswordField label="Confirm new password" name="confirmPassword" register={register} error={errors.confirmPassword?.message}
                  show={showConfirm} toggle={() => setShowConfirm((v) => !v)} disabled={isSubmitting} inp={inp} />
                {error && <p role="alert" className="text-red-500 text-[11px]">{error}</p>}
                <button type="submit" disabled={isSubmitting}
                  className="w-full py-2 rounded-lg bg-[#2D3B45] hover:bg-[#3a4d5a] text-white text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isSubmitting ? <><Spinner /> Saving…</> : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
