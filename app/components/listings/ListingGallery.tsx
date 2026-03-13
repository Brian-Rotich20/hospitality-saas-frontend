// components/listings/ListingGallery.tsx
// ✅ Client Component — image switching state only
'use client';

import { useState }  from 'react';
import Image         from 'next/image';
import { Package, Heart, Share2 } from 'lucide-react';

interface Props {
  photos: string[];
  title:  string;
}

export function ListingGallery({ photos, title }: Props) {
  const [idx,        setIdx]      = useState(0);
  const [favorited,  setFavorited] = useState(false);
  const [copied,     setCopied]    = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silent */ }
  };

  if (photos.length === 0) {
    return (
      <div className="h-64 bg-[#2D3B45] flex items-center justify-center">
        <Package size={40} className="text-white/20" />
      </div>
    );
  }

  return (
    <div className="bg-[#2D3B45]">
      {/* Main image */}
      <div className="relative w-full h-56 sm:h-72 md:h-[420px]">
        <Image
          src={photos[idx]}
          alt={title}
          fill
          className="object-cover opacity-90"
          sizes="100vw"
          priority
        />

        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Actions — top right */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setFavorited(v => !v)}
            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center
              hover:bg-white transition shadow-sm">
            <Heart
              size={15}
              className={favorited ? 'fill-red-500 text-red-500' : 'text-gray-700'}
            />
          </button>
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center
              hover:bg-white transition shadow-sm relative">
            <Share2 size={15} className="text-gray-700" />
            {copied && (
              <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-bold
                bg-gray-900 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                Copied!
              </span>
            )}
          </button>
        </div>

        {/* Photo counter — bottom right */}
        {photos.length > 1 && (
          <span className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white
            text-[10px] font-bold px-2.5 py-1 rounded-full">
            {idx + 1} / {photos.length}
          </span>
        )}
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto scrollbar-none">
          {photos.map((src, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`relative h-14 w-20 shrink-0 rounded-lg overflow-hidden transition-all
                ${i === idx
                  ? 'ring-2 ring-[#F5C842] opacity-100'
                  : 'opacity-50 hover:opacity-80'}`}>
              <Image src={src} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}