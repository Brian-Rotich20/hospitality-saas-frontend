'use client';

// Listing photos. Desktop: one large photo with up to four beside it in a 2×2 grid, all in
// one fixed-height frame so nothing overlaps. Phones: a swipeable carousel with a counter.
// "View all photos" opens every photo in a dialog.

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Grid2X2, ImageOff, X } from 'lucide-react';

interface Props { photos: string[]; title: string }

function AllPhotos({ photos, title, start, onClose }: { photos: string[]; title: string; start: number; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    document.getElementById(`photo-${start}`)?.scrollIntoView({ block: 'center' });
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose, start]);
  return (
    <div role="dialog" aria-modal="true" aria-label={`All photos of ${title}`} className="fixed inset-0 z-[70] bg-card overflow-y-auto">
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
        <p className="text-[15px] font-semibold text-text-primary truncate">{title} · {photos.length} photos</p>
        <button ref={closeRef} type="button" onClick={onClose} className="shrink-0 inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-border-strong text-[14px] font-medium hover:bg-surface-muted">
          <X size={16} aria-hidden /> Close
        </button>
      </div>
      <div className="max-w-[900px] mx-auto p-4 sm:p-6 grid gap-3 sm:grid-cols-2">
        {photos.map((src, i) => (
          <div key={src + i} id={`photo-${i}`} className={`relative rounded-xl overflow-hidden bg-surface-muted ${i % 3 === 0 ? 'sm:col-span-2 aspect-[16/10]' : 'aspect-[4/3]'}`}>
            <Image src={src} alt={`${title}, photo ${i + 1}`} fill sizes="(min-width: 900px) 900px, 100vw" className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListingGallery({ photos, title }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const [index, setIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="h-56 sm:h-[360px] rounded-2xl bg-surface-muted flex flex-col items-center justify-center gap-2 text-text-muted">
        <ImageOff size={26} aria-hidden />
        <p className="text-[14px]">No photos yet</p>
      </div>
    );
  }

  const side = photos.slice(1, 5);
  const grid = side.length >= 2;   // large photo + a column of two
  const quad = side.length >= 4;   // desktop: large photo + 2×2

  return (
    <>
      {/* Desktop and tablet: one frame, fixed height, no overlapping controls */}
      <div className={`relative hidden sm:grid gap-2 h-[400px] lg:h-[460px] rounded-2xl overflow-hidden
        ${!grid ? (side.length === 1 ? 'grid-cols-2' : 'grid-cols-1') : `grid-cols-[2fr_1fr] grid-rows-2 ${quad ? 'lg:grid-cols-4' : ''}`}`}>
        <button type="button" onClick={() => setOpen(0)} aria-label="Show all photos"
          className={`relative bg-surface-muted group ${grid ? 'row-span-2' : ''} ${quad ? 'lg:col-span-2' : ''}`}>
          <Image src={photos[0]!} alt={title} fill priority sizes="(min-width: 1024px) 600px, 66vw" className="object-cover transition-opacity group-hover:opacity-95" />
        </button>
        {side.map((src, i) => (
          <button key={src + i} type="button" onClick={() => setOpen(i + 1)} aria-label={`Show photo ${i + 2}`}
            className={`relative bg-surface-muted group ${i >= 2 ? (quad ? 'hidden lg:block' : 'hidden') : ''} ${!grid && i > 0 ? 'hidden' : ''}`}>
            <Image src={src} alt="" fill sizes="(min-width: 1024px) 300px, 33vw" className="object-cover transition-opacity group-hover:opacity-95" />
          </button>
        ))}
        {photos.length > 1 && (
          <button type="button" onClick={() => setOpen(0)}
            className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-card text-[13px] font-semibold text-text-primary shadow-md hover:bg-surface-muted">
            <Grid2X2 size={14} aria-hidden /> View all {photos.length} photos
          </button>
        )}
      </div>

      {/* Phones: swipe through every photo */}
      <div className="sm:hidden relative -mx-4">
        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
          onScroll={(e) => { const el = e.currentTarget; setIndex(Math.round(el.scrollLeft / el.clientWidth)); }}>
          {photos.map((src, i) => (
            <button key={src + i} type="button" onClick={() => setOpen(i)} aria-label={`Show photo ${i + 1} full size`}
              className="relative shrink-0 w-full aspect-[4/3] snap-center bg-surface-muted">
              <Image src={src} alt={i === 0 ? title : ''} fill priority={i === 0} sizes="100vw" className="object-cover" />
            </button>
          ))}
        </div>
        {photos.length > 1 && (
          <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/65 text-white text-[12px] font-semibold tabular pointer-events-none">
            {index + 1} / {photos.length}
          </span>
        )}
      </div>

      {open !== null && <AllPhotos photos={photos} title={title} start={open} onClose={() => setOpen(null)} />}
    </>
  );
}
