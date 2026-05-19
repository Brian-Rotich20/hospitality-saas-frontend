'use client';
// app/vendor/verify-email/page.tsx
// Does NOT depend on useAuth context — reads access_token cookie directly.
// This is intentional: the user just registered, context may not be hydrated yet.

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const API          = process.env.NEXT_PUBLIC_API_URL ?? '/api';
const OTP_LENGTH   = 6;
const RESEND_WAIT  = 60;

// ── Read raw cookie (no httpOnly, set by RegisterVendorForm) ──────────────────
function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

function setCookie(name: string, value: string, maxAge: number) {
  const secure   = window.location.protocol === 'https:';
  const sameSite = secure ? 'None' : 'Lax';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=${sameSite}${secure ? '; Secure' : ''}`;
}

export default function VendorVerifyEmailPage() {
  const router = useRouter();

  const [otp,       setOtp]       = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified,  setVerified]  = useState(false);
  const [cooldown,  setCooldown]  = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  // Redirect to register if no token (direct URL visit / session expired)
  useEffect(() => {
    if (!getToken()) {
      toast.error('Session expired. Please register again.');
      router.replace('/auth/register-vendor');
    }
  }, [router]);

  // Countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown(c => c <= 1 ? (clearInterval(id), 0) : c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  // ── Submit OTP ──────────────────────────────────────────────────────────────
  const submitOtp = useCallback(async (digits: string[]) => {
    const code = digits.join('');
    if (code.length < OTP_LENGTH) return;

    const token = getToken();
    if (!token) { toast.error('Session expired.'); router.replace('/auth/register-vendor'); return; }

    setVerifying(true);
    try {
      const res  = await fetch(`${API}/vendors/verify-email`, {
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

      // Swap cookies — new token has role=vendor, emailVerified=true
      const { accessToken, refreshToken } = json.data;
      if (accessToken) setCookie('access_token', accessToken, 15 * 60);
      if (refreshToken) setCookie('refresh_token', refreshToken, 7 * 24 * 3600); // optional, mostly httpOnly
      setCookie('user_role', 'vendor', 7 * 24 * 3600);

      setVerified(true);
      toast.success('Email verified! Welcome to LinkMart 🎉');
      setTimeout(() => router.push('/vendor/dashboard'), 1800);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid code. Try again.');
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  }, [router]);

  // ── Input handling ──────────────────────────────────────────────────────────
  const handleChange = (index: number, value: string) => {
    // Handle paste of full code into any box
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
      const filled = Array(OTP_LENGTH).fill('');
      digits.forEach((d, i) => { filled[i] = d; });
      setOtp(filled);
      inputRefs.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus();
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
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────────
  const resendOtp = async () => {
    if (cooldown > 0 || resending) return;
    const token = getToken();
    if (!token) { toast.error('Session expired.'); router.replace('/auth/register-vendor'); return; }

    setResending(true);
    try {
      const res  = await fetch(`${API}/vendors/resend-otp`, {
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

  // ── Verified state ──────────────────────────────────────────────────────────
  if (verified) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-emerald-500" />
          </div>
          <h2 className="text-lg font-black text-gray-900 mb-1">Verified!</h2>
          <p className="text-sm text-gray-500">Your vendor account is now active. Redirecting…</p>
        </div>
      </div>
    );
  }

  // ── Main UI ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-[#2D3B45] px-6 py-5">
            <p className="text-[#F5C842] text-lg font-black">LinkMart</p>
            <p className="text-white/60 text-xs mt-0.5">Vendor verification</p>
          </div>

          <div className="p-6">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <Mail size={20} className="text-blue-500" />
            </div>

            <h1 className="text-xl font-black text-gray-900 mb-1">Check your email</h1>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              We sent a 6-digit code to your email address.
              Enter it below to activate your vendor account.
            </p>

            {/* OTP inputs */}
            <div className="flex gap-2 justify-between mb-6">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}       /* allow paste */
                  value={digit}
                  disabled={verifying}
                  onChange={e  => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onFocus={e   => e.target.select()}
                  className={`w-12 h-14 text-center text-xl font-black rounded-xl border
                    focus:outline-none focus:ring-2 focus:ring-[#2D3B45] focus:border-transparent
                    transition disabled:opacity-50
                    ${digit ? 'border-[#2D3B45] bg-[#2D3B45]/5 text-[#2D3B45]' : 'border-gray-200 bg-white text-gray-900'}`}
                />
              ))}
            </div>

            {/* Verify button */}
            <button
              onClick={() => submitOtp(otp)}
              disabled={verifying || otp.some(d => !d)}
              className="w-full py-3 bg-[#2D3B45] text-white text-sm font-black rounded-xl
                hover:bg-[#3a4d5a] transition disabled:opacity-40 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 mb-4"
            >
              {verifying
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying…</>
                : 'Verify & Activate Account'}
            </button>

            {/* Resend */}
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-2">Didn't receive a code?</p>
              {cooldown > 0 ? (
                <p className="text-xs text-gray-400 font-bold">Resend in {cooldown}s</p>
              ) : (
                <button
                  onClick={resendOtp}
                  disabled={resending || verifying}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D3B45]
                    hover:underline disabled:opacity-50 transition-opacity"
                >
                  <RefreshCw size={11} className={resending ? 'animate-spin' : ''} />
                  {resending ? 'Sending…' : 'Resend code'}
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-4">
          Code expires in 15 minutes · Max 5 attempts
        </p>
      </div>
    </div>
  );
}