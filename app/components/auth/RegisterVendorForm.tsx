'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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

const API = process.env.NEXT_PUBLIC_API_URL ?? '/api';

type Step = 'idle' | 'creating' | 'setting-up' | 'done';

const LABELS: Record<Step, string> = {
  'idle':       'Create Vendor Account',
  'creating':   'Creating your account…',
  'setting-up': 'Setting up your store…',
  'done':       'Redirecting…',
};

const HINTS: Record<Step, string> = {
  'idle':       '',
  'creating':   'May take up to 30s on first load while server wakes up',
  'setting-up': 'Almost there — sending your verification code',
  'done':       'Taking you to email verification',
};

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
   placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F5C842]
   focus:border-transparent transition ${err ? 'border-red-400' : 'border-gray-200'}`;

async function fetchWithTimeout(url: string, options: RequestInit, ms = 40000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Server is starting up. Please wait 30 seconds and try again.');
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
}


export function RegisterVendorForm() {
  const router = useRouter();
  const [step,        setStep]        = useState<Step>('idle');
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { setAuth } = useAuth();

  const loading = step !== 'idle' && step !== 'done';

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setStep('creating');
    try {

      // ── Step 1: Register with intent=vendor ───────────────────────────
      const regRes = await fetchWithTimeout(`${API}/auth/register`, {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.fullName,
          email:    data.email,
          password: data.password,
          phone:    data.phone,
        }),
      });
      const regJson = await regRes.json();
      if (!regRes.ok) throw new Error(regJson.error || 'Registration failed');

      const accessToken = regJson.data?.accessToken;
      if (!accessToken) throw new Error('No token received');

      // ── Step 2: Create vendor record + send OTP ───────────────────────
      setStep('setting-up');

      const vendorRes = await fetchWithTimeout(`${API}/vendors/apply`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ businessName: data.fullName }),
      }, 15000);
      const vendorJson = await vendorRes.json();

      if (!vendorRes.ok) {
        // Vendor record failed but account exists — redirect anyway
        // OTP can be resent from verify-email page
        console.warn('[RegisterVendor] vendor apply failed:', vendorJson.error);
      }
      
      const VendorAcessToken = vendorJson.data?.accessToken ?? accessToken; // fallback to user token if vendor token not returned
      // ── Step 3: Set cookies as VENDOR + redirect ──────────────────────
      setStep('done');
      setAuth(VendorAcessToken);

      toast.success('Account created! Check your email for a verification code.');
      router.push('/vendor/verify-email');

    } catch (err) {
      setStep('idle');
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#2D3B45] flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-sm">

        <div className="flex justify-center mb-6">
          <Image src="/images/logo.png" alt="LinkMart" width={120} height={28}
            className="h-7 w-auto" priority />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-black text-gray-900 mb-0.5">Become a vendor</h2>
          <p className="text-xs text-gray-400 mb-5">Create your account — set up your store next</p>

          {loading && (
            <div className="mb-4 bg-amber-50 border border-amber-100 rounded-xl
              px-4 py-3 flex items-start gap-3">
              <div className="mt-0.5 shrink-0"><Spinner /></div>
              <div>
                <p className="text-xs font-bold text-amber-800">{LABELS[step]}</p>
                <p className="text-[10px] text-amber-600 mt-0.5">{HINTS[step]}</p>
              </div>
            </div>
          )}

          <button type="button" disabled={loading}
            onClick={() => { window.location.href = `${API}/auth/google?intent=vendor`; }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border
              border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700
              transition active:scale-[0.98] mb-4 disabled:opacity-50 disabled:cursor-not-allowed">
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
              <input type="email" placeholder="you@business.com"
                {...register('email')} disabled={loading}
                className={inp(!!errors.email)} />
            </Field>

            <Field label="Phone" error={errors.phone?.message}>
              <Phone className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
              <input type="tel" placeholder="+254 712 345 678"
                {...register('phone')} disabled={loading}
                className={inp(!!errors.phone)} />
            </Field>

            <PasswordField label="Password" name="password" register={register}
              error={errors.password?.message} hint="8+ chars · uppercase · number"
              show={showPass} toggle={() => setShowPass(v => !v)}
              disabled={loading} inp={inp} />

            <PasswordField label="Confirm Password" name="confirmPassword" register={register}
              error={errors.confirmPassword?.message}
              show={showConfirm} toggle={() => setShowConfirm(v => !v)}
              disabled={loading} inp={inp} />

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#2D3B45] hover:bg-[#3a4d5a] text-white
                text-xs font-bold transition disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 mt-1">
              {loading
                ? <><Spinner /><span>{LABELS[step]}</span></>
                : 'Create Vendor Account'}
            </button>
          </form>

          <p className="text-center text-[11px] text-gray-400 mt-4">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#2D3B45] font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {step === 'creating' && (
          <p className="text-center text-[11px] text-white/40 mt-3 px-4">
            First visit of the day may take up to 30s while the server wakes up
          </p>
        )}
      </div>
    </div>
  );
}