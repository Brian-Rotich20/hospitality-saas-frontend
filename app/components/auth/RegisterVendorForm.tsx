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
import Field from "../../components/ui/Field"
import PasswordField from "../../components/ui/PasswordField"
import GoogleIcon from "../../components/ui/GoogleIcon"
import Divider from "../../components/ui/Divider"
import Spinner from "../../components/ui/Spinner"

const API = process.env.NEXT_PUBLIC_API_URL ?? '/api';

const schema = z.object({
  fullName: z.string().min(2, 'At least 2 characters'),
  email:    z.string().min(1, 'Required').email('Invalid email'),
  phone:    z.string().regex(/^(\+254|0)[17]\d{8}$/, 'Enter a valid Kenyan number'),
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[0-9]/, 'Must include a number'),
  confirmPassword: z.string().min(1, 'Required'),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match', path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const inp = (err: boolean) =>
  `w-full pl-8 pr-3 py-2 text-xs rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-300
   focus:outline-none focus:ring-2 focus:ring-[#F5C842] focus:border-transparent transition
   ${err ? 'border-red-400' : 'border-gray-200'}`;

export function RegisterVendorForm() {
  const router = useRouter();
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
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

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || 'Registration failed');

      const token = json.data?.accessToken;
      if (!token) throw new Error('No token received');

      // Store token for onboarding flow
      sessionStorage.setItem('vendorToken', token);
      router.push('/vendor/onboarding');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2D3B45] flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Image src="/images/logo.png" alt="LinkMart" width={120} height={28} className="h-7 w-auto" priority />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-black text-gray-900 mb-0.5">Become a vendor</h2>
          <p className="text-xs text-gray-400 mb-5">Create your account — set up your store next</p>

          {/* Google */}
          <button
            type="button"
            onClick={() => window.location.href = `${API}/auth/google?state=vendor`}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border
              border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700
              transition active:scale-[0.98] mb-4"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <Divider label="or sign up with email" />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-4">
            <Field label="Full Name" error={errors.fullName?.message}>
              <User className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
              <input type="text" placeholder="John Doe" {...register('fullName')} disabled={loading} className={inp(!!errors.fullName)} />
            </Field>

            <Field label="Email" error={errors.email?.message}>
              <Mail className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
              <input type="email" placeholder="you@business.com" {...register('email')} disabled={loading} className={inp(!!errors.email)} />
            </Field>

            <Field label="Phone" error={errors.phone?.message}>
              <Phone className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
              <input type="tel" placeholder="+254 712 345 678" {...register('phone')} disabled={loading} className={inp(!!errors.phone)} />
            </Field>

            <PasswordField label="Password" name="password" register={register} error={errors.password?.message}
              hint="8+ chars · uppercase · number" show={showPass} toggle={() => setShowPass(v => !v)} disabled={loading} inp={inp} />

            <PasswordField label="Confirm Password" name="confirmPassword" register={register}
              error={errors.confirmPassword?.message} show={showConfirm} toggle={() => setShowConfirm(v => !v)} disabled={loading} inp={inp} />

            <button type="submit" disabled={loading}
              className="w-full py-2 rounded-lg bg-[#2D3B45] hover:bg-[#3a4d5a] text-white text-xs font-bold
                transition disabled:opacity-50 flex items-center justify-center gap-2 mt-1">
              {loading ? <Spinner /> : 'Create Vendor Account'}
            </button>
          </form>

          <p className="text-center text-[11px] text-gray-400 mt-4">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#2D3B45] font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}