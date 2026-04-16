// components/listings/ListingGallery.tsx
// ✅ Client Component — arrow navigation, keyboard support, minimalist design
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image         from 'next/image';
import { Package, Heart, Share2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  photos: string[];
  title:  string;
}

export function ListingGallery({ photos, title }: Props) {
  const [idx,       setIdx]       = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [copied,    setCopied]    = useState(false);

  const prev = useCallback(() =>
    setIdx(i => (i - 1 + photos.length) % photos.length), [photos.length]);

  const next = useCallback(() =>
    setIdx(i => (i + 1) % photos.length), [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (photos.length <= 1) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
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

  if (photos.length === 0) {
    return (
      <div className="h-72 bg-[#1a2228] flex flex-col items-center justify-center gap-3">
        <Package size={36} className="text-white/15" />
        <p className="text-[11px] font-semibold text-white/25 tracking-widest uppercase">No photos</p>
      </div>
    );
  }

  return (
    <div className="relative select-none bg-[#1a2228]">
      {/* Main image */}
      <div className="relative w-full h-[320px] sm:h-[420px] md:h-[500px]">
        <Image
          key={photos[idx]}
          src={photos[idx]}
          alt={`${title} — photo ${idx + 1}`}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        {/* Gradient overlay — subtle bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

        {/* ── Left Arrow ── */}
        {photos.length > 1 && (
          <button
            onClick={prev}
            aria-label="Previous photo"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10
              w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10
              flex items-center justify-center text-white
              hover:bg-black/65 transition-all duration-150 active:scale-95">
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
        )}

        {/* ── Right Arrow ── */}
        {photos.length > 1 && (
          <button
            onClick={next}
            aria-label="Next photo"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10
              w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10
              flex items-center justify-center text-white
              hover:bg-black/65 transition-all duration-150 active:scale-95">
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        )}

        {/* ── Top-right actions ── */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={() => setFavorited(v => !v)}
            aria-label="Favourite"
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/10
              flex items-center justify-center hover:bg-black/65 transition-all">
            <Heart
              size={15}
              className={favorited ? 'fill-red-400 text-red-400' : 'text-white'}
            />
          </button>

          <div className="relative">
            <button
              onClick={handleShare}
              aria-label="Share"
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/10
                flex items-center justify-center hover:bg-black/65 transition-all">
              <Share2 size={15} className="text-white" />
            </button>
            {copied && (
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2
                text-[10px] font-semibold bg-gray-900 text-white px-2.5 py-1
                rounded-full whitespace-nowrap pointer-events-none shadow-lg">
                Copied!
              </span>
            )}
          </div>
        </div>

        {/* ── Photo counter ── */}
        {photos.length > 1 && (
          <span className="absolute bottom-4 right-4 z-10
            bg-black/50 backdrop-blur-sm text-white text-[11px] font-semibold
            px-3 py-1 rounded-full tracking-wide">
            {idx + 1} / {photos.length}
          </span>
        )}

        {/* ── Dot indicators ── */}
        {photos.length > 1 && photos.length <= 10 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10
            flex items-center gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Go to photo ${i + 1}`}
                className={`rounded-full transition-all duration-200
                  ${i === idx
                    ? 'w-5 h-1.5 bg-white'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Thumbnail strip (only if > 2 photos) ── */}
      {photos.length > 2 && (
        <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto scrollbar-none bg-[#1a2228]">
          {photos.map((src, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Photo ${i + 1}`}
              className={`relative h-14 w-[72px] shrink-0 rounded-md overflow-hidden
                transition-all duration-150
                ${i === idx
                  ? 'ring-2 ring-[#F5C842] opacity-100 scale-105'
                  : 'opacity-40 hover:opacity-70'}`}>
              <Image src={src} alt="" fill className="object-cover" sizes="72px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}