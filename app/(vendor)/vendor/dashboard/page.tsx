'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth/auth.context';
import { useRouter } from 'next/navigation';
import { bookingsService, listingsService } from '../../../lib/api/endpoints';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Calendar, Package, TrendingUp, Clock, ArrowRight, Plus, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Stats { total: number; pending: number; confirmed: number; revenue: number; listings: number; }

interface Booking {
  id: string; status: string; totalAmount: number; createdAt: string;
  startDate: string; listing?: { title: string; photos: string[] };
  customer?: { name: string };
}

const STATUS_CFG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  pending:   { label: 'Pending',   bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
  confirmed: { label: 'Confirmed', bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
  declined:  { label: 'Declined',  bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
  cancelled: { label: 'Cancelled', bg: '#F3F4F6', color: '#6B7280', dot: '#9CA3AF' },
  completed: { label: 'Completed', bg: '#EDE9FE', color: '#5B21B6', dot: '#8B5CF6' },
};

function StatCard({ label, value, sub, color, icon: Icon }: { label: string; value: string | number; sub?: string; color: string; icon: React.ElementType }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={17} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function VendorDashboardPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  const [stats, setStats]     = useState<Stats>({ total: 0, pending: 0, confirmed: 0, revenue: 0, listings: 0 });
  const [recent, setRecent]   = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.push('/auth/login'); return; }
    if (!authLoading && user?.role !== 'vendor') { router.push('/dashboard'); }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const [bRes, lRes] = await Promise.allSettled([
        bookingsService.getVendorBookings(1, 50),
        listingsService.getMyListings(),
      ]);

      const bookings: Booking[] = bRes.status === 'fulfilled'
        ? (Array.isArray(bRes.value.data) ? bRes.value.data : (bRes.value.data as any)?.data ?? [])
        : [];

      const listingsCount = lRes.status === 'fulfilled'
        ? (Array.isArray(lRes.value.data) ? lRes.value.data.length : (lRes.value.data as any)?.data?.length ?? 0)
        : 0;

      const revenue = bookings
        .filter(b => b.status === 'completed')
        .reduce((s, b) => s + (b.totalAmount ?? 0), 0);

      setStats({
        total:     bookings.length,
        pending:   bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        revenue,
        listings:  listingsCount,
      });
      setRecent(bookings.slice(0, 5));
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (!authLoading && isAuthenticated) fetchData(); }, [authLoading, isAuthenticated, fetchData]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (authLoading) return <LoadingSpinner fullPage text="Loading..." />;

  return (
    <div style={{ fontFamily: 'DM Sans, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          {greeting()}, {user?.email?.split('@')[0] ?? 'Vendor'} 👋
        </h1>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#991B1B' }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Loading dashboard..." />
      ) : (
        <>
          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }} className="stats-grid">
            <StatCard label="Total Bookings"    value={stats.total}     color="#6366F1" icon={Calendar}   />
            <StatCard label="Pending"           value={stats.pending}   color="#F59E0B" icon={Clock}      sub={stats.pending > 0 ? 'Needs attention' : 'All clear'} />
            <StatCard label="My Listings"       value={stats.listings}  color="#10B981" icon={Package}    />
            <StatCard label="Revenue (KSh)"     value={`${(stats.revenue / 1000).toFixed(0)}K`} color="#8B5CF6" icon={TrendingUp} sub="Completed bookings" />
          </div>

          {/* Quick actions */}
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Quick Actions</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { label: '+ New Listing',     href: '/vendor/listings/new', primary: true  },
                { label: 'View Bookings',      href: '/vendor/bookings',        primary: false },
                { label: 'My Listings',        href: '/vendor/listings',        primary: false },
                { label: 'Analytics',          href: '/vendor/analytics',       primary: false },
              ].map(a => (
                <Link key={a.href} href={a.href} style={{
                  padding: '9px 18px', borderRadius: 9, textDecoration: 'none',
                  fontSize: 13, fontWeight: 700,
                  background: a.primary ? '#111827' : '#fff',
                  color:      a.primary ? '#fff'    : '#374151',
                  border: `1px solid ${a.primary ? '#111827' : '#E5E7EB'}`,
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                  {a.primary && <Plus size={13} />}
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Recent bookings */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Recent Bookings</p>
              <Link href="/vendor/bookings" style={{ fontSize: 12, fontWeight: 700, color: '#6366F1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {recent.length === 0 ? (
              <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '40px 20px', textAlign: 'center' }}>
                <Calendar size={32} color="#E5E7EB" style={{ marginBottom: 10 }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>No bookings yet</p>
                <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 16px' }}>Create a listing to start receiving bookings</p>
                <Link href="/vendor/listings/new" style={{ padding: '9px 18px', background: '#111827', color: '#fff', borderRadius: 9, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                  Create Listing
                </Link>
              </div>
            ) : (
              <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
                {recent.map((b, i) => {
                  const cfg = STATUS_CFG[b.status] ?? STATUS_CFG.pending;
                  return (
                    <div key={b.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '13px 18px',
                      borderBottom: i < recent.length - 1 ? '1px solid #F9FAFB' : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#F3F4F6', overflow: 'hidden', flexShrink: 0 }}>
                          {b.listing?.photos?.[0]
                            ? <img src={b.listing.photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={16} color="#9CA3AF" /></div>
                          }
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                            {b.listing?.title ?? 'Booking'}
                          </div>
                          <div style={{ fontSize: 11, color: '#9CA3AF' }}>
                            {new Date(b.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                            {b.customer?.name ? ` · ${b.customer.name}` : ''}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
                          {cfg.label}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                          KSh {(b.totalAmount ?? 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}