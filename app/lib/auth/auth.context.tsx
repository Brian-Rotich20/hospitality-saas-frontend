// It hooks into the authentication system, providing user state and auth functions to the app
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

type UserRole = 'customer' | 'vendor' | 'admin';

export interface User {
  userId: string;
  email: string;
  role: UserRole;
}
// Define the shape of the authentication context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  token: string | null;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  userType: 'customer' | 'vendor';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function parseToken(token: string): User | null {
  try {
    const decoded = jwtDecode(token) as any;
    
    // Check if token is expired
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return null;
    }
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    return null;
  }
}
// Main authentication provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        
        if (storedToken) {
          const parsedUser = parseToken(storedToken);
          
          if (parsedUser) {
            setToken(storedToken);
            setUser(parsedUser);
          } else {
            // Token expired, try to refresh
            await refreshToken();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Logging in 
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.log('Login failed from backend:', error);
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      const { token: accessToken, refreshToken } = data;

      // Store tokens
      localStorage.setItem(TOKEN_KEY, accessToken);
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }

      // Parse and set user
      const parsedUser = parseToken(accessToken);
      if (parsedUser) {
        setToken(accessToken);
        setUser(parsedUser);
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const result = await response.json();
      
      // If registration returns tokens, auto-login
      if (result.token) {
        const { token: accessToken, refreshToken } = result;
        localStorage.setItem(TOKEN_KEY, accessToken);
        if (refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }

        const parsedUser = parseToken(accessToken);
        if (parsedUser) {
          setToken(accessToken);
          setUser(parsedUser);
          router.push('/dashboard');
        }
      } else {
        // Redirect to login if registration doesn't return tokens
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const refreshToken = useCallback(async () => {
    try {
      const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN_KEY);
      
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const { token: accessToken } = data;

      localStorage.setItem(TOKEN_KEY, accessToken);
      const parsedUser = parseToken(accessToken);
      
      if (parsedUser) {
        setToken(accessToken);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      setToken(null);
      setUser(null);
      router.push('/auth/login');
    }
  }, [router]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshToken,
    token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}