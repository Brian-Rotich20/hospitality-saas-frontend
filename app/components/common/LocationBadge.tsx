'use client';

import React from 'react';
import { MapPin } from 'lucide-react';

interface LocationBadgeProps {
  city: string;
  area?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const iconSizes = {
  sm: 14,
  md: 16,
  lg: 18,
};

export function LocationBadge({
  city,
  area,
  size = 'md',
}: LocationBadgeProps) {
  return (
    <div className={`flex items-center space-x-1.5 text-gray-600 ${sizeClasses[size]}`}>
      <MapPin size={iconSizes[size]} className="shrink-0 text-primary-600" />
      <span className="font-medium">
        {city}
        {area && `, ${area}`}
      </span>
    </div>
  );
}