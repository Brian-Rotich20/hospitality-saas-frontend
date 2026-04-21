'use client';

import { apiClient } from '../../lib/api/client';
import React, {
  createContext, useContext, useEffect,
  useState, useCallback, useRef
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const ROLE_REDIRECT: Record<UserRole, string> = {
  vendor:   '/vendor/dashboard',
  admin:    '/admin/dashboard',
  customer: '/store',
};

function setCookie(name: string, value: string, maxAge: number) {
  const isSecure   = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const sameSite   = isSecure ? 'None' : 'Lax';
  const securePart = isSecure ? '; Secure' : '';
  document.cookie  = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=${sameSite}${securePart}`;
}

function clearCookie(name: string) {
  const isSecure   = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const sameSite   = isSecure ? 'None' : 'Lax';
  const securePart = isSecure ? '; Secure' : '';
  document.cookie  = `${name}=; path=/; max-age=0; SameSite=${sameSite}${securePart}`;
  document.cookie  = `${name}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie  = `${name}=; path=/; max-age=0; SameSite=None; Secure`;
}

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const accessTokenRef  = useRef<string | null>(null);
  const intervalRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Single shared promise for in-flight refresh ─────────────────────────
  // This is the correct way to dedupe — share the SAME promise, not a boolean flag
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  const [user,      setUser]    = useState<User | null>(null);
  const [token,     setToken]   = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);
  const router = useRouter();

  // ── setAuth ───────────────────────────────────────────────────────────────
  const setAuth = useCallback((accessToken: string): User => {
    const parsed = parseToken(accessToken);
    if (!parsed) throw new Error('Invalid token received from server');

    accessTokenRef.current = accessToken;
    setToken(accessToken);
    setUser(parsed);
    apiClient.setAccessToken(accessToken);
    setCookie('user_role',    parsed.role,    7 * 24 * 60 * 60);
    setCookie('access_token', accessToken,    15 * 60);

    return parsed;
  }, []);

  // ── clearAuth ─────────────────────────────────────────────────────────────
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

  // ── attemptRefresh — guaranteed single in-flight request ─────────────────
  const attemptRefresh = useCallback(async (): Promise<string | null> => {
    // If a refresh is already in flight, return the SAME promise
    // All callers wait for the same result — only ONE hits Redis
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const promise = (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method:      'POST',
          credentials: 'include',
        });

        if (!res.ok) return null;

        const json        = await res.json();
        const accessToken = json.data?.accessToken;
        if (!accessToken) return null;

        setAuth(accessToken);
        return accessToken;
      } catch {
        return null;
      } finally {
        // Clear the shared promise so next refresh can run
        refreshPromiseRef.current = null;
      }
    })();

    // Store the promise so concurrent callers reuse it
    refreshPromiseRef.current = promise;
    return promise;
  }, [setAuth]);

  // ── Init: single refresh attempt on mount ────────────────────────────────
  useEffect(() => {
    // Only attempt if we have evidence of a prior session
    const hasSession = document.cookie.includes('user_role=');
    if (hasSession) {
      attemptRefresh().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-refresh interval — only while logged in ──────────────────────────
  useEffect(() => {
    if (!user) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Refresh 1 minute before the 15-minute access token expires
    intervalRef.current = setInterval(() => {
      attemptRefresh();
    }, 14 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user?.userId, attemptRefresh]);

  // ── Wire apiClient 401 handler ONCE ──────────────────────────────────────
  // Use a ref so this effect never re-runs, but always calls the latest attemptRefresh
  const attemptRefreshRef = useRef(attemptRefresh);
  useEffect(() => {
    attemptRefreshRef.current = attemptRefresh;
  }, [attemptRefresh]);

  useEffect(() => {
    apiClient.setRefreshHandler(async () => {
      const result = await attemptRefreshRef.current();
      if (!result) {
        clearAuth();
        router.push('/auth/login');
        throw new Error('Session expired');
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  // ── refreshToken (public) ─────────────────────────────────────────────────
  const refreshToken = useCallback(async () => {
    const result = await attemptRefresh();
    if (!result) {
      clearAuth();
      router.push('/auth/login');
    }
  }, [attemptRefresh, clearAuth, router]);

  // ── setTokenAndFetchUser (Google OAuth callback) ──────────────────────────
  const setTokenAndFetchUser = useCallback(async (accessToken: string) => {
    const parsed = setAuth(accessToken);
    router.push(ROLE_REDIRECT[parsed.role]);
  }, [setAuth, router]);

  return (
    <AuthContext.Provider value={{
      user, isLoading, token,
      isAuthenticated: !!user,
      login, register, logout, refreshToken,
      setTokenAndFetchUser,
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