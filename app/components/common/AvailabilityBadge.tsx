'use client';

import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface AvailabilityBadgeProps {
  available: boolean;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2',
};

const iconSizes = {
  sm: 14,
  md: 16,
  lg: 18,
};

export function AvailabilityBadge({
  available,
  text,
  size = 'md',
}: AvailabilityBadgeProps) {
  const baseClasses = `
    inline-flex
    items-center
    space-x-1.5
    rounded-full
    font-medium
    ${sizeClasses[size]}
  `;

  if (available) {
    return (
      <div className={`${baseClasses} bg-green-100 text-green-700`}>
        <CheckCircle size={iconSizes[size]} />
        <span>{text || 'Available'}</span>
      </div>
    );
  }

  return (
    <div className={`${baseClasses} bg-red-100 text-red-700`}>
      <XCircle size={iconSizes[size]} />
      <span>{text || 'Unavailable'}</span>
    </div>
  );
}