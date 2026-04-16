'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, Lock, Building2, Eye, EyeOff, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL ?? '/api';

const schema = z.object({
  email:        z.string().min(1, 'Required').email('Invalid email'),
  phone:        z.string().regex(/^(\+254|0)[17]\d{8}$/, 'Enter a valid Kenyan number'),
  businessName: z.string().min(3, 'At least 3 characters'),
  description:  z.string().min(20, 'At least 20 characters').max(500),
  password:     z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[0-9]/, 'Must include a number'),
  confirmPassword: z.string().min(1, 'Required'),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match', path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const inp = (err: boolean) =>
  `w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border bg-gray-50 text-gray-900 placeholder-gray-300
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
      // Step 1 — create account
      const regRes = await fetch(`${API}/auth/register`, {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.businessName, // use business name as display name
          email:    data.email,
          password: data.password,
          phone:    data.phone,
        }),
      });

      const regJson = await regRes.json();
      if (!regRes.ok) throw new Error(regJson.error || regJson.message || 'Registration failed');

      const accessToken = regJson.data?.accessToken;
      if (!accessToken) throw new Error('No token received');

      // Step 2 — apply as vendor
      const vendorRes = await fetch(`${API}/vendors/apply`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          businessName: data.businessName,
          description:  data.description,
          phoneNumber:  data.phone,
        }),
      });

      const vendorJson = await vendorRes.json();
      if (!vendorRes.ok) throw new Error(vendorJson.error || vendorJson.message || 'Application failed');

      toast.success('Application submitted! We\'ll be in touch shortly.');
      router.push('/auth/login?message=application-submitted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2D3B45] flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/images/logo.png"
            alt="LinkMart Logo"
            width={120}
            height={28}
            className="h-7 w-auto"
            priority
          />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-black text-gray-900 mb-0.5">Become a vendor</h2>
          <p className="text-xs text-gray-400 mb-5">Create your account and start listing</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                <input type="email" placeholder="you@business.com"
                  {...register('email')} disabled={loading}
                  className={inp(!!errors.email)} />
              </div>
              {errors.email && <p className="text-red-500 text-[10px] mt-0.5">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                <input type="tel" placeholder="+254 712 345 678"
                  {...register('phone')} disabled={loading}
                  className={inp(!!errors.phone)} />
              </div>
              {errors.phone && <p className="text-red-500 text-[10px] mt-0.5">{errors.phone.message}</p>}
            </div>

            {/* Business Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Business Name</label>
              <div className="relative">
                <Building2 className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                <input type="text" placeholder="Your Business Name"
                  {...register('businessName')} disabled={loading}
                  className={inp(!!errors.businessName)} />
              </div>
              {errors.businessName && <p className="text-red-500 text-[10px] mt-0.5">{errors.businessName.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
              <div className="relative">
                <FileText className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                <textarea
                  placeholder="Briefly describe your business and services..."
                  {...register('description')} disabled={loading} rows={3}
                  className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border bg-gray-50 text-gray-900
                    placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F5C842]
                    focus:border-transparent transition resize-none
                    ${errors.description ? 'border-red-400' : 'border-gray-200'}`} />
              </div>
              {errors.description
                ? <p className="text-red-500 text-[10px] mt-0.5">{errors.description.message}</p>
                : <p className="text-[10px] text-gray-300 mt-0.5">20–500 characters</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                <input type={showPass ? 'text' : 'password'} placeholder="••••••••"
                  {...register('password')} disabled={loading}
                  className={`${inp(!!errors.password)} pr-9`} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-2.5 top-2.5 text-gray-300 hover:text-gray-500 transition">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password
                ? <p className="text-red-500 text-[10px] mt-0.5">{errors.password.message}</p>
                : <p className="text-[10px] text-gray-300 mt-0.5">8+ chars · uppercase · number</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                <input type={showConfirm ? 'text' : 'password'} placeholder="••••••••"
                  {...register('confirmPassword')} disabled={loading}
                  className={`${inp(!!errors.confirmPassword)} pr-9`} />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-2.5 top-2.5 text-gray-300 hover:text-gray-500 transition">
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-[10px] mt-0.5">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#2D3B45] hover:bg-[#3a4d5a] text-white
                text-xs font-bold transition active:scale-[0.98] disabled:opacity-50
                flex items-center justify-center gap-2 mt-1">
              {loading
                ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                : 'Submit Application'}
            </button>
          </form>

          <p className="text-center text-[11px] text-gray-400 mt-4">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#2D3B45] font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}