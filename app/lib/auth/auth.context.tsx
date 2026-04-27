'use client';

import { apiClient } from '../api/client';
import React, {
  createContext, useContext, useEffect,
  useState, useCallback, useRef,
} from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

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
  user:                 User | null;
  isLoading:            boolean;
  isAuthenticated:      boolean;
  token:                string | null;
  login:                (email: string, password: string) => Promise<void>;
  register:             (data: RegisterData) => Promise<void>;
  logout:               () => Promise<void>;
  refreshToken:         () => Promise<void>;
  setTokenAndFetchUser: (token: string) => Promise<void>;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const ROLE_REDIRECT: Record<UserRole, string> = {
  vendor:   '/vendor/dashboard',
  admin:    '/admin/dashboard',
  customer: '/store',
};

function setCookie(name: string, value: string, maxAge: number) {
  const secure   = window.location.protocol === 'https:';
  const sameSite = secure ? 'None' : 'Lax';
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=${sameSite}${secure ? '; Secure' : ''}`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=None; Secure`;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

function parseToken(token: string): User | null {
  try {
    const d = jwtDecode<any>(token);
    if (d.exp && d.exp < Date.now() / 1000) return null;
    return {
      userId:   d.userId,
      email:    d.email,
      fullName: d.fullName,
      role:     d.role ?? 'customer',
      vendorId: d.vendorId,
    };
  } catch { return null; }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router             = useRouter();
  const accessTokenRef     = useRef<string | null>(null);
  const refreshPromiseRef  = useRef<Promise<string | null> | null>(null);
  const intervalRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const [user,      setUser]    = useState<User | null>(null);
  const [token,     setToken]   = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  // ── setAuth ────────────────────────────────────────────────────────────────
  const setAuth = useCallback((accessToken: string): User => {
    const parsed = parseToken(accessToken);
    if (!parsed) throw new Error('Invalid token');
    accessTokenRef.current = accessToken;
    setToken(accessToken);
    setUser(parsed);
    apiClient.setAccessToken(accessToken);
    setCookie('user_role',    parsed.role, 7 * 24 * 3600);
    setCookie('access_token', accessToken, 15 * 60);
    return parsed;
  }, []);

  // ── clearAuth ──────────────────────────────────────────────────────────────
  const clearAuth = useCallback(() => {
    accessTokenRef.current  = null;
    refreshPromiseRef.current = null;
    setToken(null);
    setUser(null);
    apiClient.setAccessToken(null);
    clearCookie('user_role');
    clearCookie('access_token');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // ── attemptRefresh — single shared promise, no race conditions ─────────────
  const attemptRefresh = useCallback(async (): Promise<string | null> => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    const promise = (async () => {
      try {
        const res = await fetch(`${API}/auth/refresh`, {
          method: 'POST', credentials: 'include',
        });
        if (!res.ok) return null;
        const json = await res.json();
        const at   = json.data?.accessToken;
        if (!at) return null;
        setAuth(at);
        return at;
      } catch {
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    refreshPromiseRef.current = promise;
    return promise;
  }, [setAuth]);

  // ── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (document.cookie.includes('user_role=')) {
      attemptRefresh().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  // ── Auto-refresh interval ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      return;
    }
    intervalRef.current = setInterval(() => attemptRefresh(), 14 * 60 * 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [user?.userId, attemptRefresh]);

  // ── Wire apiClient 401 handler — once only ─────────────────────────────────
  const attemptRefreshRef = useRef(attemptRefresh);
  useEffect(() => { attemptRefreshRef.current = attemptRefresh; }, [attemptRefresh]);

  useEffect(() => {
    apiClient.setRefreshHandler(async () => {
      const result = await attemptRefreshRef.current();
      if (!result) { clearAuth(); router.push('/auth/login'); throw new Error('Session expired'); }
    });
  }, []); // eslint-disable-line

  // ── login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Invalid credentials');
      }
      const json = await res.json();
      const at   = json.data?.accessToken;
      if (!at) throw new Error('No token received');
      const parsed = setAuth(at);
      toast.success('Signed in successfully');
      router.push(ROLE_REDIRECT[parsed.role]);
    } finally {
      setLoading(false);
    }
  }, [router, setAuth]);

  // ── register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (data: RegisterData) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Registration failed');
      }
      const json = await res.json();
      const at   = json.data?.accessToken;
      if (!at) throw new Error('No token received');
      const parsed = setAuth(at);
      toast.success('Account created successfully');
      router.push(ROLE_REDIRECT[parsed.role]);
    } finally {
      setLoading(false);
    }
  }, [router, setAuth]);

  // ── logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: 'POST', credentials: 'include',
        headers: { Authorization: `Bearer ${accessTokenRef.current}` },
      });
    } catch { /* silent */ } finally {
      clearAuth();
      toast.success('Signed out');
      router.push('/auth/login');
    }
  }, [router, clearAuth]);

  // ── refreshToken (public) ──────────────────────────────────────────────────
  const refreshToken = useCallback(async () => {
    const result = await attemptRefresh();
    if (!result) { clearAuth(); router.push('/auth/login'); }
  }, [attemptRefresh, clearAuth, router]);

  // ── setTokenAndFetchUser (Google callback) ─────────────────────────────────
  const setTokenAndFetchUser = useCallback(async (accessToken: string) => {
    const parsed = setAuth(accessToken);
    router.push(ROLE_REDIRECT[parsed.role]);
  }, [setAuth, router]);

  return (
    <AuthContext.Provider value={{
      user, isLoading, token,
      isAuthenticated: !!user,
      login, register, logout, refreshToken, setTokenAndFetchUser,
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