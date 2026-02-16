'use client';

import React from 'react';

interface PriceDisplayProps {
  price: number;
  period?: string;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  showDecimals?: boolean;
}

export function PriceDisplay({
  price,
  period,
  currency = 'KSh',
  size = 'md',
  showDecimals = false,
}: PriceDisplayProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const formattedPrice = showDecimals
    ? price.toLocaleString('en-US')
    : Math.round(price).toLocaleString('en-US');

  return (
    <div className="flex items-baseline space-x-2">
      <div className={`font-bold ${sizeClasses[size]} text-gray-900`}>
        <span className="text-sm font-semibold">{currency}</span>
        {formattedPrice}
      </div>
      {period && (
        <span className="text-gray-600 text-sm">
          / {period}
        </span>
      )}
    </div>
  );
}