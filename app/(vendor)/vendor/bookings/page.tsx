'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { bookingsService } from '../../../lib/api/endpoints';
import type { ApiError } from '../../../lib/api/client';
import type { BookingStatus, BookingSummary } from '../../../lib/types/booking';
import {
  bookingErrorMessage, deadlineLabel, formatCalendarDate, statusMeta, vendorCanRespond,
} from '../../../lib/bookings/booking-ui';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { ReasonDialog } from '../../../components/bookings/ReasonDialog';
import {
  Calendar, Clock, User, Users, CheckCircle, XCircle, AlertCircle, Search, Eye, RefreshCw,
} from 'lucide-react';

// The list endpoint returns at most 100 rows per call; counts below cover the latest 100.
const LIMIT = 100;

type Tab = 'all' | BookingStatus;
const TABS: { key: Tab; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'requested', label: 'Requests' },
  { key: 'accepted',  label: 'Accepted' },
  { key: 'completed', label: 'Completed' },
  { key: 'declined',  label: 'Declined' },
  { key: 'expired',   label: 'Expired' },
  { key: 'cancelled', label: 'Cancelled' },
];

const fmt = (d: string) => formatCalendarDate(d, 'd MMM yyyy');

// ─── Booking Row ──────────────────────────────────────────────────────────────
function BookingRow({ booking, onAccept, onDecline, busy }: {
  booking: BookingSummary;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  busy: boolean;
}) {
  const cfg = statusMeta(booking.status).hex;
  const label = statusMeta(booking.status).label;
  const canRespond = vendorCanRespond(booking);
  const deadline = booking.status === 'requested' ? deadlineLabel(booking.respondBy) : null;

  return (
    <div style={{
      background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12,
      padding: '16px 20px', display: 'flex', flexWrap: 'wrap',
      justifyContent: 'space-between', gap: 14, alignItems: 'center',
    }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', minWidth: 0, flex: '1 1 320px' }}>
        <div style={{ width: 52, height: 52, borderRadius: 8, flexShrink: 0, background: '#F3F4F6', overflow: 'hidden' }}>
          {booking.listing?.coverPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={booking.listing.coverPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={20} color="#9CA3AF" />
            </div>
          )}
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <Link href={`/vendor/bookings/${booking.id}`} style={{ fontSize: 13, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 260, whiteSpace: 'nowrap', textDecoration: 'none' }}>
              {booking.listing?.title ?? 'Listing'}
            </Link>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
              background: cfg.bg, color: cfg.fg, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
              {label}
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
              <User size={11} /> {booking.customer?.fullName || 'Customer'}
            </span>
            <span style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={11} /> {fmt(booking.startDate)}{booking.endDate !== booking.startDate ? ` → ${fmt(booking.endDate)}` : ''}
            </span>
            <span style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Users size={11} /> {booking.guests.toLocaleString()} guest{booking.guests === 1 ? '' : 's'}
            </span>
            {deadline ? (
              <span style={{ fontSize: 11, color: '#B45309', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} /> Respond {deadline}
              </span>
            ) : (
              <span style={{ fontSize: 11, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} /> Received {new Date(booking.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <Link href={`/vendor/bookings/${booking.id}`}
          style={{ padding: '6px 10px', border: '1px solid #E5E7EB', borderRadius: 7, fontSize: 11, fontWeight: 600, color: '#374151', background: '#fff', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
          <Eye size={11} /> View
        </Link>

        {canRespond && (
          <>
            <button
              onClick={() => onAccept(booking.id)}
              disabled={busy}
              style={{
                padding: '6px 12px', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, color: '#fff',
                background: busy ? '#6EE7B7' : '#10B981', cursor: busy ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <CheckCircle size={11} /> {busy ? '…' : 'Accept'}
            </button>
            <button
              onClick={() => onDecline(booking.id)}
              disabled={busy}
              style={{
                padding: '6px 12px', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, color: '#fff',
                background: busy ? '#FCA5A5' : '#EF4444', cursor: busy ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <XCircle size={11} /> Decline
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VendorBookingsPage() {
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [declineTarget, setDeclineTarget] = useState<string | null>(null);
  const inFlight = useRef(false);

  const fetchBookings = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError(null);
    try {
      const res = await bookingsService.getVendorBookings({ limit: LIMIT });
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(bookingErrorMessage(err, 'Could not load your bookings.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchBookings(); }, [fetchBookings]);

  // Accepting declines any overlapping requests on the server, so re-fetch afterwards.
  const transition = async (id: string, call: () => Promise<unknown>, success: string) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setActionId(id);
    try {
      await call();
      toast.success(success);
      setDeclineTarget(null);
      await fetchBookings(true);
    } catch (err) {
      toast.error(bookingErrorMessage(err));
      const code = (err as ApiError).code;
      if (code === 'REQUEST_EXPIRED' || code === 'INVALID_TRANSITION' || code === 'DATES_UNAVAILABLE') {
        setDeclineTarget(null);
        await fetchBookings(true);
      }
    } finally {
      inFlight.current = false;
      setActionId(null);
    }
  };

  const handleAccept = (id: string) =>
    void transition(id, () => bookingsService.accept(id), 'Booking accepted. The customer has been notified.');
  const handleDeclineConfirm = (reason: string) => {
    if (declineTarget) void transition(declineTarget, () => bookingsService.decline(declineTarget, reason), 'Request declined');
  };

  const q = search.trim().toLowerCase();
  const filtered = bookings.filter(b =>
    (activeTab === 'all' || b.status === activeTab) &&
    (!q || b.listing?.title?.toLowerCase().includes(q) || b.customer?.fullName?.toLowerCase().includes(q)));

  const counts = TABS.reduce((acc, tab) => {
    acc[tab.key] = tab.key === 'all' ? bookings.length : bookings.filter(b => b.status === tab.key).length;
    return acc;
  }, {} as Record<Tab, number>);

  return (
    <div style={{ fontFamily: 'DM Sans, system-ui, sans-serif' }}>
      {declineTarget && (
        <ReasonDialog
          title="Decline this request"
          description="The customer will see your reason. Declining frees the dates for other requests."
          placeholder="e.g. We are fully booked on those dates."
          confirmLabel="Decline request" busyLabel="Declining…"
          busy={actionId === declineTarget}
          onClose={() => setDeclineTarget(null)}
          onConfirm={handleDeclineConfirm}
        />
      )}

      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Bookings
          </h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
            Respond to requests within 24 hours. Payment is arranged directly between you and the customer.
          </p>
        </div>

        <div className="vb-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total',     value: counts.all,       color: '#111827' },
            { label: 'Requests',  value: counts.requested, color: '#F59E0B' },
            { label: 'Accepted',  value: counts.accepted,  color: '#10B981' },
            { label: 'Completed', value: counts.completed, color: '#8B5CF6' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{loading ? '–' : s.value}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ position: 'relative', marginBottom: 16 }}>
          <Search size={14} aria-hidden style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by listing or customer name..."
            aria-label="Search bookings"
            style={{
              width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9,
              border: '1px solid #E5E7EB', borderRadius: 9, fontSize: 13, outline: 'none',
              background: '#fff', boxSizing: 'border-box',
            }}
          />
        </div>

        <div role="tablist" aria-label="Filter by status" style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #E5E7EB', overflowX: 'auto' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 14px', border: 'none', background: 'none',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                color: activeTab === tab.key ? '#111827' : '#9CA3AF',
                borderBottom: activeTab === tab.key ? '2px solid #111827' : '2px solid transparent',
                marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {tab.label}
              {counts[tab.key] > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 700, background: activeTab === tab.key ? '#111827' : '#F3F4F6',
                  color: activeTab === tab.key ? '#fff' : '#9CA3AF', padding: '1px 6px', borderRadius: 20,
                }}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div role="alert" style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 13, color: '#991B1B' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><AlertCircle size={14} /> {error}</span>
            <button onClick={() => void fetchBookings()} style={{ display: 'flex', alignItems: 'center', gap: 4, border: 'none', background: 'none', color: '#991B1B', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <LoadingSpinner text="Loading bookings..." />
          </div>
        ) : !error && filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB' }}>
            <Calendar size={36} color="#E5E7EB" style={{ marginBottom: 12, display: 'inline-block' }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>
              {bookings.length === 0 ? 'No bookings yet' : 'No bookings found'}
            </p>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
              {bookings.length === 0
                ? 'Requests from customers will appear here. Publish a listing to start receiving them.'
                : activeTab === 'requested' ? 'No requests waiting for a reply.' : 'Try a different filter or search.'}
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
                busy={actionId !== null}
              />
            ))}
            {bookings.length >= LIMIT && (
              <p style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', margin: '6px 0 0' }}>
                Showing your {LIMIT} most recent bookings.
              </p>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) { .vb-stats { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </div>
  );
}
