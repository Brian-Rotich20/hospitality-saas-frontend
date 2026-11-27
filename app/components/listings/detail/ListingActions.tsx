'use client';

// Share and Save for a listing. Save is real: GET/POST /users/me/saved/:id (verified users);
// signed-out visitors are sent to sign in and brought back.

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Heart, Share2 } from 'lucide-react';
import { useAuth } from '../../../lib/auth/auth.context';
import { customerService } from '../../../lib/api/endpoints';
import type { ApiError } from '../../../lib/api/client';

export function ListingActions({ listingId, title }: { listingId: string; title: string }) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.emailVerified) return;
    let cancelled = false;
    customerService.isSaved(listingId)
      .then((res) => { if (!cancelled) setSaved(!!(res.data as { saved?: boolean })?.saved); })
      .catch(() => { /* shown as not saved */ });
    return () => { cancelled = true; };
  }, [listingId, isAuthenticated, user?.emailVerified]);

  const toggleSave = async () => {
    if (busy) return;
    if (!isAuthenticated) { router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`); return; }
    setBusy(true);
    try {
      const res = await customerService.toggleSaved(listingId);
      const now = !!(res.data as { saved?: boolean })?.saved;
      setSaved(now);
      toast.success(now ? 'Saved' : 'Removed from saved');
    } catch (err) {
      const e = err as ApiError;
      toast.error(e.code === 'EMAIL_NOT_VERIFIED' ? 'Verify your email to save listings.' : e.message || 'Could not save this listing.');
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title, url }); return; }
      await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    } catch { /* share sheet dismissed */ }
  };

  const pill = 'inline-flex items-center gap-2 h-10 px-4 rounded-full border border-border-strong bg-card text-[14px] font-medium text-text-primary hover:bg-surface-muted transition-colors';
  return (
    <div className="flex gap-2">
      <button type="button" onClick={() => void share()} className={pill}>
        <Share2 size={16} aria-hidden /> Share
      </button>
      <button type="button" onClick={() => void toggleSave()} disabled={busy} aria-pressed={saved} className={pill}>
        <Heart size={16} aria-hidden className={saved ? 'fill-error text-error' : ''} /> {saved ? 'Saved' : 'Save'}
      </button>
    </div>
  );
}
