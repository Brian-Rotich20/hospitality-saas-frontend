'use client';

import { AuthShell } from './AuthShell';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import Field         from '../ui/Field';
import PasswordField from '../ui/PasswordField';
import GoogleIcon    from '../ui/GoogleIcon';
import Divider       from '../ui/Divider';
import Spinner       from '../ui/Spinner';
import { useAuth } from '../../lib/auth/auth.context';
import { authClient } from '../../lib/auth/authClient';

const schema = z.object({
  fullName: z.string().min(2, 'At least 2 characters'),
  email:    z.string().min(1, 'Required').email('Invalid email'),
  phone:    z.string().regex(/^(\+254|0)[17]\d{8}$/, 'Enter a valid Kenyan number'),
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Needs uppercase')
    .regex(/[0-9]/, 'Needs a number'),
  confirmPassword: z.string().min(1, 'Required'),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match', path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const inp = (err: boolean) =>
  `w-full pl-8 pr-3 py-2 text-xs rounded-lg border bg-gray-50 text-gray-900
   placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-bg
   focus:border-transparent transition ${err ? 'border-red-400' : 'border-gray-200'}`;

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const [loading,     setLoading]     = useState(false);
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await registerUser({
        fullName: data.fullName,
        email:    data.email,
        password: data.password,
        phone:    data.phone,
      });
      // registerUser() already toasts + redirects to verify-email
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="w-full">

        <div className="auth-card">
          <h1 className="text-[22px] leading-tight font-bold tracking-[-0.01em] text-gray-900 mb-0.5">Create account</h1>
          <p className="text-xs text-gray-400 mb-5">Join as a customer — it&apos;s free</p>

          <button
            type="button"
            onClick={() => authClient.signIn.social({ provider: 'google', callbackURL: '/store' })}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border
              border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700
              transition active:scale-[0.98] mb-4"
          >
            <GoogleIcon /> Continue with Google
          </button>

          <Divider label="or sign up with email" />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-4">
            <Field label="Full Name" error={errors.fullName?.message}>
              <User className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
              <input type="text" placeholder="John Doe"
                {...register('fullName')} disabled={loading}
                className={inp(!!errors.fullName)} />
            </Field>

            <Field label="Email" error={errors.email?.message}>
              <Mail className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
              <input type="email" placeholder="you@example.com"
                {...register('email')} disabled={loading}
                className={inp(!!errors.email)} />
            </Field>

            <Field label="Phone" error={errors.phone?.message}>
              <Phone className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
              <input type="tel" placeholder="+254 712 345 678"
                {...register('phone')} disabled={loading}
                className={inp(!!errors.phone)} />
            </Field>

            <PasswordField
              label="Password" name="password" register={register}
              error={errors.password?.message} hint="8+ chars · uppercase · number"
              show={showPass} toggle={() => setShowPass(v => !v)}
              disabled={loading} inp={inp}
            />

            <PasswordField
              label="Confirm Password" name="confirmPassword" register={register}
              error={errors.confirmPassword?.message}
              show={showConfirm} toggle={() => setShowConfirm(v => !v)}
              disabled={loading} inp={inp}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-ink hover:bg-ink-hover text-white
                text-xs font-bold transition disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 mt-1"
            >
              {loading ? <><Spinner /><span>Creating account…</span></> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-[11px] text-gray-400 mt-4">
            Already have an account?{' '}
            <Link href="/auth/login"
              className="text-ink font-bold hover:underline">Sign in</Link>
          </p>
          <p className="text-center text-[11px] text-gray-400 mt-1">
            Want to sell?{' '}
            <Link href="/auth/register-vendor"
              className="text-accent-bg font-bold hover:underline">Become a vendor →</Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}