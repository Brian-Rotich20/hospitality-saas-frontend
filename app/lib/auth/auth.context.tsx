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
  fullName?: string;
  role:      UserRole;
  vendorId?: string;
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
  token:           string | null;
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

// ── Cookie helper — works on both localhost and production (https) ────────────
function setCookie(name: string, value: string, maxAge: number) {
  const isSecure  = window.location.protocol === 'https:';
  const sameSite  = isSecure ? 'Strict' : 'Lax';
  const securePart = isSecure ? '; Secure' : '';
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=${sameSite}${securePart}`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

// ── Token parser ──────────────────────────────────────────────────────────────

function parseToken(token: string): User | null {
  try {
    const decoded = jwtDecode<any>(token);
    if (decoded.exp && decoded.exp < Date.now() / 1000) return null;
    return {
      userId:   decoded.userId,
      email:    decoded.email,
      fullName: decoded.fullName,
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
  const accessTokenRef          = useRef<string | null>(null);
  const [user,      setUser]    = useState<User | null>(null);
  const [token,     setToken]   = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);
  const router = useRouter();

  // ── Set auth state ────────────────────────────────────────────────────────
  const setAuth = useCallback((accessToken: string): User => {
    const parsed = parseToken(accessToken);
    if (!parsed) throw new Error('Invalid token received from server');

    accessTokenRef.current = accessToken;
    setToken(accessToken);
    setUser(parsed);

    // ✅ user_role: 7 days — read by middleware for route protection
    setCookie('user_role',    parsed.role,  7 * 24 * 60 * 60);
    // ✅ access_token: 15 min — read by Server Components for data fetching
    setCookie('access_token', accessToken,  15 * 60);

    return parsed;
  }, []);

  // ── Clear auth state ──────────────────────────────────────────────────────
  const clearAuth = useCallback(() => {
    accessTokenRef.current = null;
    setToken(null);
    setUser(null);
    clearCookie('user_role');
    clearCookie('access_token');
  }, []);

  // ── Silent refresh ────────────────────────────────────────────────────────
  const attemptRefresh = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
      });

      if (!res.ok) return null;

      const json        = await res.json();
      const accessToken = json.data?.accessToken;
      if (!accessToken) return null;

      setAuth(accessToken); // ✅ also resets access_token cookie
      return accessToken;
    } catch {
      return null;
    }
  }, [setAuth]);

  // ── Init — on every page load/refresh, try silent refresh ─────────────────
  // This is the ONLY place we recover session after a refresh.
  // Middleware lets the request through based on user_role cookie.
  // Then here we restore the in-memory access token via refresh endpoint.
  useEffect(() => {
    attemptRefresh().finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-refresh 1 minute before access token expires (every 14 min) ─────
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      attemptRefresh();
    }, 14 * 60 * 1000); // 14 minutes
    return () => clearInterval(interval);
  }, [user, attemptRefresh]);

  // ── login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method:      'POST',
        credentials: 'include',
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

  // ── refreshToken (called by api client on 401) ────────────────────────────
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