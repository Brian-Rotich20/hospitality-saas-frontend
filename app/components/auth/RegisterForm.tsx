'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth/auth.context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  fullName: z.string().min(2, 'At least 2 characters'),
  email:    z.string().min(1, 'Email is required').email('Invalid email'),
  phone:    z.string().regex(/^(\+254|0)[17]\d{8}$/, 'Enter a valid Kenyan number'),
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[0-9]/, 'Must include a number'),
  confirmPassword: z.string().min(1, 'Required'),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match', path: ['confirmPassword'],
});
type RegisterFormData = z.infer<typeof registerSchema>;

// Shared input class builder
const inp = (err: boolean) =>
  `w-full pl-8 pr-3 py-2 text-xs rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F5C842] focus:border-transparent transition ${err ? 'border-red-400' : 'border-gray-200'}`;

export function RegisterForm() {
  const { register: registerUser, isLoading } = useAuth();
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({ email: data.email, password: data.password, phone: data.phone, role: 'customer' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#2D3B45] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-6">
          <span className="text-white font-black text-xl tracking-tight">
            link<span className="text-[#F5C842]">mall</span>
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-bold text-gray-900 mb-1">Create account</h2>
          <p className="text-xs text-gray-400 mb-5">Join as a customer — it's free</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                <input type="text" placeholder="John Doe" {...register('fullName')} disabled={isLoading}
                  className={inp(!!errors.fullName)} />
              </div>
              {errors.fullName && <p className="text-red-500 text-[10px] mt-0.5">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                <input type="email" placeholder="you@example.com" {...register('email')} disabled={isLoading}
                  className={inp(!!errors.email)} />
              </div>
              {errors.email && <p className="text-red-500 text-[10px] mt-0.5">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                <input type="tel" placeholder="+254 712 345 678" {...register('phone')} disabled={isLoading}
                  className={inp(!!errors.phone)} />
              </div>
              {errors.phone && <p className="text-red-500 text-[10px] mt-0.5">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                <input type={showPass ? 'text' : 'password'} placeholder="••••••••" {...register('password')} disabled={isLoading}
                  className={`${inp(!!errors.password)} pr-8`} />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-2.5 top-2.5 text-gray-300 hover:text-gray-500">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password
                ? <p className="text-red-500 text-[10px] mt-0.5">{errors.password.message}</p>
                : <p className="text-[10px] text-gray-300 mt-0.5">8+ chars · uppercase · number</p>
              }
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                <input type={showConfirm ? 'text' : 'password'} placeholder="••••••••" {...register('confirmPassword')} disabled={isLoading}
                  className={`${inp(!!errors.confirmPassword)} pr-8`} />
                <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-2.5 top-2.5 text-gray-300 hover:text-gray-500">
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-0.5">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full py-2 rounded-lg bg-[#2D3B45] hover:bg-[#3a4d5a] text-white text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1">
              {isLoading
                ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account...</>
                : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-[11px] text-gray-400 mt-4">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#2D3B45] font-bold hover:underline">Sign in</Link>
          </p>
          <p className="text-center text-[11px] text-gray-400 mt-1">
            Want to sell?{' '}
            <Link href="/auth/register-vendor" className="text-[#F5C842] font-bold hover:underline">Become a vendor →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}