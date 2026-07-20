import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../auth/auth.context';

interface ProfileSnapshot {
  avatarUrl: string | null;
  fullName:  string | null;
}

// Tiny module-level cache so Sidebar + Topbar don't both fire a request on mount
let cache: ProfileSnapshot | null = null;
let cacheUserId: string | null = null;

export function useProfile() {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<ProfileSnapshot | null>(
    cacheUserId === user?.userId ? cache : null
  );

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) { setProfile(null); cache = null; cacheUserId = null; return; }
    if (cacheUserId === user.userId && cache) { setProfile(cache); return; }

    let cancelled = false;
    apiClient.get<{ avatarUrl?: string | null; fullName?: string | null }>('/users/me')
      .then(res => {
        if (cancelled) return;
        const data = (res.data as any)?.data ?? res.data;
        const snapshot = { avatarUrl: data?.avatarUrl ?? null, fullName: data?.fullName ?? null };
        cache = snapshot;
        cacheUserId = user.userId;
        setProfile(snapshot);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isAuthenticated, user?.userId]);

  return profile;
}