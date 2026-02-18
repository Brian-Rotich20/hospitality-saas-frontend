'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth/auth.context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Lock, Building2, Eye, EyeOff, MapPin } from 'lucide-react';
import { ErrorAlert } from '../../components/common/ErrorAlert';

// Validation schema
const registerVendorSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Name must be at least 2 characters'),
    businessName: z
      .string()
      .min(3, 'Business name must be at least 3 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email address'),
    phoneNumber: z
      .string()
      .min(9, 'Phone number must be at least 9 digits'),
    businessType: z
      .string()
      .min(1, 'Business type is required'),
    location: z
      .string()
      .min(3, 'Location is required'),
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

type RegisterVendorFormData = z.infer<typeof registerVendorSchema>;

export function RegisterVendorForm() {
  const { register: registerUser, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterVendorFormData>({
    resolver: zodResolver(registerVendorSchema),
  });

  const onSubmit = async (data: RegisterVendorFormData) => {
    try {
      setError(null);
      await registerUser({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        userType: 'vendor',
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
        <h2 className="text-2xl font-bold text-gray-900">Become a Vendor</h2>
        <p className="text-gray-600 mt-2">Join our marketplace and grow your business</p>
      </div>

      {/* Error Alert */}
      {error && <ErrorAlert error={error} onDismiss={() => setError(null)} />}

      {/* Personal Information Section */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 text-sm">Personal Information</h3>

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
              placeholder="vendor@business.com"
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
      </div>

      {/* Business Information Section */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 text-sm">Business Information</h3>

        {/* Business Name */}
        <div>
          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
            Business Name
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input
              id="businessName"
              type="text"
              placeholder="Your Business Name"
              {...register('businessName')}
              className={`
                w-full pl-10 pr-4 py-2.5 rounded-lg border
                focus:outline-none focus:ring-2 focus:ring-primary-500
                ${
                  errors.businessName
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }
              `}
              disabled={isLoading}
            />
          </div>
          {errors.businessName && (
            <p className="text-red-600 text-sm mt-1">{errors.businessName.message}</p>
          )}
        </div>

        {/* Business Type */}
        <div>
          <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
            Business Type
          </label>
          <select
            id="businessType"
            {...register('businessType')}
            className={`
              w-full px-4 py-2.5 rounded-lg border
              focus:outline-none focus:ring-2 focus:ring-primary-500
              ${
                errors.businessType
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300'
              }
            `}
            disabled={isLoading}
          >
            <option value="">Select Business Type</option>
            <option value="venue">Event Venue</option>
            <option value="catering">Catering Service</option>
            <option value="accommodation">Accommodation</option>
            <option value="other">Other</option>
          </select>
          {errors.businessType && (
            <p className="text-red-600 text-sm mt-1">{errors.businessType.message}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Business Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input
              id="location"
              type="text"
              placeholder="City, Area"
              {...register('location')}
              className={`
                w-full pl-10 pr-4 py-2.5 rounded-lg border
                focus:outline-none focus:ring-2 focus:ring-primary-500
                ${
                  errors.location
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }
              `}
              disabled={isLoading}
            />
          </div>
          {errors.location && (
            <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>
          )}
        </div>
      </div>

      {/* Security Section */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 text-sm">Password</h3>

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
          <span>Create Vendor Account</span>
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