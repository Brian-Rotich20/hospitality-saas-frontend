'use client';

import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
  error: string | Error;
  onDismiss?: () => void;
  variant?: 'banner' | 'inline';
}

export function ErrorAlert({
  error,
  onDismiss,
  variant = 'inline',
}: ErrorAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;

  if (variant === 'banner') {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex items-start">
          <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-red-800">
              {errorMessage}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-3 text-red-600 hover:text-red-700 transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-3">
        <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
        <div className="flex-1">
          <p className="text-sm text-red-700 font-medium">
            Error
          </p>
          <p className="text-sm text-red-600 mt-1">
            {errorMessage}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-red-600 hover:text-red-700 transition shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}