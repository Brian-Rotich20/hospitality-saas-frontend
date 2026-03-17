'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Lock, Building2, Eye, EyeOff, MapPin, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL ?? '/api';

// ── Schemas ───────────────────────────────────────────────────────────────────
const accountSchema = z.object({
  fullName: z.string().min(2, 'At least 2 characters'),
  email:    z.string().min(1, 'Required').email('Invalid email'),
  phone:    z.string().regex(/^(\+254|0)[17]\d{8}$/, 'Enter a valid Kenyan number'),
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[0-9]/, 'Must include a number'),
  confirmPassword: z.string().min(1, 'Required'),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match', path: ['confirmPassword'],
});

const businessSchema = z.object({
  businessName:   z.string().min(3, 'At least 3 characters'),
  description:    z.string().min(20, 'At least 20 characters').max(500),
  phoneNumber:    z.string().regex(/^(\+254|0)[17]\d{8}$/, 'Enter a valid Kenyan number'),
  whatsappNumber: z.string().regex(/^(\+254|0)[17]\d{8}$/, 'Enter a valid Kenyan number').optional().or(z.literal('')),
  city:           z.string().min(2, 'Required'),
  county:         z.string().optional(),
});

type AccountData  = z.infer<typeof accountSchema>;
type BusinessData = z.infer<typeof businessSchema>;

const inp = (err: boolean) =>
  `w-full pl-8 pr-3 py-2 text-xs rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-300
   focus:outline-none focus:ring-2 focus:ring-[#F5C842] focus:border-transparent transition
   ${err ? 'border-red-400' : 'border-gray-200'}`;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-2 pb-1 border-t border-gray-100">
      {children}
    </p>
  );
}

