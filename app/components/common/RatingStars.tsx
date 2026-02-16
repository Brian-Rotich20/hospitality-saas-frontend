'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  count?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function RatingStars({
  rating,
  count,
  interactive = false,
  onRate,
  size = 'md',
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeMap = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const starSize = sizeMap[size];
  const displayRating = hoverRating ?? rating;

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => {
              if (interactive && onRate) {
                onRate(star);
              }
            }}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => setHoverRating(null)}
            className={interactive ? 'cursor-pointer' : ''}
            disabled={!interactive}
          >
            <Star
              size={starSize}
              className={`
                transition-colors
                ${
                  star <= displayRating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }
              `}
            />
          </button>
        ))}
      </div>

      {count !== undefined && (
        <span className="text-sm text-gray-600">
          ({count} {count === 1 ? 'review' : 'reviews'})
        </span>
      )}

      {!count && rating > 0 && (
        <span className="text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}