'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

// ── Types ─────────────────────────────────────────────────────────────────────

type UserRole = 'customer' | 'vendor' | 'admin';

export interface User {
  userId:    string;
  email:     string;
  role:      UserRole;
  vendorId?: string;  // ✅ present if role === 'vendor'
  fullName?: string;
}

interface RegisterData {
  fullName: string;  // ✅ added
  email:    string;
  password: string;
  phone:    string;
  // no role — always customer
}

interface AuthContextType {
  user:            User | null;
  isLoading:       boolean;
  isAuthenticated: boolean;
  token:           string | null;  // access token in memory only
  login:           (email: string, password: string) => Promise<void>;
  register:        (data: RegisterData) => Promise<void>;
  logout:          () => Promise<void>;
  refreshToken:    () => Promise<void>;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const ROLE_REDIRECT: Record<UserRole, string> = {
  vendor:   '/vendor/dashboard',
  admin:    '/admin/dashboard',
  customer: '/store',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseToken(token: string): User | null {
  try {
    const decoded = jwtDecode<any>(token);
    if (decoded.exp && decoded.exp < Date.now() / 1000) return null;
    return {
      userId:   decoded.userId,
      email:    decoded.email,
      role:     decoded.role ?? 'customer',
      vendorId: decoded.vendorId,
    };
  } catch {
    return null;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // ✅ Access token lives in memory only — never localStorage
  const accessTokenRef          = useRef<string | null>(null);
  const [user,      setUser]    = useState<User | null>(null);
  const [token,     setToken]   = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);
  const router = useRouter();

  // ── Set auth state from access token ─────────────────────────────────────
  const setAuth = useCallback((accessToken: string): User => {
    const parsed = parseToken(accessToken);
    if (!parsed) throw new Error('Invalid token received from server');
    accessTokenRef.current = accessToken;
    setToken(accessToken);
    setUser(parsed);

  document.cookie = `user_role=${parsed.role}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  document.cookie = `access_token=${accessToken}; path=/; max-age=900; SameSite=Lax`;

    return parsed;
  }, []);

  const clearAuth = useCallback(() => {
    accessTokenRef.current = null;
    setToken(null);
    setUser(null);

    document.cookie = 'user_role=; path=/; max-age=0';
    document.cookie = 'access_token=; path=/; max-age=0';
  }, []);

  // ── Silent refresh — uses httpOnly cookie automatically ───────────────────
  const attemptRefresh = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method:      'POST',
        credentials: 'include', // ✅ sends httpOnly cookie
        headers:     { 'Content-Type': 'application/json' },
      });

      if (!res.ok) return null;

      const json        = await res.json();
      const accessToken = json.data?.accessToken;
      if (!accessToken) return null;

      setAuth(accessToken);
      return accessToken;
    } catch {
      return null;
    }
  }, [setAuth]);

  // ── Init — try silent refresh on mount ───────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        await attemptRefresh();
      } catch {
        // not authenticated — fine
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [attemptRefresh]);

  // ── login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method:      'POST',
        credentials: 'include', // ✅ receives httpOnly refresh cookie
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || 'Invalid credentials');
      }

      const json        = await res.json();
      const accessToken = json.data?.accessToken;
      if (!accessToken) throw new Error('No token received from server');

      const parsed = setAuth(accessToken);
      toast.success('Signed in successfully');
      router.push(ROLE_REDIRECT[parsed.role]);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router, setAuth]);

  // ── register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (data: RegisterData) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || 'Registration failed');
      }

      const json        = await res.json();
      const accessToken = json.data?.accessToken;
      if (!accessToken) throw new Error('No token received');

      const parsed = setAuth(accessToken);
      toast.success('Account created successfully');
      router.push(ROLE_REDIRECT[parsed.role]);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router, setAuth]);

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method:      'POST',
        credentials: 'include',
        headers:     { Authorization: `Bearer ${accessTokenRef.current}` },
      });
    } catch { /* silent */ }
    finally {
      clearAuth();
      toast.success('Signed out');
      router.push('/auth/login');
    }
  }, [router, clearAuth]);

  // ── refreshToken (manual — called by api client on 401) ───────────────────
  const refreshToken = useCallback(async () => {
    const result = await attemptRefresh();
    if (!result) {
      clearAuth();
      router.push('/auth/login');
    }
  }, [attemptRefresh, clearAuth, router]);

  return (
    <AuthContext.Provider value={{
      user, isLoading, token,
      isAuthenticated: !!user,
      login, register, logout, refreshToken,
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