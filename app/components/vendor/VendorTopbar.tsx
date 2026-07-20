'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Bell, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '../../lib/auth/auth.context';
import { useProfile } from '../../lib/hooks/useProfile';

export function VendorTopbar() {
  const { user } = useAuth();
  const profile  = useProfile();

  const displayName = profile?.fullName || user?.email?.split('@')[0] || 'Vendor';
  const initial      = displayName.charAt(0).toUpperCase();

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: 'transparent',
      padding: '24px 28px 8px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 16,
      fontFamily: 'DM Sans, system-ui, sans-serif',
    }}>

      {/* Left: identity — avatar + name + email, links to Account */}
      <Link
        href="/vendor/settings/account"
        style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: '50%', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#D1D5DB', flexShrink: 0,
        }}>
          {profile?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: '#374151', fontSize: 13, fontWeight: 800 }}>{initial}</span>
          )}
        </div>
        <div className="hidden sm:block">
          <p style={{
            fontSize: 13, fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1.3,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {displayName}
            <ChevronDown size={12} color="#9CA3AF" />
          </p>
          <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, lineHeight: 1.3 }}>
            {user?.email}
          </p>
        </div>
      </Link>

      {/* Center: search */}
      <div className="hidden md:flex" style={{
        flex: 1, maxWidth: 260, alignItems: 'center', gap: 8,
        background: '#fff', border: '1px solid #ECECE6', borderRadius: 999,
        padding: '9px 14px',
      }}>
        <Search size={13} color="#9CA3AF" />
        <input
          placeholder="Search..."
          style={{
            border: 'none', background: 'transparent', outline: 'none',
            fontSize: 12, color: '#374151', width: '100%',
          }}
        />
      </div>

      {/* Right: notification bell */}
      <button style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '1px solid #ECECE6', background: '#fff',
        cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0,
      }}>
        <Bell size={15} color="#374151" />
        <span style={{
          position: 'absolute', top: 6, right: 7,
          width: 6, height: 6, borderRadius: '50%',
          background: '#EF4444', border: '1.5px solid #fff',
        }} />
      </button>
    </div>
  );
}