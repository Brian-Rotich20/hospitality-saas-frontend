'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth/auth.context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Lock, Building2, Eye, EyeOff, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const registerVendorSchema = z.object({
  fullName:        z.string().min(2, 'At least 2 characters'),
  businessName:    z.string().min(3, 'At least 3 characters'),
  email:           z.string().min(1, 'Required').email('Invalid email'),
  phone:           z.string().regex(/^(\+254|0)[17]\d{8}$/, 'Enter a valid Kenyan number'),
  businessType:    z.string().min(1, 'Select a type'),
  location:        z.string().min(2, 'Required'),
  password:        z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[0-9]/, 'Must include a number'),
  confirmPassword: z.string().min(1, 'Required'),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match', path: ['confirmPassword'],
});
type RegisterVendorFormData = z.infer<typeof registerVendorSchema>;

const inp = (err: boolean) =>
  `w-full pl-8 pr-3 py-2 text-xs rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F5C842] focus:border-transparent transition ${err ? 'border-red-400' : 'border-gray-200'}`;

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-[10px] mt-0.5">{error}</p>}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-2 pb-1 border-t border-gray-100">
      {children}
    </p>
  );
}

export function RegisterVendorForm() {
  const { register: registerUser, isLoading } = useAuth();
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterVendorFormData>({
    resolver: zodResolver(registerVendorSchema),
  });

  const onSubmit = async (data: RegisterVendorFormData) => {
    try {
      await registerUser({ email: data.email, password: data.password, phone: data.phone, role: 'vendor' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#2D3B45] flex items-start justify-center p-4 py-8">
      <div className="w-full max-w-sm">

        <div className="text-center mb-6">
          <span className="text-white font-black text-xl tracking-tight">
            link<span className="text-[#F5C842]">mall</span>
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-bold text-gray-900 mb-1">Become a vendor</h2>
          <p className="text-xs text-gray-400 mb-4">List your venue or service</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

            <SectionLabel>Account</SectionLabel>

            <Field label="Full Name" error={errors.fullName?.message}>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                <input type="text" placeholder="John Doe" {...register('fullName')} disabled={isLoading}
                  className={inp(!!errors.fullName)} />
              </div>
            </Field>

            <Field label="Email" error={errors.email?.message}>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                <input type="email" placeholder="vendor@business.com" {...register('email')} disabled={isLoading}
                  className={inp(!!errors.email)} />
              </div>
            </Field>

            <Field label="Phone" error={errors.phone?.message}>
              <div className="relative">
                <Phone className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                <input type="tel" placeholder="+254 712 345 678" {...register('phone')} disabled={isLoading}
                  className={inp(!!errors.phone)} />
              </div>
            </Field>

            <SectionLabel>Business</SectionLabel>

            <Field label="Business Name" error={errors.businessName?.message}>
              <div className="relative">
                <Building2 className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                <input type="text" placeholder="Your Business Name" {...register('businessName')} disabled={isLoading}
                  className={inp(!!errors.businessName)} />
              </div>
            </Field>

            <Field label="Business Type" error={errors.businessType?.message}>
              <select {...register('businessType')} disabled={isLoading}
                className={`w-full px-3 py-2 text-xs rounded-lg border bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F5C842] focus:border-transparent transition ${errors.businessType ? 'border-red-400' : 'border-gray-200'}`}>
                <option value="">Select type...</option>
                <option value="event_venue">Event Venue</option>
                <option value="catering">Catering Service</option>
                <option value="accommodation">Accommodation</option>
                <option value="other">Other</option>
              </select>
            </Field>

            <Field label="Location" error={errors.location?.message}>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                <input type="text" placeholder="Nairobi, Westlands" {...register('location')} disabled={isLoading}
                  className={inp(!!errors.location)} />
              </div>
            </Field>

            <SectionLabel>Password</SectionLabel>

            <Field label="Password" error={errors.password?.message}>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                <input type={showPass ? 'text' : 'password'} placeholder="••••••••" {...register('password')} disabled={isLoading}
                  className={`${inp(!!errors.password)} pr-8`} />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-2.5 top-2.5 text-gray-300 hover:text-gray-500">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {!errors.password && <p className="text-[10px] text-gray-300 mt-0.5">8+ chars · uppercase · number</p>}
            </Field>

            <Field label="Confirm Password" error={errors.confirmPassword?.message}>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                <input type={showConfirm ? 'text' : 'password'} placeholder="••••••••" {...register('confirmPassword')} disabled={isLoading}
                  className={`${inp(!!errors.confirmPassword)} pr-8`} />
                <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-2.5 top-2.5 text-gray-300 hover:text-gray-500">
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </Field>

            <button type="submit" disabled={isLoading}
              className="w-full py-2 rounded-lg bg-[#2D3B45] hover:bg-[#3a4d5a] text-white text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1">
              {isLoading
                ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account...</>
                : 'Create Vendor Account'}
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