'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth/auth.context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await login(data.email, data.password);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Heading */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600 mt-2">Sign in to your account</p>
      </div>

      {/* Error Alert */}
      {error && <ErrorAlert error={error} onDismiss={() => setError(null)} />}

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            className={`
              w-full pl-10 pr-4 py-2.5 rounded-lg border
              focus:outline-none focus:ring-2 focus:ring-primary-500
              ${
                errors.email
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300'
              }
            `}
            disabled={isLoading}
          />
        </div>
        {errors.email && (
          <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Forgot?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            className={`
              w-full pl-10 pr-4 py-2.5 rounded-lg border
              focus:outline-none focus:ring-2 focus:ring-primary-500
              ${
                errors.password
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300'
              }
            `}
            disabled={isLoading}
          />
        </div>
        {errors.password && (
          <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`
          w-full py-2.5 px-4 rounded-lg font-semibold text-white
          transition duration-200
          ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800'
          }
          flex items-center justify-center space-x-2
        `}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <span>Sign In</span>
        )}
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">New to VenueHub?</span>
        </div>
      </div>

      {/* Sign Up Links */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/auth/register"
          className="py-2 px-4 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition text-center font-medium"
        >
          Customer
        </Link>
        <Link
          href="/auth/register-vendor"
          className="py-2 px-4 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition text-center font-medium"
        >
          Vendor
        </Link>
      </div>
    </form>
  );
}