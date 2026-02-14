// Role check hook to determine user permissions and access levels
'use client';

import { useAuth } from '../auth/auth.context';

export function useRole(allowedRoles: string[]) {
  const { user } = useAuth();
  return user && allowedRoles.includes(user.role);
}

export function useIsCustomer() {
  const { user } = useAuth();
  return user?.role === 'customer';
}

export function useIsVendor() {
  const { user } = useAuth();
  return user?.role === 'vendor';
}

export function useIsAdmin() {
  const { user } = useAuth();
  return user?.role === 'admin';
}