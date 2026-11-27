// Presentation rules for the vendor subscription. Mirrors the suggested banners in
// backend/docs/api/FRONTEND-INTEGRATION-GUIDE.md §6. No prices, grace periods or policies
// are invented here: every number shown comes from GET /subscriptions/me.

import { format } from 'date-fns';
import type { ApiError } from '../api/client';
import type { AttemptStatus, OverviewStatus, SubscriptionOverview } from '../types/subscription';

export function formatMoney(amountMinor: number, currency = 'KES'): string {
  const major = amountMinor / 100;
  return `${currency} ${major.toLocaleString('en-KE', { minimumFractionDigits: major % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
}

export function formatDay(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : format(d, 'd MMM yyyy');
}

export const STATUS_LABEL: Record<OverviewStatus, string> = {
  trialing: 'Free trial',
  active: 'Active',
  past_due: 'Payment due',
  suspended: 'Suspended',
  cancelled: 'Cancelled',
  expired: 'Expired',
  legacy_unenrolled: 'Not enrolled',
};

export type Tone = 'ok' | 'warn' | 'bad' | 'neutral';

/** No price is configured yet: billing is held and there is nothing to pay. */
export function billingHeld(o: SubscriptionOverview): boolean {
  return o.subscription?.billingHoldReason === 'no_active_plan' || o.currentPlan === null;
}

export function subscriptionHeadline(o: SubscriptionOverview): { title: string; detail: string | null; tone: Tone } {
  const s = o.subscription;
  const due = o.openInvoice ? formatMoney(o.openInvoice.amountMinor, o.openInvoice.currency) : null;
  switch (o.status) {
    case 'trialing':
      return { title: `Free trial until ${formatDay(s?.trialEndsAt)}`,
        detail: s?.cancelAtPeriodEnd ? 'Cancels when the trial ends.' : null, tone: 'ok' };
    case 'active':
      return { title: 'Subscription active',
        detail: s?.currentPeriodEnd ? `${s.cancelAtPeriodEnd ? 'Ends' : 'Paid until'} ${formatDay(s.currentPeriodEnd)}` : null, tone: 'ok' };
    case 'past_due':
      return { title: due ? `Payment due: ${due}` : 'Payment due',
        detail: s?.graceEndsAt ? `Pay by ${formatDay(s.graceEndsAt)} to keep your listings visible.` : null, tone: 'warn' };
    case 'suspended':
      return { title: 'Listings hidden', detail: due ? `Pay ${due} to restore them.` : 'Pay to restore them.', tone: 'bad' };
    case 'expired':
    case 'cancelled':
      return { title: o.status === 'expired' ? 'Subscription expired' : 'Subscription cancelled',
        detail: 'Resubscribe to show your listings again.', tone: 'bad' };
    case 'legacy_unenrolled':
    default:
      return { title: 'No subscription yet', detail: 'Nothing to pay at the moment.', tone: 'neutral' };
  }
}

export const ATTEMPT_LABEL: Record<AttemptStatus, string> = {
  initiated: 'Starting', pending: 'Pending', succeeded: 'Paid', failed: 'Failed', cancelled: 'Cancelled', reversed: 'Reversed',
};

export const isFinalAttempt = (s: AttemptStatus) => s === 'succeeded' || s === 'failed' || s === 'cancelled' || s === 'reversed';

const CODE_MESSAGES: Record<string, string> = {
  NO_PAYMENT_DUE: 'There is nothing to pay right now.',
  NO_ACTIVE_PLAN: 'Subscription pricing has not been set yet, so there is nothing to pay.',
  PROVIDER_DISABLED: 'This payment method is not available right now. Try another method or try again later.',
  IDEMPOTENCY_KEY_REUSED: 'That payment request was already used. Please try again.',
  SUBSCRIPTION_NOT_ENROLLED: 'Your account is not enrolled in a subscription yet, so there is nothing to pay.',
  AMOUNT_NOT_SUPPORTED: 'This amount cannot be paid with M-Pesa. Please pay by card.',
  SUBSCRIPTION_NOT_CANCELLABLE: 'This subscription cannot be cancelled in its current state.',
  NOTHING_TO_RESUME: 'There is no scheduled cancellation to undo.',
  RECURRING_NOT_AVAILABLE: 'Automatic card renewal is not available.',
  RATE_LIMITED: 'Too many attempts. Wait a minute and try again.',
  VALIDATION_FAILED: 'Check the details and try again.',
};

export function billingErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const e = err as Partial<ApiError> | undefined;
  if (e?.code && CODE_MESSAGES[e.code]) return CODE_MESSAGES[e.code]!;
  if (e?.status === 502) return 'The payment provider could not process the request. Please try again shortly.';
  if (e?.status === 429) return CODE_MESSAGES.RATE_LIMITED!;
  return e?.message || fallback;
}

/** Kenyan mobile number accepted by STK Push: 07XXXXXXXX, 01XXXXXXXX, 2547…, +2547… */
export function normaliseKenyanPhone(input: string): string | null {
  // Same rule as the backend's normaliseKenyanMsisdn (daraja.adapter.ts).
  const digits = input.replace(/[\s\-()]/g, '').replace(/^\+/, '');
  const m = digits.match(/^(?:254|0)?([17]\d{8})$/);
  return m ? `0${m[1]}` : null;
}
