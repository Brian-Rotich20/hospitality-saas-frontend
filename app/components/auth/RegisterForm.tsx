'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth/auth.context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { ErrorAlert } from '../../components/common/ErrorAlert';

// Validation schema
const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Name must be at least 2 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email address'),
    phoneNumber: z
      .string()
      .min(9, 'Phone number must be at least 9 digits'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z
      .string()
      .min(8, 'Password confirmation is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { register: registerUser, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      await registerUser({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        userType: 'customer',
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Heading */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-600 mt-2">Join as a customer</p>
      </div>

      {/* Error Alert */}
      {error && <ErrorAlert error={error} onDismiss={() => setError(null)} />}

      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input
            id="fullName"
            type="text"
            placeholder="John Doe"
            {...register('fullName')}
            className={`
              w-full pl-10 pr-4 py-2.5 rounded-lg border
              focus:outline-none focus:ring-2 focus:ring-primary-500
              ${
                errors.fullName
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300'
              }
            `}
            disabled={isLoading}
          />
        </div>
        {errors.fullName && (
          <p className="text-red-600 text-sm mt-1">{errors.fullName.message}</p>
        )}
      </div>

      {/* Email */}
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

      {/* Phone Number */}
      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input
            id="phoneNumber"
            type="tel"
            placeholder="+254 700 000 000"
            {...register('phoneNumber')}
            className={`
              w-full pl-10 pr-4 py-2.5 rounded-lg border
              focus:outline-none focus:ring-2 focus:ring-primary-500
              ${
                errors.phoneNumber
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300'
              }
            `}
            disabled={isLoading}
          />
        </div>
        {errors.phoneNumber && (
          <p className="text-red-600 text-sm mt-1">{errors.phoneNumber.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('password')}
            className={`
              w-full pl-10 pr-10 py-2.5 rounded-lg border
              focus:outline-none focus:ring-2 focus:ring-primary-500
              ${
                errors.password
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300'
              }
            `}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
        )}
        <p className="text-xs text-gray-500 mt-2">
          At least 8 characters, 1 uppercase letter, 1 number
        </p>
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('confirmPassword')}
            className={`
              w-full pl-10 pr-10 py-2.5 rounded-lg border
              focus:outline-none focus:ring-2 focus:ring-primary-500
              ${
                errors.confirmPassword
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300'
              }
            `}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Terms */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="terms"
          defaultChecked
          className="w-4 h-4 rounded border-gray-300 text-primary-600"
          disabled={isLoading}
        />
        <label htmlFor="terms" className="text-sm text-gray-700">
          I agree to the{' '}
          <a href="#" className="text-primary-600 hover:underline">
            Terms of Service
          </a>
        </label>
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
            <span>Creating account...</span>
          </>
        ) : (
          <span>Create Account</span>
        )}
      </button>

      {/* Sign In Link */}
      <p className="text-center text-gray-600 text-sm">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-primary-600 hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </form>
  );
}