'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../../lib/auth/auth.context';
import { useProfile } from '../../lib/hooks/useProfile';

const LABELS: Record<string, string> = {
  '/vendor/dashboard':        'Dashboard',
  '/vendor/listings':         'My Listings',
  '/vendor/listings/create':  'Create Listing',
  '/vendor/bookings':         'Bookings',
  '/vendor/analytics':        'Analytics',
  '/vendor/settings/account': 'Account',
  '/vendor/settings/profile': 'Business',
};

function getLabel(pathname: string): string {
  if (LABELS[pathname]) return LABELS[pathname];
  if (pathname.includes('/listings/') && pathname.includes('/edit')) return 'Edit Listing';
  if (pathname.includes('/listings/')) return 'Listing Detail';
  if (pathname.includes('/bookings/')) return 'Booking Detail';
  return 'Vendor Portal';
}

interface Props {
  onMobileMenuToggle: () => void;
}

export function VendorTopbar({ onMobileMenuToggle }: Props) {
  const { user } = useAuth();
  const profile  = useProfile();
  const pathname = usePathname();
  const label    = getLabel(pathname);

  const displayName = profile?.fullName || user?.email?.split('@')[0] || 'Vendor';
  const initial      = displayName.charAt(0).toUpperCase();
  const today = new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: '#F7F8F5', borderBottom: '1px solid #E9EBE7',
      padding: '14px 20px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 12,
      fontFamily: 'DM Sans, system-ui, sans-serif',
    }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden"
          style={{
            width: 36, height: 36, borderRadius: 999,
            border: '1px solid #E5E7EB', background: '#fff',
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
          aria-label="Open menu"
        >
          <Menu size={16} color="#374151" />
        </button>

        <div>
          <h2 style={{ fontSize: 17, fontWeight: 900, color: '#0F1F17', margin: 0, letterSpacing: '-0.02em' }}>
            {label}
          </h2>
          <p style={{ fontSize: 11, color: '#9CA3AF', margin: '1px 0 0' }}>{today}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={{
          width: 36, height: 36, borderRadius: 999,
          border: '1px solid #E5E7EB', background: '#fff',
          cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', position: 'relative',
        }}>
          <Bell size={15} color="#6B7280" />
          <span style={{
            position: 'absolute', top: 8, right: 8,
            width: 6, height: 6, borderRadius: '50%',
            background: '#F5C842', border: '1.5px solid #fff',
          }} />
        </button>

        <Link
          href="/vendor/settings/account"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '4px 12px 4px 4px',
            border: '1px solid #E5E7EB', borderRadius: 999,
            background: '#fff', textDecoration: 'none', transition: 'box-shadow 0.15s',
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: '50%', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#0F1F17', flexShrink: 0,
          }}>
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: '#F5C842', fontSize: 11, fontWeight: 800 }}>{initial}</span>
            )}
          </div>
          <span className="hidden sm:block" style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>
            {displayName}
          </span>
        </Link>
      </div>
    </div>
  );
}