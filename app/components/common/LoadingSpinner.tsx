import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullPage?: boolean;
}

const sizeClasses = {
  sm: 'w-6 h-6 border-2',
  md: 'w-9 h-9 border-[3px]',
  lg: 'w-13 h-13 border-4',
};

export function LoadingSpinner({ size = 'md', text, fullPage = false }: LoadingSpinnerProps) {
  const wrapperClass = fullPage
    ? 'flex items-center justify-center min-h-[40vh]'
    : 'flex items-center justify-center py-8';

  return (
    <div className={wrapperClass}>
      <div className="flex flex-col items-center gap-3.5">
        <div className={`spinner ${sizeClasses[size]}`} />
        {text && (
          <p className="text-text-secondary text-sm font-medium m-0">{text}</p>
        )}
      </div>
    </div>
  );
}