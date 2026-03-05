'use client';

// lib/auth/auth.context.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

type UserRole = 'customer' | 'vendor' | 'admin';

export interface User {
  userId: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  phone: string;           // ✅ matches backend schema (phone not phoneNumber)
  role: 'customer' | 'vendor';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY         = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const API_BASE_URL      = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Role → redirect map
const ROLE_REDIRECT: Record<UserRole, string> = {
  vendor:   '/vendor/dashboard',
  admin:    '/admin/dashboard',
  customer: '/store',
};

function parseToken(token: string): User | null {
  try {
    const decoded = jwtDecode<any>(token);
    if (decoded.exp && decoded.exp < Date.now() / 1000) return null;
    return { userId: decoded.userId, email: decoded.email, role: decoded.role };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,      setUser]      = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token,     setToken]     = useState<string | null>(null);
  const router = useRouter();

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = localStorage.getItem(TOKEN_KEY);
        if (stored) {
          const parsed = parseToken(stored);
          if (parsed) {
            setToken(stored);
            setUser(parsed);
          } else {
            // silently refresh; if it fails we stay logged out
            await attemptRefresh();
          }
        }
      } catch {
        // not authenticated — that's fine
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Internal helpers ──────────────────────────────────────────────────────
  const persistTokens = (accessToken: string, refresh?: string) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  };

  const clearTokens = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  };

  const setAuth = (accessToken: string) => {
    const parsed = parseToken(accessToken);
    if (!parsed) throw new Error('Invalid token received');
    setToken(accessToken);
    setUser(parsed);
    return parsed;
  };

  const attemptRefresh = async () => {
    const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshTokenValue) return;

    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refreshToken: refreshTokenValue }),
    });
    if (!res.ok) throw new Error('Refresh failed');

    const { token: newToken } = await res.json();
    localStorage.setItem(TOKEN_KEY, newToken);
    setAuth(newToken);
  };

  // ── Public API ────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || err.error || 'Invalid credentials');
      }

      // Backend returns: { token, user }  (no separate refreshToken in your schema)
      const data = await res.json();
      const accessToken: string = data.token ?? data.accessToken;

      persistTokens(accessToken, data.refreshToken);
      const parsed = setAuth(accessToken);

      // Role-based redirect
      router.push(ROLE_REDIRECT[parsed.role] ?? '/store');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || err.error || 'Registration failed');
      }

      const result = await res.json();
      const accessToken: string = result.token ?? result.accessToken;

      if (accessToken) {
        persistTokens(accessToken, result.refreshToken);
        const parsed = setAuth(accessToken);
        router.push(ROLE_REDIRECT[parsed.role] ?? '/store');
      } else {
        // Registration without auto-login → go to login
        router.push('/auth/login?registered=1');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const refreshToken = useCallback(async () => {
    try {
      await attemptRefresh();
    } catch {
      clearTokens();
      setToken(null);
      setUser(null);
      router.push('/auth/login');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch { /* silent */ }
    finally {
      clearTokens();
      setToken(null);
      setUser(null);
      router.push('/auth/login');
    }
  }, [token, router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, token, login, register, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}