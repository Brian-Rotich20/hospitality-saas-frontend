// Auth context hook for managing authentication state and actions
'use client';

import { useContext } from 'react';
import { AuthContext } from '../auth/auth.context';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}