'use client';

import React from 'react';
import { AlertCircle, Package, Search } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  description?: string;
  icon?: 'package' | 'search' | 'alert' | React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const defaultIcons = {
  package: <Package size={48} className="text-gray-400" />,
  search: <Search size={48} className="text-gray-400" />,
  alert: <AlertCircle size={48} className="text-gray-400" />,
};

export function EmptyState({
  message,
  description,
  icon = 'package',
  action,
}: EmptyStateProps) {
  const iconElement = typeof icon === 'string' ? defaultIcons[icon as keyof typeof defaultIcons] : icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Icon */}
      <div className="mb-4">
        {iconElement}
      </div>

      {/* Message */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
        {message}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-600 mb-6 text-center max-w-md">
          {description}
        </p>
      )}

      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium text-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}