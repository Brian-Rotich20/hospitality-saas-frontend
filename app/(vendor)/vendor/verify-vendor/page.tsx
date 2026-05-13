'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth }   from '../../../lib/auth/auth.context';
import { vendorsService } from '../../../lib/api/endpoints';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Mail, RefreshCw, CheckCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function VendorVerifyEmailPage() {
  const router          = useRouter();
  const { user, refreshToken } = useAuth();
  const [otp,        setOtp]       = useState(['', '', '', '', '', '']);
  const [verifying,  setVerifying] = useState(false);
  const [resending,  setResending] = useState(false);
  const [verified,   setVerified]  = useState(false);
  const [cooldown,   setCooldown]  = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleInput = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const next  = [...otp];
    next[index] = digit;
    setOtp(next);

    // Auto-advance
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 filled
    if (digit && index === 5 && next.every(d => d !== '')) {
      handleVerify(next.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      handleVerify(pasted);
    }
  };

  const handleVerify = async (code?: string) => {
    const otpCode = code ?? otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Enter all 6 digits');
      return;
    }

    setVerifying(true);
    try {
      await (vendorsService as any).verifyEmail(otpCode);
      setVerified(true);
      toast.success('Email verified! Redirecting to your dashboard…');

      // Refresh the auth token so user role updates to 'vendor'
      await refreshToken();

      setTimeout(() => router.push('/vendor/dashboard'), 1500);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid code');
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    try {
      await (vendorsService as any).resendOTP();
      toast.success('New code sent to your email');
      setCooldown(60);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend');
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-emerald-500" />
          </div>
          <h2 className="text-lg font-black text-gray-900 mb-1">Verified!</h2>
          <p className="text-sm text-gray-500 mb-4">Your vendor account is now active.</p>
          <LoadingSpinner size="sm" text="Redirecting to dashboard…" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Back link */}
        <Link href="/store"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400
            hover:text-gray-700 no-underline transition-colors mb-6">
          <ArrowLeft size={13} />
          Back to store
        </Link>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

          {/* Header */}
          <div className="bg-[#2D3B45] px-6 py-5">
            <p className="text-[#F5C842] text-lg font-black">LinkMart</p>
            <p className="text-white/60 text-xs mt-0.5">Vendor verification</p>
          </div>

          <div className="p-6">
            {/* Icon */}
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <Mail size={20} className="text-blue-500" />
            </div>

            <h1 className="text-xl font-black text-gray-900 mb-1">Check your email</h1>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              We sent a 6-digit code to{' '}
              <strong className="text-gray-700">{user?.email}</strong>.
              Enter it below to activate your vendor account.
            </p>

            {/* OTP inputs */}
            <div className="flex gap-2 justify-between mb-6" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleInput(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className={`w-12 h-14 text-center text-xl font-black rounded-xl border
                    focus:outline-none focus:ring-2 focus:ring-[#2D3B45] focus:border-transparent
                    transition-all
                    ${digit
                      ? 'border-[#2D3B45] bg-[#2D3B45]/5 text-[#2D3B45]'
                      : 'border-gray-200 bg-white text-gray-900'}`}
                />
              ))}
            </div>

            {/* Verify button */}
            <button
              onClick={() => handleVerify()}
              disabled={verifying || otp.some(d => d === '')}
              className="w-full py-3 bg-[#2D3B45] text-white text-sm font-black rounded-xl
                hover:bg-[#3a4d5a] transition disabled:opacity-40 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 mb-4"
            >
              {verifying ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent
                  rounded-full animate-spin" /> Verifying…</>
              ) : 'Verify & Activate Account'}
            </button>

            {/* Resend */}
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-2">Didn't receive a code?</p>
              <button
                onClick={handleResend}
                disabled={resending || cooldown > 0}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D3B45]
                  hover:underline disabled:opacity-50 disabled:no-underline transition-opacity"
              >
                <RefreshCw size={11} className={resending ? 'animate-spin' : ''} />
                {cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : resending ? 'Sending…' : 'Resend code'}
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-4">
          Code expires in 15 minutes
        </p>
      </div>
    </div>
  );
}