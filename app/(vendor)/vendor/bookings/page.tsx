'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth/auth.context';
import { bookingsService } from '../../../lib/api/endpoints';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import {
  Calendar, Clock, MapPin, User, CheckCircle, XCircle,
  AlertCircle, ChevronRight, Search, Filter, Eye
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Booking {
  id: string;
  listingId: string;
  customerId: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed';
  totalAmount: number;
  currency: string;
  guestCount?: number;
  notes?: string;
  createdAt: string;
  listing?: {
    title: string;
    city: string;
    photos: string[];
  };
  customer?: {
    name: string;
    email: string;
    phone?: string;
  };
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:   { label: 'Pending',   bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
  confirmed: { label: 'Confirmed', bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
  declined:  { label: 'Declined',  bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
  cancelled: { label: 'Cancelled', bg: '#F3F4F6', color: '#6B7280', dot: '#9CA3AF' },
  completed: { label: 'Completed', bg: '#EDE9FE', color: '#5B21B6', dot: '#8B5CF6' },
};

const TABS = [
  { key: 'all',       label: 'All' },
  { key: 'pending',   label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'declined',  label: 'Declined' },
];

// ─── Decline Modal ────────────────────────────────────────────────────────────
function DeclineModal({ onConfirm, onCancel, loading }: {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState('');
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
    }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 420, maxWidth: '90vw' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
          Decline Booking
        </h3>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px' }}>
          Please provide a reason for declining this booking.
        </p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Venue unavailable on requested dates..."
          rows={3}
          style={{
            width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB',
            borderRadius: 8, fontSize: 13, resize: 'none', outline: 'none',
            fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: '10px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#374151', background: '#fff', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading || !reason.trim()}
            style={{
              flex: 1, padding: '10px', border: 'none', borderRadius: 8,
              fontSize: 13, fontWeight: 700, color: '#fff',
              background: reason.trim() ? '#EF4444' : '#FCA5A5',
              cursor: reason.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            {loading ? 'Declining...' : 'Decline Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Booking Row ──────────────────────────────────────────────────────────────
function BookingRow({ booking, onAccept, onDecline, actionLoading }: {
  booking: Booking;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  actionLoading: string | null;
}) {
  const router = useRouter();
  const cfg = STATUS_CONFIG[booking.status];
  const isActing = actionLoading === booking.id;

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div style={{
      background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12,
      padding: '16px 20px', display: 'grid',
      gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center',
    }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', minWidth: 0 }}>
        {/* Listing thumbnail */}
        <div style={{
          width: 52, height: 52, borderRadius: 8, flexShrink: 0,
          background: '#F3F4F6', overflow: 'hidden',
        }}>
          {booking.listing?.photos?.[0] ? (
            <img src={booking.listing.photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={20} color="#9CA3AF" />
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 240 }}>
              {booking.listing?.title ?? 'Listing'}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px',
              borderRadius: 20, background: cfg.bg, color: cfg.color,
              display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
              {cfg.label}
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
              <User size={11} /> {booking.customer?.name ?? 'Customer'}
            </span>
            <span style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={11} /> {fmt(booking.startDate)} → {fmt(booking.endDate)}
            </span>
            {booking.listing?.city && (
              <span style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={11} /> {booking.listing.city}
              </span>
            )}
            <span style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} /> {new Date(booking.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>
      </div>

      {/* Right side: amount + actions */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>
            KSh {(booking.totalAmount ?? 0).toLocaleString()}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {/* View detail */}
          <button
            onClick={() => router.push(`/vendor/bookings/${booking.id}`)}
            style={{ padding: '6px 10px', border: '1px solid #E5E7EB', borderRadius: 7, fontSize: 11, fontWeight: 600, color: '#374151', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Eye size={11} /> View
          </button>

          {/* Accept — only for pending */}
          {booking.status === 'pending' && (
            <>
              <button
                onClick={() => onAccept(booking.id)}
                disabled={isActing}
                style={{
                  padding: '6px 12px', border: 'none', borderRadius: 7,
                  fontSize: 11, fontWeight: 700, color: '#fff',
                  background: isActing ? '#6EE7B7' : '#10B981', cursor: isActing ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <CheckCircle size={11} /> {isActing ? '...' : 'Accept'}
              </button>
              <button
                onClick={() => onDecline(booking.id)}
                disabled={isActing}
                style={{
                  padding: '6px 12px', border: 'none', borderRadius: 7,
                  fontSize: 11, fontWeight: 700, color: '#fff',
                  background: isActing ? '#FCA5A5' : '#EF4444', cursor: isActing ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <XCircle size={11} /> {isActing ? '...' : 'Decline'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VendorBookingsPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [declineTarget, setDeclineTarget] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/auth/login');
    if (!authLoading && user?.role !== 'vendor') router.push('/dashboard');
  }, [authLoading, isAuthenticated, user, router]);

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bookingsService.getVendorBookings(50);
      // Handle both { data: [...] } and { data: { data: [...] } }
      const data = response.data;
      const list = Array.isArray(data) ? data : (data as any)?.data ?? [];
      setBookings(list);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  // Toast helper
  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Accept
  const handleAccept = async (id: string) => {
    try {
      setActionLoading(id);
      await bookingsService.accept(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'confirmed' } : b));
      showToast('Booking accepted successfully', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to accept booking', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Decline
  const handleDeclineConfirm = async (reason: string) => {
    if (!declineTarget) return;
    try {
      setActionLoading(declineTarget);
      await bookingsService.decline(declineTarget, reason);
      setBookings(prev => prev.map(b => b.id === declineTarget ? { ...b, status: 'declined' } : b));
      showToast('Booking declined', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failed to decline booking', 'error');
    } finally {
      setActionLoading(null);
      setDeclineTarget(null);
    }
  };

  // Filter
  const filtered = bookings.filter(b => {
    const matchTab = activeTab === 'all' || b.status === activeTab;
    const matchSearch = !search ||
      b.listing?.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.customer?.name?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  // Counts per tab
  const counts = TABS.reduce((acc, tab) => {
    acc[tab.key] = tab.key === 'all'
      ? bookings.length
      : bookings.filter(b => b.status === tab.key).length;
    return acc;
  }, {} as Record<string, number>);

  if (authLoading) return <LoadingSpinner fullPage text="Loading..." />;

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'DM Sans, system-ui, sans-serif' }}>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 100,
          background: toast.type === 'success' ? '#065F46' : '#991B1B',
          color: '#fff', padding: '10px 18px', borderRadius: 10,
          fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}>
          {toast.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {toast.msg}
        </div>
      )}

      {/* ── Decline Modal ── */}
      {declineTarget && (
        <DeclineModal
          onConfirm={handleDeclineConfirm}
          onCancel={() => setDeclineTarget(null)}
          loading={actionLoading === declineTarget}
        />
      )}

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Bookings
          </h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
            Manage and respond to booking requests from customers
          </p>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total',     value: counts.all,       color: '#111827' },
            { label: 'Pending',   value: counts.pending,   color: '#F59E0B' },
            { label: 'Confirmed', value: counts.confirmed, color: '#10B981' },
            { label: 'Completed', value: counts.completed, color: '#8B5CF6' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search + filter row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by listing or customer name..."
              style={{
                width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9,
                border: '1px solid #E5E7EB', borderRadius: 9, fontSize: 13, outline: 'none',
                background: '#fff', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #E5E7EB', paddingBottom: 0 }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 14px', border: 'none', background: 'none',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                color: activeTab === tab.key ? '#111827' : '#9CA3AF',
                borderBottom: activeTab === tab.key ? '2px solid #111827' : '2px solid transparent',
                marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {tab.label}
              {counts[tab.key] > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 700, background: activeTab === tab.key ? '#111827' : '#F3F4F6',
                  color: activeTab === tab.key ? '#fff' : '#9CA3AF',
                  padding: '1px 6px', borderRadius: 20,
                }}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <LoadingSpinner text="Loading bookings..." />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB' }}>
            <Calendar size={36} color="#E5E7EB" style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>No bookings found</p>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
              {activeTab === 'pending' ? 'No pending requests at the moment' : 'Try a different filter'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(booking => (
              <BookingRow
                key={booking.id}
                booking={booking}
                onAccept={handleAccept}
                onDecline={(id) => setDeclineTarget(id)}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}