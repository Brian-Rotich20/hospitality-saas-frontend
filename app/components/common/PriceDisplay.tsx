'use client';

import React from 'react';

interface PriceDisplayProps {
  price: number;
  period?: string;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  showDecimals?: boolean;
}

const fontSizeMap = { sm: 18, md: 22, lg: 32 };

export function PriceDisplay({
  price,
  period,
  currency = 'KSh',
  size = 'md',
  showDecimals = false,
}: PriceDisplayProps) {
  const safePrice = price ?? 0;
  const formatted = showDecimals
    ? safePrice.toLocaleString('en-US')
    : Math.round(safePrice).toLocaleString('en-US');

  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#6b8a78', lineHeight: 1 }}>
          {currency}
        </span>
        <span
          style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: fontSizeMap[size],
            fontWeight: 700,
            color: '#1a6645',
            lineHeight: 1,
          }}
        >
          {formatted}
        </span>
      </div>
      {period && (
        <span style={{ fontSize: 12, color: '#6b8a78' }}>/ {period}</span>
      )}
    </div>
  );
}