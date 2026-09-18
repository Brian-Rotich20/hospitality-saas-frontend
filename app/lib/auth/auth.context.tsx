'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authClient } from './authClient';
import { vendorsService } from '../api/endpoints';

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
  // When true, create the vendor record right after signup and send the
  // user to onboarding instead of their normal landing page.
  asVendor?: boolean;
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

function getSafeRedirect(redirectTo: string | null | undefined) {
  return redirectTo?.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : null;
}

function mapSessionUser(sessionUser: any): User {
  return {
    userId: sessionUser.id, email: sessionUser.email, fullName: sessionUser.name ?? undefined,
    role: sessionUser.role ?? 'customer', vendorId: sessionUser.vendorId ?? undefined,
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

      let mapped = mapSessionUser(data.user);

      if (options?.asVendor) {
        await vendorsService.become();
        await fetchSession();
        mapped = { ...mapped, role: 'vendor' };
      }

      setUser(mapped);

      if (options?.silent) return; // caller owns its own toast/redirect

      toast.success('Account created!');
      router.push(options?.asVendor ? '/vendor/onboarding' : (ROLE_REDIRECT[mapped.role] ?? '/store'));
    } finally { setLoading(false); }
  }, [router, fetchSession]);

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