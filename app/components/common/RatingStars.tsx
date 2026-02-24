'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
}

const starSizeMap = { sm: 12, md: 14, lg: 18 };

export function RatingStars({ rating, count, size = 'md' }: RatingStarsProps) {
  const starSize = starSizeMap[size];
  const rounded  = Math.round(rating ?? 0);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ display: 'flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={starSize}
            fill={i <= rounded ? '#f59e0b' : 'none'}
            color={i <= rounded ? '#f59e0b' : '#d1d5db'}
          />
        ))}
      </div>
      <span style={{ fontSize: starSize, fontWeight: 600, color: '#1c2a22' }}>
        {(rating ?? 0).toFixed(1)}
      </span>
      {count !== undefined && (
        <span style={{ fontSize: starSize - 1, color: '#6b8a78' }}>
          ({count} review{count !== 1 ? 's' : ''})
        </span>
      )}
    </div>
  );
}