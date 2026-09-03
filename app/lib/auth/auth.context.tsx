'use client';

import React, {
  createContext, useContext, useEffect,
  useState, useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authClient } from './authClient';

type UserRole = 'customer' | 'vendor' | 'admin';

export interface User {
  userId:         string;
  email:          string;
  fullName?:      string;
  role:           UserRole;
  vendorId?:      string;
  emailVerified:  boolean;
}

interface RegisterData {
  fullName: string;
  email:    string;
  password: string;
  phone:    string;
}

interface AuthContextType {
  user:            User | null;
  isLoading:       boolean;
  isAuthenticated: boolean;
  login:           (email: string, password: string, redirectTo?: string | null) => Promise<void>;
  register:        (data: RegisterData) => Promise<void>;
  logout:          () => Promise<void>;
  refetchUser:     () => Promise<void>;
}

const ROLE_REDIRECT: Record<UserRole, string> = {
  vendor:   '/vendor/dashboard',
  admin:    '/admin/dashboard',
  customer: '/store',
};

const VERIFY_REDIRECT: Record<UserRole, string> = {
  vendor:   '/vendor/verify-email',
  admin:    '/auth/verify-email',
  customer: '/auth/verify-email',
};

function getSafeRedirect(redirectTo: string | null | undefined): string | null {
  if (!redirectTo || !redirectTo.startsWith('/') || redirectTo.startsWith('//')) return null;
  return redirectTo;
}

function mapSessionUser(sessionUser: any): User {
  return {
    userId:        sessionUser.id,
    email:         sessionUser.email,
    fullName:      sessionUser.name ?? undefined,
    role:          sessionUser.role ?? 'customer',
    vendorId:      sessionUser.vendorId ?? undefined,
    emailVerified: !!sessionUser.emailVerified,
  };
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user,      setUser]    = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);

  // ── Fetch current session — replaces the old JWT decode + refresh dance ────
  const fetchSession = useCallback(async () => {
    try {
      const { data } = await authClient.getSession();
      setUser(data?.user ? mapSessionUser(data.user) : null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchSession().finally(() => setLoading(false));
  }, [fetchSession]);

  // ── login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string, redirectTo?: string | null) => {
    setLoading(true);
    try {
      const { data, error } = await authClient.signIn.email({ email, password });
      if (error) throw new Error(error.message || 'Invalid credentials');
      if (!data?.user) throw new Error('Login failed');

      const mapped = mapSessionUser(data.user);
      setUser(mapped);

      if (!mapped.emailVerified) {
        toast.error('Please verify your email address first.');
        router.push(VERIFY_REDIRECT[mapped.role]);
        return;
      }

      toast.success('Signed in successfully');
      router.push(getSafeRedirect(redirectTo) ?? ROLE_REDIRECT[mapped.role] ?? '/store');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // ── register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (regData: RegisterData) => {
    setLoading(true);
    try {
      const { data, error } = await authClient.signUp.email({
        email:    regData.email,
        password: regData.password,
        name:     regData.fullName,
        // @ts-expect-error — `phone` is a LinkMart additionalField, not in base client types
        phone:    regData.phone,
      });
      if (error) throw new Error(error.message || 'Registration failed');
      if (!data?.user) throw new Error('Registration failed');

      const mapped = mapSessionUser(data.user);
      setUser(mapped);

      toast.success('Account created! Check your email for a verification code.');
      router.push(VERIFY_REDIRECT[mapped.role]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // ── logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authClient.signOut();
    } catch { /* silent */ } finally {
      setUser(null);
      toast.success('Signed out');
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{
      user, isLoading,
      isAuthenticated: !!user,
      login, register, logout,
      refetchUser: fetchSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}