export function RegisterVendorForm() {
  const router = useRouter();

  const [step,        setStep]        = useState<1 | 2>(1);
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);

  // ✅ Store token in memory between steps — NOT in auth context
  // so auth context doesn't redirect us to /store after register
  const [tempToken, setTempToken] = useState<string | null>(null);

  const accountForm  = useForm<AccountData>({  resolver: zodResolver(accountSchema)  });
  const businessForm = useForm<BusinessData>({ resolver: zodResolver(businessSchema) });

  // ── Step 1: Register account — call API directly, skip auth context redirect ──
  const onAccountSubmit = async (data: AccountData) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({
          fullName: data.fullName,
          email:    data.email,
          password: data.password,
          phone:    data.phone,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || json.message || 'Registration failed');
      }

      const accessToken = json.data?.accessToken;
      if (!accessToken) throw new Error('No token received');

      // ✅ Store token for step 2 use — don't go through auth context
      // auth context would redirect to /store since role is 'customer'
      setTempToken(accessToken);
      setStep(2);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Apply as vendor using the temp token ──────────────────────────
  const onBusinessSubmit = async (data: BusinessData) => {
    if (!tempToken) {
      toast.error('Session expired. Please go back and try again.');
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/vendors/apply`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${tempToken}`, // ✅ use temp token directly
        },
        body: JSON.stringify({
          businessName:   data.businessName,
          description:    data.description,
          phoneNumber:    data.phoneNumber,
          whatsappNumber: data.whatsappNumber || undefined,
          city:           data.city,
          county:         data.county || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || json.message || 'Application failed');
      }

      toast.success('Application submitted! You\'ll be notified once reviewed.');

      // ✅ Now redirect to login so they get a fresh session
      // (their role is still 'customer' until admin approves)
      router.push('/auth/login?message=application-submitted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2D3B45] flex items-start justify-center p-4 py-8">
      <div className="w-full max-w-sm">

        <div className="text-center mb-6">
          <span className="text-white font-black text-xl tracking-tight">
            link<span className="text-[#F5C842]">mall</span>
          </span>
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mt-3">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors
                  ${step >= s ? 'bg-[#F5C842] text-[#2D3B45]' : 'bg-white/20 text-white/50'}`}>
                  {s}
                </div>
                {s < 2 && <div className={`w-8 h-px ${step > s ? 'bg-[#F5C842]' : 'bg-white/20'}`} />}
              </div>
            ))}
          </div>
          <p className="text-white/60 text-[10px] mt-2">
            {step === 1 ? 'Create your account' : 'Business details'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <>
              <h2 className="text-base font-bold text-gray-900 mb-1">Become a vendor</h2>
              <p className="text-xs text-gray-400 mb-4">First, create your account</p>

              <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                    <input type="text" placeholder="John Doe"
                      {...accountForm.register('fullName')} disabled={loading}
                      className={inp(!!accountForm.formState.errors.fullName)} />
                  </div>
                  {accountForm.formState.errors.fullName && (
                    <p className="text-red-500 text-[10px] mt-0.5">{accountForm.formState.errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                    <input type="email" placeholder="vendor@business.com"
                      {...accountForm.register('email')} disabled={loading}
                      className={inp(!!accountForm.formState.errors.email)} />
                  </div>
                  {accountForm.formState.errors.email && (
                    <p className="text-red-500 text-[10px] mt-0.5">{accountForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                    <input type="tel" placeholder="+254 712 345 678"
                      {...accountForm.register('phone')} disabled={loading}
                      className={inp(!!accountForm.formState.errors.phone)} />
                  </div>
                  {accountForm.formState.errors.phone && (
                    <p className="text-red-500 text-[10px] mt-0.5">{accountForm.formState.errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                    <input type={showPass ? 'text' : 'password'} placeholder="••••••••"
                      {...accountForm.register('password')} disabled={loading}
                      className={`${inp(!!accountForm.formState.errors.password)} pr-8`} />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      className="absolute right-2.5 top-2.5 text-gray-300 hover:text-gray-500">
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {accountForm.formState.errors.password
                    ? <p className="text-red-500 text-[10px] mt-0.5">{accountForm.formState.errors.password.message}</p>
                    : <p className="text-[10px] text-gray-300 mt-0.5">8+ chars · uppercase · number</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                    <input type={showConfirm ? 'text' : 'password'} placeholder="••••••••"
                      {...accountForm.register('confirmPassword')} disabled={loading}
                      className={`${inp(!!accountForm.formState.errors.confirmPassword)} pr-8`} />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-2.5 top-2.5 text-gray-300 hover:text-gray-500">
                      {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {accountForm.formState.errors.confirmPassword && (
                    <p className="text-red-500 text-[10px] mt-0.5">{accountForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-2 rounded-lg bg-[#2D3B45] hover:bg-[#3a4d5a] text-white text-xs font-bold
                    transition disabled:opacity-50 flex items-center justify-center gap-2 mt-1">
                  {loading
                    ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</>
                    : <>Continue <ChevronRight size={13} /></>}
                </button>
              </form>
            </>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <>
              <h2 className="text-base font-bold text-gray-900 mb-1">Business details</h2>
              <p className="text-xs text-gray-400 mb-4">Tell us about your business</p>

              <form onSubmit={businessForm.handleSubmit(onBusinessSubmit)} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Business Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                    <input type="text" placeholder="Your Business Name"
                      {...businessForm.register('businessName')} disabled={loading}
                      className={inp(!!businessForm.formState.errors.businessName)} />
                  </div>
                  {businessForm.formState.errors.businessName && (
                    <p className="text-red-500 text-[10px] mt-0.5">{businessForm.formState.errors.businessName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                  <textarea placeholder="Describe your business and services..."
                    {...businessForm.register('description')} disabled={loading} rows={3}
                    className={`w-full px-3 py-2 text-xs rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-300
                      focus:outline-none focus:ring-2 focus:ring-[#F5C842] focus:border-transparent transition resize-none
                      ${businessForm.formState.errors.description ? 'border-red-400' : 'border-gray-200'}`} />
                  {businessForm.formState.errors.description && (
                    <p className="text-red-500 text-[10px] mt-0.5">{businessForm.formState.errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Business Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                    <input type="tel" placeholder="+254 712 345 678"
                      {...businessForm.register('phoneNumber')} disabled={loading}
                      className={inp(!!businessForm.formState.errors.phoneNumber)} />
                  </div>
                  {businessForm.formState.errors.phoneNumber && (
                    <p className="text-red-500 text-[10px] mt-0.5">{businessForm.formState.errors.phoneNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    WhatsApp <span className="text-gray-300 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                    <input type="tel" placeholder="+254 712 345 678"
                      {...businessForm.register('whatsappNumber')} disabled={loading}
                      className={inp(false)} />
                  </div>
                </div>

                <SectionLabel>Location</SectionLabel>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                    <input type="text" placeholder="Nairobi"
                      {...businessForm.register('city')} disabled={loading}
                      className={inp(!!businessForm.formState.errors.city)} />
                  </div>
                  {businessForm.formState.errors.city && (
                    <p className="text-red-500 text-[10px] mt-0.5">{businessForm.formState.errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    County <span className="text-gray-300 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
                    <input type="text" placeholder="Nairobi County"
                      {...businessForm.register('county')} disabled={loading}
                      className={inp(false)} />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setStep(1)} disabled={loading}
                    className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs
                      font-bold hover:border-gray-400 transition disabled:opacity-50">
                    Back
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 py-2 rounded-lg bg-[#2D3B45] hover:bg-[#3a4d5a] text-white text-xs font-bold
                      transition disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading
                      ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                      : 'Submit Application'}
                  </button>
                </div>
              </form>
            </>
          )}

          <p className="text-center text-[11px] text-gray-400 mt-4">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#2D3B45] font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}