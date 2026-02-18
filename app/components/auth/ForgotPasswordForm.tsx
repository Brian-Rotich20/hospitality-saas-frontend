'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { authService } from '../../lib/api/endpoints';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { ErrorAlert } from '../../components/common/ErrorAlert';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to send reset email. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={32} className="text-green-600" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
          <p className="text-gray-600">
            We've sent password reset instructions to{' '}
            <span className="font-semibold text-gray-900">{email}</span>
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <p className="text-sm text-blue-800">
            <strong>Didn't receive the email?</strong>
            <br />
            Check your spam folder or try another email address.
          </p>
        </div>

        <Link
          href="/auth/login"
          className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          <ArrowLeft size={18} />
          <span>Back to login</span>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Heading */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
        <p className="text-gray-600 mt-2">
          Enter your email and we'll send you instructions to reset your password
        </p>
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={`
              w-full pl-10 pr-4 py-2.5 rounded-lg border
              focus:outline-none focus:ring-2 focus:ring-primary-500
              border-gray-300
            `}
            disabled={loading}
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={`
          w-full py-2.5 px-4 rounded-lg font-semibold text-white
          transition duration-200
          ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800'
          }
          flex items-center justify-center space-x-2
        `}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Sending...</span>
          </>
        ) : (
          <span>Send Reset Instructions</span>
        )}
      </button>

      {/* Back to Login */}
      <div className="text-center">
        <Link
          href="/auth/login"
          className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          <ArrowLeft size={18} />
          <span>Back to login</span>
        </Link>
      </div>
    </form>
  );
}