'use client';

import React from 'react';
import { MapPin } from 'lucide-react';

interface LocationBadgeProps {
  city: string;
  area?: string;
  size?: 'sm' | 'md' | 'lg';
}

const fontSizeMap  = { sm: 12, md: 14, lg: 16 };
const iconSizeMap  = { sm: 13, md: 15, lg: 18 };

export function LocationBadge({ city, area, size = 'md' }: LocationBadgeProps) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: fontSizeMap[size],
        color: '#6b8a78',
        fontWeight: 500,
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      <MapPin size={iconSizeMap[size]} color="#2d9967" style={{ flexShrink: 0 }} />
      <span>
        {city}
        {area && `, ${area}`}
      </span>
    </div>
  );
}