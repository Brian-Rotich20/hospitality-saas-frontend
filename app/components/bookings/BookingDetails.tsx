'use client';

// Booking detail for either party. The backend decides what each role may see
// (contact details only after acceptance); this view shows whatever it returns.

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  AlertCircle, ArrowLeft, Calendar, CheckCircle, Clock, Mail, MapPin,
  MessageSquare, Phone, RefreshCw, Store, Users, XCircle,
} from 'lucide-react';
import { bookingsService } from '../../lib/api/endpoints';
import type { ApiError } from '../../lib/api/client';
import type { Booking, BookingEvent } from '../../lib/types/booking';
import {
  bookingErrorMessage, customerCanCancel, dayCount, deadlineLabel, formatDateRange,
  formatTimestamp, statusMeta, vendorCanCancel, vendorCanRespond,
} from '../../lib/bookings/booking-ui';
import { BookingStatusBadge } from './BookingStatusBadge';
import { BookingTimeline } from './BookingTimeline';
import { ReasonDialog } from './ReasonDialog';
import { LoadingSpinner } from '../common/LoadingSpinner';

type Viewer = 'customer' | 'vendor';
type Dialog = 'decline' | 'cancel' | null;

const PRICING_LABEL: Record<string, string> = {
  per_hour: 'per hour', per_day: 'per day', per_person: 'per person', package: 'package', contact: 'on request',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Row({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <Icon size={14} className="text-gray-400 mt-0.5 shrink-0" aria-hidden />
      <div className="min-w-0">
        <p className="text-[11px] text-gray-400">{label}</p>
        <div className="text-[13px] font-semibold text-gray-800 break-words">{children}</div>
      </div>
    </div>
  );
}

export function BookingDetails({ id, viewer }: { id: string; viewer: Viewer }) {
  const listHref = viewer === 'vendor' ? '/vendor/bookings' : '/customer/bookings';
  const [booking, setBooking] = useState<Booking | null>(null);
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<{ notFound: boolean; message: string } | null>(null);
  const [busy, setBusy] = useState<'accept' | 'decline' | 'cancel' | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const inFlight = useRef(false);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setLoadError(null);
    try {
      const [b, ev] = await Promise.all([
        bookingsService.getById(id),
        bookingsService.getEvents(id).catch(() => ({ data: [] as BookingEvent[] })),
      ]);
      setBooking(b.data);
      setEvents(Array.isArray(ev.data) ? ev.data : []);
    } catch (err) {
      const e = err as ApiError;
      setLoadError({ notFound: e.status === 404 || e.status === 422, message: bookingErrorMessage(err, 'Could not load this booking.') });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  /** Runs one transition at a time; refreshes on conflicts so the page shows the real state. */
  const run = async (kind: 'accept' | 'decline' | 'cancel', call: () => Promise<{ data: Booking }>, success: string) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(kind);
    try {
      const res = await call();
      if (res.data) setBooking(res.data);
      setDialog(null);
      toast.success(success);
      void load(true);
    } catch (err) {
      toast.error(bookingErrorMessage(err));
      const code = (err as ApiError).code;
      if (code === 'REQUEST_EXPIRED' || code === 'INVALID_TRANSITION' || code === 'BOOKING_STARTED' || code === 'DATES_UNAVAILABLE') {
        setDialog(null);
        void load(true);
      }
    } finally {
      inFlight.current = false;
      setBusy(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading booking…" />;

  if (loadError || !booking) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm max-w-lg mx-auto">
        <AlertCircle size={24} className="text-gray-300 mx-auto mb-3" aria-hidden />
        <p className="text-sm font-bold text-gray-700 mb-1">
          {loadError?.notFound ? 'Booking not found' : 'Something went wrong'}
        </p>
        <p className="text-xs text-gray-400 mb-4">
          {loadError?.notFound ? 'It may have been removed, or it belongs to another account.' : loadError?.message}
        </p>
        <div className="flex justify-center gap-2">
          {!loadError?.notFound && (
            <button onClick={() => void load()}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-xs font-bold rounded-xl hover:bg-gray-50">
              <RefreshCw size={12} aria-hidden /> Retry
            </button>
          )}
          <Link href={listHref} className="px-4 py-2 bg-[#2D3B45] text-white text-xs font-bold rounded-xl no-underline hover:bg-[#3a4d5a]">
            Back to bookings
          </Link>
        </div>
      </div>
    );
  }

  const meta = statusMeta(booking.status);
  const deadline = deadlineLabel(booking.respondBy);
  const days = dayCount(booking.startDate, booking.endDate);
  const loc = [booking.listing?.location?.area, booking.listing?.location?.county].filter(Boolean).join(', ');
  const canRespond = viewer === 'vendor' && vendorCanRespond(booking);
  const canCancel = viewer === 'customer' ? customerCanCancel(booking) : vendorCanCancel(booking);
  const shared = booking.status === 'accepted' || booking.status === 'completed';

  return (
    <div className="space-y-4 max-w-3xl">
      <Link href={listHref} className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 no-underline">
        <ArrowLeft size={12} aria-hidden /> All bookings
      </Link>

      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex gap-4 items-start">
        <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
          {booking.listing?.coverPhoto
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={booking.listing.coverPhoto} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><Calendar size={18} className="text-gray-300" aria-hidden /></div>}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-lg font-black text-gray-900 tracking-tight">{booking.listing?.title ?? 'Booking'}</h1>
            <BookingStatusBadge status={booking.status} size="md" />
          </div>
          {loc && <p className="text-xs text-gray-400 flex items-center gap-1 mb-1"><MapPin size={11} aria-hidden /> {loc}</p>}
          <p className="text-xs text-gray-500">{viewer === 'vendor' ? meta.vendorHint : meta.customerHint}</p>
        </div>
      </div>

      {/* Deadline */}
      {booking.status === 'requested' && (
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3" role="status">
          <Clock size={14} className="text-amber-600 mt-0.5 shrink-0" aria-hidden />
          <p className="text-xs text-amber-800">
            {deadline
              ? <>{viewer === 'vendor' ? 'Respond' : 'The vendor must respond'} <strong>{deadline}</strong> ({formatTimestamp(booking.respondBy!)}). Unanswered requests expire automatically.</>
              : 'The response window has passed. This request will be marked expired shortly.'}
          </p>
        </div>
      )}

      {/* Actions */}
      {(canRespond || canCancel || viewer === 'customer') && (
        <div className="flex flex-wrap gap-2">
          {canRespond && (
            <>
              <button
                onClick={() => void run('accept', () => bookingsService.accept(booking.id), 'Booking accepted. The customer has been notified.')}
                disabled={busy !== null}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-wait">
                <CheckCircle size={13} aria-hidden /> {busy === 'accept' ? 'Accepting…' : 'Accept request'}
              </button>
              <button onClick={() => setDialog('decline')} disabled={busy !== null}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 disabled:opacity-60">
                <XCircle size={13} aria-hidden /> Decline
              </button>
            </>
          )}
          {canCancel && (
            <button onClick={() => setDialog('cancel')} disabled={busy !== null}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 disabled:opacity-60">
              <XCircle size={13} aria-hidden /> {booking.status === 'requested' ? 'Cancel request' : 'Cancel booking'}
            </button>
          )}
          {viewer === 'customer' && booking.listing && (booking.status === 'declined' || booking.status === 'expired' || booking.status === 'cancelled') && (
            <Link href={`/store/${booking.listing.id}/book`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2D3B45] text-white text-xs font-bold no-underline hover:bg-[#3a4d5a]">
              <Calendar size={13} aria-hidden /> Request new dates
            </Link>
          )}
          {viewer === 'customer' && booking.listing && booking.status === 'completed' && (
            <Link href={`/store/${booking.listing.id}#reviews`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2D3B45] text-white text-xs font-bold no-underline hover:bg-[#3a4d5a]">
              <MessageSquare size={13} aria-hidden /> Leave a review
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title="Booking">
          <Row icon={Calendar} label="Dates">
            {formatDateRange(booking.startDate, booking.endDate)}
            <span className="font-normal text-gray-400"> · {days} day{days === 1 ? '' : 's'}</span>
          </Row>
          <Row icon={Users} label="Guests">{booking.guests.toLocaleString()}</Row>
          <Row icon={Clock} label="Requested">{formatTimestamp(booking.createdAt)}</Row>
          {booking.specialRequests && (
            <Row icon={MessageSquare} label="Special requests">
              <span className="font-normal whitespace-pre-line">{booking.specialRequests}</span>
            </Row>
          )}
        </Section>

        {viewer === 'vendor' ? (
          <Section title="Customer">
            <Row icon={Users} label="Name">{booking.customer?.fullName || 'Customer'}</Row>
            {booking.customer?.email && <Row icon={Mail} label="Email"><a href={`mailto:${booking.customer.email}`} className="text-[#2D3B45] underline">{booking.customer.email}</a></Row>}
            {booking.customer?.phone && <Row icon={Phone} label="Phone"><a href={`tel:${booking.customer.phone}`} className="text-[#2D3B45] underline">{booking.customer.phone}</a></Row>}
            {!shared && <p className="text-[11px] text-gray-400 mt-2">Contact details are shared once you accept the request.</p>}
          </Section>
        ) : (
          <Section title="Vendor">
            <Row icon={Store} label="Business">
              {booking.listing ? <Link href={`/store/${booking.listing.id}`} className="text-[#2D3B45] underline">{booking.vendor?.businessName ?? 'Vendor'}</Link> : (booking.vendor?.businessName ?? 'Vendor')}
            </Row>
            {booking.vendor?.phoneNumber && <Row icon={Phone} label="Phone"><a href={`tel:${booking.vendor.phoneNumber}`} className="text-[#2D3B45] underline">{booking.vendor.phoneNumber}</a></Row>}
            {!shared && <p className="text-[11px] text-gray-400 mt-2">The vendor&apos;s phone number is shared once they accept.</p>}
          </Section>
        )}
      </div>

      {(booking.declineReason || booking.cancellationReason) && (
        <Section title={booking.declineReason ? 'Reason for declining' : `Cancelled by the ${booking.cancelledBy ?? 'user'}`}>
          <p className="text-[13px] text-gray-700 whitespace-pre-line">{booking.declineReason ?? booking.cancellationReason}</p>
        </Section>
      )}

      <Section title="Payment">
        <p className="text-[13px] text-gray-700">{booking.paymentNote}</p>
        {booking.pricingType && (
          <p className="text-[11px] text-gray-400 mt-1.5">
            Listing pricing: {PRICING_LABEL[booking.pricingType] ?? booking.pricingType} ({booking.currency}). Agree the final price with the {viewer === 'vendor' ? 'customer' : 'vendor'}.
          </p>
        )}
      </Section>

      <Section title="History">
        <BookingTimeline events={events} />
      </Section>

      {dialog === 'decline' && (
        <ReasonDialog
          title="Decline this request"
          description="The customer will see your reason. Declining frees the dates for other requests."
          placeholder="e.g. We are fully booked on those dates."
          confirmLabel="Decline request" busyLabel="Declining…" busy={busy === 'decline'}
          onClose={() => setDialog(null)}
          onConfirm={(reason) => void run('decline', () => bookingsService.decline(booking.id, reason), 'Request declined.')}
        />
      )}
      {dialog === 'cancel' && (
        <ReasonDialog
          title={booking.status === 'requested' ? 'Cancel this request' : 'Cancel this booking'}
          description={`The ${viewer === 'vendor' ? 'customer' : 'vendor'} will be notified with your reason. This cannot be undone.`}
          placeholder="e.g. Our event date has changed."
          confirmLabel={booking.status === 'requested' ? 'Cancel request' : 'Cancel booking'} busyLabel="Cancelling…" busy={busy === 'cancel'}
          onClose={() => setDialog(null)}
          onConfirm={(reason) => void run('cancel', () => bookingsService.cancel(booking.id, reason), 'Booking cancelled.')}
        />
      )}
    </div>
  );
}
