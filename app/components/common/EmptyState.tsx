'use client';

import React from 'react';
import { AlertCircle, Package, Search } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  description?: string;
  icon?: 'package' | 'search' | 'alert' | React.ReactNode;
  action?: { label: string; onClick: () => void };
}

const iconMap = {
  package: <Package size={32} color="#1a6645" />,
  search:  <Search  size={32} color="#1a6645" />,
  alert:   <AlertCircle size={32} color="#1a6645" />,
};

const s: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign: 'center', padding: '80px 20px', color: '#6b8a78',
    fontFamily: 'DM Sans, sans-serif',
  },
  iconRing: {
    width: 72, height: 72, borderRadius: '50%',
    background: 'linear-gradient(135deg, #c8e6d4, #a8d5b5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Playfair Display, Georgia, serif',
    fontSize: 22, fontWeight: 600, color: '#1c2a22', marginBottom: 8,
  },
  desc:   { fontSize: 14, marginBottom: 24, maxWidth: 360 },
  btn: {
    background: '#1a6645', color: '#fff', border: 'none',
    borderRadius: 12, padding: '12px 28px', fontSize: 14,
    fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
    transition: 'background 0.2s',
  },
};

export function EmptyState({ message, description, icon = 'package', action }: EmptyStateProps) {
  const iconEl = typeof icon === 'string' ? iconMap[icon as keyof typeof iconMap] : icon;

  return (
    <div style={s.wrap}>
      <div style={s.iconRing}>{iconEl}</div>
      <h3 style={s.title}>{message}</h3>
      {description && <p style={s.desc}>{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          style={s.btn}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.background = '#0d3d2a')}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.background = '#1a6645')}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}