'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../lib/auth/auth.context';

const API          = process.env.NEXT_PUBLIC_API_URL ?? '/api';
const OTP_LENGTH   = 6;
const RESEND_WAIT  = 60;

export default function CustomerVerifyEmailPage() {
  const router = useRouter();

  const [otp,       setOtp]       = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading,   setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown,  setCooldown]  = useState(0);
  const [verified,  setVerified]  = useState(false);
  const { token, setAuth } = useAuth();

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  useEffect(() => {
    if (!token) {
      toast.error('Session expired. Please register again.');
      router.replace('/auth/register');
    }
  }, [router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown(c => c <= 1 ? (clearInterval(id), 0) : c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const submitOtp = useCallback(async (digits: string[]) => {
    const code = digits.join('');
    if (code.length < OTP_LENGTH) return;
    if (!token) { toast.error('Session expired.'); router.replace('/auth/register'); return; }

    setLoading(true);
    try {
      const res  = await fetch(`${API}/auth/verify-email`, {
        method:      'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({ otp: code }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Verification failed');

      // Swap token — now has emailVerified=true
      if (json.data?.accessToken) setAuth(json.data.accessToken); // update context with new token
      setVerified(true);
      toast.success('Email verified! Welcome to LinkMart 🎉');
      setTimeout(() => router.push('/store'), 1800);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid code.');
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }, [router, token, setAuth]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
      const filled = Array(OTP_LENGTH).fill('');
      digits.forEach((d, i) => { filled[i] = d; });
      setOtp(filled);
      const focusIndex = Math.min(digits.length, OTP_LENGTH - 1);
      inputRefs.current[focusIndex]?.focus();
      if (digits.length === OTP_LENGTH) submitOtp(filled);
      return;
    }
    const digit = value.replace(/\D/g, '');
    const next  = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    if (next.every(d => d !== ''))       submitOtp(next);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const resendOtp = async () => {
    if (cooldown > 0 || resending) return;
    if (!token) { toast.error('Session expired.'); router.replace('/auth/register'); return; }

    setResending(true);
    try {
      const res  = await fetch(`${API}/auth/resend-otp`, {
        method:      'POST',
        credentials: 'include',
        headers:     { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to resend');
      toast.success('New code sent! Check your inbox.');
      setCooldown(RESEND_WAIT);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not resend code.');
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-[#2D3B45] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-green-600" size={32} />
          </div>
          <h2 className="text-lg font-black text-gray-900 mb-1">Email verified!</h2>
          <p className="text-sm text-gray-400">Taking you to the store…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2D3B45] flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Image src="/images/logo.png" alt="LinkMart" width={120} height={28}
            className="h-7 w-auto" priority />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100
              flex items-center justify-center mb-3">
              <ShieldCheck className="text-[#F5C842]" size={22} />
            </div>
            <h2 className="text-base font-black text-gray-900">Check your email</h2>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              We sent a 6-digit code to verify your account.<br />
              Enter it below to continue.
            </p>
          </div>

          <div className="flex gap-2 justify-center mb-5">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                disabled={loading}
                onChange={e  => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onFocus={e   => e.target.select()}
                className={`
                  w-11 h-12 text-center text-lg font-black rounded-xl border-2
                  bg-gray-50 text-gray-900 transition focus:outline-none
                  focus:ring-2 focus:ring-[#F5C842] focus:border-transparent
                  disabled:opacity-50
                  ${digit ? 'border-[#2D3B45]' : 'border-gray-200'}
                `}
              />
            ))}
          </div>

          {loading && (
            <p className="text-center text-xs text-amber-600 font-semibold mb-4 animate-pulse">
              Verifying…
            </p>
          )}

          <div className="text-center">
            {cooldown > 0 ? (
              <p className="text-xs text-gray-400">
                Resend in <span className="font-bold text-gray-600">{cooldown}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={resendOtp}
                disabled={resending || loading}
                className="inline-flex items-center gap-1.5 text-xs text-[#2D3B45]
                  font-bold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={12} className={resending ? 'animate-spin' : ''} />
                {resending ? 'Sending…' : "Didn't receive a code? Resend"}
              </button>
            )}
          </div>

          <p className="text-center text-[11px] text-gray-400 mt-5">
            Wrong account?{' '}
            <a href="/auth/register"
              className="text-[#2D3B45] font-bold hover:underline">
              Start over
            </a>
          </p>
        </div>

        <p className="text-center text-[11px] text-white/40 mt-3 px-4">
          Code expires in 15 minutes · Max 5 attempts
        </p>
      </div>
    </div>
  );
}