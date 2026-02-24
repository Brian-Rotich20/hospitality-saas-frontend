'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullPage?: boolean;
}

const sizeMap = {
  sm: { wh: 24, border: 2 },
  md: { wh: 36, border: 3 },
  lg: { wh: 52, border: 4 },
};

export function LoadingSpinner({ size = 'md', text, fullPage = false }: LoadingSpinnerProps) {
  const { wh, border } = sizeMap[size];

  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div
        style={{
          width: wh,
          height: wh,
          borderRadius: '50%',
          border: `${border}px solid #d4e8db`,
          borderTopColor: '#1a6645',
          animation: 'spin 0.75s linear infinite',
        }}
      />
      {text && (
        <p style={{ color: '#6b8a78', fontSize: 14, fontWeight: 500, margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
          {text}
        </p>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (fullPage) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
        {spinner}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 0' }}>
      {spinner}
    </div>
  );
}