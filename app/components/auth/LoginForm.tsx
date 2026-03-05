'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth/auth.context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email:    z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#2D3B45] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-6">
          <span className="text-white font-black text-xl tracking-tight">
            link<span className="text-[#F5C842]">mall</span>
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-xs text-gray-400 mb-5">Sign in to your account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  disabled={isLoading}
                  className={`w-full pl-8 pr-3 py-2 text-xs rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F5C842] focus:border-transparent transition ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-[10px] mt-0.5">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-gray-600">Password</label>
                <Link href="/auth/forgot-password" className="text-[10px] text-[#F5C842] font-semibold hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  disabled={isLoading}
                  className={`w-full pl-8 pr-8 py-2 text-xs rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F5C842] focus:border-transparent transition ${errors.password ? 'border-red-400' : 'border-gray-200'}`}
                />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-2.5 top-2.5 text-gray-300 hover:text-gray-500">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-[10px] mt-0.5">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 rounded-lg bg-[#2D3B45] hover:bg-[#3a4d5a] text-white text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
            >
              {isLoading ? (
                <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-2 my-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[10px] text-gray-300 font-medium">New to LinkMall?</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link href="/auth/register"
              className="py-1.5 text-center text-[11px] font-semibold border border-gray-200 rounded-lg text-gray-600 hover:border-[#F5C842] hover:text-[#2D3B45] transition">
              Customer
            </Link>
            <Link href="/auth/register-vendor"
              className="py-1.5 text-center text-[11px] font-semibold border border-gray-200 rounded-lg text-gray-600 hover:border-[#F5C842] hover:text-[#2D3B45] transition">
              Vendor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}