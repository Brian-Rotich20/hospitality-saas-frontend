'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, Share2, ArrowLeft } from 'lucide-react';

interface ListingGalleryProps {
  images: string[];
  onFavoriteChange?: (isFavorite: boolean) => void;
}

export function ListingGallery({ images, onFavoriteChange }: ListingGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const displayImages = images?.length > 0 ? images : ['/placeholder.jpg'];

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
    onFavoriteChange?.(!isFavorite);
  };

  return (
    <div style={{ background: '#1c1917', position: 'relative' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Main image — fixed 480px tall */}
        <div style={{ position: 'relative', width: '100%', height: 480 }}>
          {displayImages[selectedImageIndex] ? (
            <Image
              src={displayImages[selectedImageIndex]}
              alt="Listing image"
              fill
              style={{ objectFit: 'cover', opacity: 0.92 }}
              priority
              placeholder="blur"
              blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect fill='%231c1917' width='800' height='600'/%3E%3C/svg%3E"
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#292524', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#78716c', fontSize: 13 }}>No image</span>
            </div>
          )}

          {/* Gradient overlay bottom */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(28,25,23,0.7) 0%, transparent 50%)' }} />

          {/* Action buttons top-right */}
          <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
            <button
              onClick={handleFavoriteClick}
              style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
            >
              <Heart
                size={15}
                fill={isFavorite ? '#ef4444' : 'none'}
                color={isFavorite ? '#ef4444' : '#1c1917'}
              />
            </button>
            <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
              <Share2 size={15} color="#1c1917" />
            </button>
          </div>

          {/* Image counter */}
          {displayImages.length > 1 && (
            <div style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(28,25,23,0.75)', color: '#fafaf8', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, fontFamily: 'DM Sans, sans-serif', backdropFilter: 'blur(4px)', letterSpacing: '0.04em' }}>
              {selectedImageIndex + 1} / {displayImages.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {displayImages.length > 1 && (
          <div style={{ display: 'flex', gap: 6, padding: '10px 0 0', overflowX: 'auto', background: '#1c1917' }}>
            {displayImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                style={{
                  flexShrink: 0, position: 'relative', width: 72, height: 52,
                  borderRadius: 6, overflow: 'hidden', border: 'none', cursor: 'pointer',
                  outline: selectedImageIndex === index ? '2px solid #ea580c' : '2px solid transparent',
                  outlineOffset: 1,
                  opacity: selectedImageIndex === index ? 1 : 0.55,
                  transition: 'opacity 0.15s',
                }}
              >
                {image ? (
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect fill='%23292524' width='72' height='52'/%3E%3C/svg%3E"
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#292524' }} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}