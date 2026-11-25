'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authClient } from './authClient';

type UserRole = 'customer' | 'vendor' | 'admin';

export interface User { userId: string; email: string; fullName?: string; role: UserRole; vendorId?: string; emailVerified: boolean; }

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
}

interface RegisterOptions {
  // When true, skip the default toast + redirect. Used by flows that chain
  // register() with further steps and want exactly one toast/redirect.
  silent?: boolean;
  // When true, the user becomes a vendor right after verifying their email
  // (the backend refuses vendor onboarding before verification).
  asVendor?: boolean;
}

/** Where to verify the emailed code; `intent=vendor` continues into vendor onboarding. */
export function verifyEmailPath(opts: { asVendor?: boolean; redirectTo?: string | null } = {}) {
  const q = new URLSearchParams();
  if (opts.asVendor) q.set('intent', 'vendor');
  const safe = getSafeRedirect(opts.redirectTo);
  if (safe) q.set('redirect', safe);
  const s = q.toString();
  return `/auth/verify-email${s ? `?${s}` : ''}`;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, redirectTo?: string | null) => Promise<void>;
  register: (data: RegisterData, options?: RegisterOptions) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const ROLE_REDIRECT: Record<UserRole, string> = {
  vendor:   '/vendor/dashboard',
  admin:    '/admin/dashboard',
  customer: '/store',
};

export function getSafeRedirect(redirectTo: string | null | undefined) {
  return redirectTo?.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : null;
}

/** Fields of the Better Auth session user that LinkMart uses (role/vendorId are additional fields). */
interface SessionUser { id: string; email: string; name?: string | null; role?: string | null; vendorId?: string | null; emailVerified?: boolean | null }

function isRole(v: unknown): v is UserRole {
  return v === 'customer' || v === 'vendor' || v === 'admin';
}

function mapSessionUser(sessionUser: SessionUser): User {
  return {
    userId: sessionUser.id, email: sessionUser.email, fullName: sessionUser.name ?? undefined,
    role: isRole(sessionUser.role) ? sessionUser.role : 'customer', vendorId: sessionUser.vendorId ?? undefined,
    emailVerified: !!sessionUser.emailVerified,
  };
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const { data } = await authClient.getSession();
      setUser(data?.user ? mapSessionUser(data.user) : null);
    } catch { setUser(null); }
  }, []);

  useEffect(() => { fetchSession().finally(() => setLoading(false)); }, [fetchSession]);

  const login = useCallback(async (email: string, password: string, redirectTo?: string | null) => {
    setLoading(true);
    try {
      const { data, error } = await authClient.signIn.email({ email, password });
      if (error) throw new Error(error.message || 'Invalid credentials');
      if (!data?.user) throw new Error('Login failed');
      const mapped = mapSessionUser(data.user);
      setUser(mapped);
      if (!mapped.emailVerified) {
        // Booking, saving, reviews and vendor onboarding all require a verified email.
        toast('Please verify your email to continue');
        router.push(verifyEmailPath({ redirectTo }));
        return;
      }
      toast.success('Signed in successfully');
      router.push(getSafeRedirect(redirectTo) ?? ROLE_REDIRECT[mapped.role] ?? '/store');
    } finally { setLoading(false); }
  }, [router]);

  const register = useCallback(async (regData: RegisterData, options?: RegisterOptions) => {
    setLoading(true);
    try {
      const { data, error } = await authClient.signUp.email({
        email: regData.email, password: regData.password, name: regData.fullName,
        // @ts-expect-error LinkMart's Better Auth schema defines this additional field.
        phone: regData.phone,
      });
      if (error) throw new Error(error.message || 'Registration failed');
      if (!data?.user) throw new Error('Registration failed');

      const mapped = mapSessionUser(data.user);
      setUser(mapped);

      if (options?.silent) return; // caller owns its own toast/redirect

      if (!mapped.emailVerified) {
        // A 6-digit code was emailed. Vendor onboarding happens after verification.
        toast.success('Account created. Check your email for a 6-digit code.');
        router.push(verifyEmailPath({ asVendor: options?.asVendor }));
        return;
      }
      toast.success('Account created!');
      router.push(options?.asVendor ? '/vendor/onboarding?intent=vendor' : (ROLE_REDIRECT[mapped.role] ?? '/store'));
    } finally { setLoading(false); }
  }, [router]);

  const logout = useCallback(async () => {
    try { await authClient.signOut(); }
    catch { /* silent */ }
    finally {
      setUser(null);
      toast.success('Signed out');
      router.push('/auth/login');
    }
  }, [router]);

  return <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, refetchUser: fetchSession }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}