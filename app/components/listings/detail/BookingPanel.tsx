'use client';

// Request-to-book action. Separate from contacting the vendor: a request asks for dates and
// the vendor accepts or declines within 24 hours. Nothing is charged (payment is agreed
// directly). Customers only; signed-out visitors sign in first and come back.

import Link from 'next/link';
import { CalendarCheck } from 'lucide-react';
import { useAuth } from '../../../lib/auth/auth.context';
import type { PriceParts } from '../../../lib/listings/price';

function useBookingLink(listingId: string) {
  const { isAuthenticated, user } = useAuth();
  const bookPath = `/store/${listingId}/book`;
  const blocked = isAuthenticated && user?.role !== undefined && user.role !== 'customer' ? user.role : null;
  return { href: isAuthenticated ? bookPath : `/auth/login?redirect=${encodeURIComponent(bookPath)}`, blocked };
}

function Price({ price, large }: { price: PriceParts | null; large?: boolean }) {
  if (!price) return <p className={`${large ? 'text-[20px]' : 'text-[16px]'} font-semibold text-text-primary`}>Price on request</p>;
  return (
    <p className="text-text-primary">
      {price.from && <span className="text-[13px] text-text-secondary">From </span>}
      <span className={`${large ? 'text-[24px]' : 'text-[18px]'} font-semibold tabular`}>{price.amount}</span>
      {price.unit && <span className="text-[14px] text-text-secondary"> {price.unit}</span>}
    </p>
  );
}

export function BookingPanel({ listingId, price }: { listingId: string; price: PriceParts | null }) {
  const { href, blocked } = useBookingLink(listingId);
  return (
    <section aria-label="Request to book" className="bg-card border border-border rounded-2xl p-5">
      <Price price={price} large />
      {blocked ? (
        <p className="mt-4 text-[14px] text-text-secondary bg-surface-muted rounded-xl px-4 py-3">
          {blocked === 'vendor' ? 'Vendor accounts can’t send booking requests. Use a customer account to book.' : 'Administrator accounts can’t send booking requests.'}
        </p>
      ) : (
        <Link href={href} className="mt-4 flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-white text-[15px] font-semibold no-underline hover:bg-primary-hover transition-colors">
          <CalendarCheck size={18} aria-hidden /> Request to book
        </Link>
      )}
      <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">
        Free to request. Pick your dates and the vendor accepts or declines within 24 hours.
      </p>
    </section>
  );
}

/** Phones: the booking action stays within reach at the bottom of the screen. */
export function MobileBookingBar({ listingId, price }: { listingId: string; price: PriceParts | null }) {
  const { href, blocked } = useBookingLink(listingId);
  if (blocked) return null;
  return (
    <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-card border-t border-border px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-4 shadow-[0_-4px_16px_rgba(3,2,7,0.06)]">
      <div className="min-w-0"><Price price={price} /></div>
      <Link href={href} className="shrink-0 h-12 px-6 rounded-xl bg-primary text-white text-[15px] font-semibold flex items-center no-underline hover:bg-primary-hover">
        Request to book
      </Link>
    </div>
  );
}
