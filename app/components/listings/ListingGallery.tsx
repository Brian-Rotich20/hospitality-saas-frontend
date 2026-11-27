// components/listings/ListingGallery.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Package, Heart, Share2, ChevronLeft, ChevronRight, Grid2X2, X } from 'lucide-react';
import { useAuth } from '../../lib/auth/auth.context';
import { customerService } from '../../lib/api/endpoints';
import type { ApiError } from '../../lib/api/client';

interface Props {
  photos: string[];
  title:  string;
  /** Enables the Save (heart) button, backed by /users/me/saved. */
  listingId?: string;
}

/** Real saved state: GET /users/me/saved/:id, toggled by POST. Signed-out visitors go to sign in. */
function useSaved(listingId?: string) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!listingId || !isAuthenticated || !user?.emailVerified) return;
    let cancelled = false;
    customerService.isSaved(listingId)
      .then((res) => { if (!cancelled) setSaved(!!(res.data as { saved?: boolean })?.saved); })
      .catch(() => { /* treat as not saved */ });
    return () => { cancelled = true; };
  }, [listingId, isAuthenticated, user?.emailVerified]);

  const toggle = async () => {
    if (!listingId || busy) return;
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
  return { saved, busy, toggle, enabled: !!listingId };
}

export function ListingGallery({ photos, title, listingId }: Props) {
  const [idx,       setIdx]       = useState(0);
  const [copied,    setCopied]    = useState(false);
  const [showAll,   setShowAll]   = useState(false);
  const { saved: favorited, busy: saving, toggle: toggleSaved, enabled: canSave } = useSaved(listingId);

  const prev = useCallback(() =>
    setIdx(i => (i - 1 + photos.length) % photos.length), [photos.length]);

  const next = useCallback(() =>
    setIdx(i => (i + 1) % photos.length), [photos.length]);

  useEffect(() => {
    if (photos.length <= 1) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape')     setShowAll(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next, photos.length]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silent */ }
  };

  if (!photos.length) {
    return (
      <div className="h-56 bg-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2">
        <Package size={28} className="text-gray-300" />
        <p className="text-[11px] font-semibold text-gray-300 tracking-widest uppercase">No photos</p>
      </div>
    );
  }

  // Desktop: hero + 2 side thumbnails (like reference)
  // Mobile: single image with arrows
  return (
    <>
      {/* ── Desktop grid layout ────────────────────────────────────── */}
      <div className="hidden sm:block relative">
        <div className={`grid gap-1.5 rounded-2xl overflow-hidden ${
          photos.length >= 3 ? 'grid-cols-[1fr_180px]' : 'grid-cols-1'
        }`}>
          {/* Main hero image */}
          <div className="relative h-[340px] group">
            <Image
              src={photos[idx]}
              alt={`${title} — cover`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              sizes="(min-width: 640px) 65vw, 100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

            {/* Nav arrows */}
            {photos.length > 1 && (
              <>
                <button onClick={prev} aria-label="Previous"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10
                    w-8 h-8 rounded-full bg-white/90 border border-gray-200 shadow-sm
                    flex items-center justify-center text-gray-700
                    hover:bg-white transition-all active:scale-95 opacity-0 group-hover:opacity-100">
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </button>
                <button onClick={next} aria-label="Next"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10
                    w-8 h-8 rounded-full bg-white/90 border border-gray-200 shadow-sm
                    flex items-center justify-center text-gray-700
                    hover:bg-white transition-all active:scale-95 opacity-0 group-hover:opacity-100">
                  <ChevronRight size={16} strokeWidth={2.5} />
                </button>
              </>
            )}

            {/* Counter bottom left */}
            {photos.length > 1 && (
              <span className="absolute bottom-3 left-3 z-10
                bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold
                px-2.5 py-1 rounded-full tracking-wide">
                {idx + 1} / {photos.length}
              </span>
            )}
          </div>

          {/* Side thumbnails — top and bottom */}
          {photos.length >= 3 && (
            <div className="flex flex-col gap-1.5 h-[340px]">
              {[1, 2].map(offset => {
                const photoIdx = (idx + offset) % photos.length;
                return (
                  <button key={offset}
                    onClick={() => (offset === 2 && photos.length > 3 ? setShowAll(true) : setIdx(photoIdx))}
                    aria-label={offset === 2 && photos.length > 3 ? `Show all ${photos.length} photos` : `Show photo ${photoIdx + 1}`}
                    className="relative flex-1 overflow-hidden group/thumb">
                    <Image
                      src={photos[photoIdx]}
                      alt={`Photo ${photoIdx + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover/thumb:scale-[1.04]"
                      sizes="180px"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover/thumb:bg-transparent transition-colors" />
                    {/* "View all" overlay on last thumb */}
                    {offset === 2 && photos.length > 3 && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover/thumb:bg-black/50 transition-colors">
                        <span className="text-white text-xs font-bold flex items-center gap-1.5">
                          <Grid2X2 size={13} aria-hidden />
                          +{photos.length - 3} more
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Share + like — float top right of hero, outside the grid */}
        <div className="absolute top-3 right-3 sm:right-[192px] flex gap-1.5 z-20">
          {canSave && <button onClick={() => void toggleSaved()} disabled={saving} aria-label={favorited ? 'Remove from saved' : 'Save listing'} aria-pressed={favorited}
            className={`w-8 h-8 rounded-full border shadow-sm flex items-center justify-center
              transition-all active:scale-95 backdrop-blur-sm
              ${favorited
                ? 'bg-white border-red-200 text-red-500'
                : 'bg-white/90 border-gray-200 text-gray-500 hover:text-red-400'}`}>
            <Heart size={14} fill={favorited ? 'currentColor' : 'none'} />
          </button>}
          <div className="relative">
            <button onClick={handleShare} aria-label="Copy link to this listing"
              className="w-8 h-8 rounded-full bg-white/90 border border-gray-200 shadow-sm
                flex items-center justify-center text-gray-500
                hover:text-ink hover:border-ink transition-all active:scale-95 backdrop-blur-sm">
              <Share2 size={13} />
            </button>
            {copied && (
              <span className="absolute -bottom-8 right-0
                text-[10px] font-semibold bg-gray-900 text-white px-2.5 py-1
                rounded-full whitespace-nowrap pointer-events-none shadow-lg">
                Link copied
              </span>
            )}
          </div>
        </div>

        {/* Dot indicators */}
        {photos.length > 1 && photos.length <= 8 && (
          <div className="flex items-center justify-center gap-1.5 mt-2">
            {photos.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} aria-label={`Show photo ${i + 1}`} aria-current={i === idx}
                className={`rounded-full transition-all duration-200
                  ${i === idx ? 'w-4 h-1.5 bg-ink' : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'}`} />
            ))}
          </div>
        )}
      </div>

      {/* ── Mobile: single image with arrows ──────────────────────── */}
      <div className="sm:hidden relative rounded-2xl overflow-hidden">
        <div className="relative h-56">
          <Image
            src={photos[idx]}
            alt={`${title} — photo ${idx + 1}`}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

          {photos.length > 1 && (
            <>
              <button onClick={prev} aria-label="Previous photo" className="absolute left-2 top-1/2 -translate-y-1/2 z-10
                w-7 h-7 rounded-full bg-white/85 flex items-center justify-center active:scale-95">
                <ChevronLeft size={14} />
              </button>
              <button onClick={next} aria-label="Next photo" className="absolute right-2 top-1/2 -translate-y-1/2 z-10
                w-7 h-7 rounded-full bg-white/85 flex items-center justify-center active:scale-95">
                <ChevronRight size={14} />
              </button>
              <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {idx + 1}/{photos.length}
              </span>
            </>
          )}

          <div className="absolute top-2 right-2 flex gap-1.5">
            {canSave && <button onClick={() => void toggleSaved()} disabled={saving} aria-label={favorited ? 'Remove from saved' : 'Save listing'} aria-pressed={favorited}
              className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all
                ${favorited ? 'bg-white border-red-200 text-red-500' : 'bg-white/85 border-transparent text-gray-500'}`}>
              <Heart size={12} fill={favorited ? 'currentColor' : 'none'} />
            </button>}
            <button onClick={handleShare} aria-label="Copy link to this listing"
              className="w-7 h-7 rounded-full bg-white/85 border-transparent flex items-center justify-center text-gray-500">
              <Share2 size={12} />
            </button>
          </div>
        </div>

        {photos.length > 1 && photos.length <= 8 && (
          <div className="flex justify-center gap-1.5 py-2 bg-white">
            {photos.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} aria-label={`Show photo ${i + 1}`} aria-current={i === idx}
                className={`rounded-full transition-all ${i === idx ? 'w-4 h-1.5 bg-ink' : 'w-1.5 h-1.5 bg-gray-300'}`} />
            ))}
          </div>
        )}
      </div>

      {/* ── Full grid lightbox ─────────────────────────────────────── */}
      {showAll && (
        <div className="fixed inset-0 z-50 bg-black/80 overflow-y-auto p-4" role="dialog" aria-modal="true" aria-label={`All photos of ${title}`}
          onClick={() => setShowAll(false)}>
          <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-2 py-8"
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowAll(false)}
              className="col-span-2 sm:col-span-3 justify-self-end inline-flex items-center gap-1 text-white/80 text-sm font-semibold mb-2 hover:text-white transition">
              <X size={15} aria-hidden /> Close
            </button>
            {photos.map((src, i) => (
              <button key={i} onClick={() => { setIdx(i); setShowAll(false); }}
                className="relative aspect-video rounded-xl overflow-hidden ring-2 ring-transparent hover:ring-accent-bg transition-all">
                <Image src={src} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="300px" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}