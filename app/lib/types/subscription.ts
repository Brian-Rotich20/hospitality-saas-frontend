// Vendor subscription contract (backend/src/modules/subscriptions, payments).
// Money is an integer in minor units (KES cents): display amountMinor / 100.

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'suspended' | 'cancelled' | 'expired';
export type OverviewStatus = SubscriptionStatus | 'legacy_unenrolled';
export type AttemptStatus = 'initiated' | 'pending' | 'succeeded' | 'failed' | 'cancelled' | 'reversed';

export interface PaymentMethods {
  paystack: boolean;
  mpesa: boolean;
  paystackRecurring: boolean;
  mpesaRecurring: boolean;
}

export interface PlanSummary { name: string; amountMinor: number; currency: string; interval: string }

export interface Invoice {
  id: string;
  subscriptionId: string;
  planId: string;
  amountMinor: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  dueAt: string;
  status: 'open' | 'paid' | 'void';
  paidAt: string | null;
  voidedAt: string | null;
  voidReason: string | null;
  createdAt: string;
}

export interface SubscriptionOverview {
  status: OverviewStatus;
  entitled: boolean;
  subscription: null | {
    id: string;
    status: SubscriptionStatus;
    trialStartedAt: string;
    trialEndsAt: string;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    graceEndsAt: string | null;
    cancelAtPeriodEnd: boolean;
    cancelledAt: string | null;
    suspendedAt: string | null;
    expiredAt: string | null;
    autoRenew: boolean;
    autoRenewOptIn: boolean;
    billingHoldReason: string | null;
  };
  openInvoice: Invoice | null;
  currentPlan: PlanSummary | null;
}

/** POST/GET /subscriptions/me/payments(/:id). */
export interface PaymentAttempt {
  id: string;
  provider: 'paystack' | 'mpesa';
  status: AttemptStatus;
  amountMinor: number;
  currency: string;
  checkoutUrl: string | null;
  reference: string | null;
  receipt: string | null;
  phone: string | null;
  failureReason: string | null;
  message: string | null;
  createdAt: string;
  completedAt: string | null;
}

/** GET /subscriptions/me/payments row (raw columns; provider is 'daraja' for M-Pesa). */
export interface PaymentHistoryRow {
  id: string;
  invoiceId: string;
  provider: 'paystack' | 'daraja';
  status: AttemptStatus;
  amountMinor: number;
  currency: string;
  providerReference: string | null;
  providerReceipt: string | null;
  phoneMasked: string | null;
  failureReason: string | null;
  initiatedBy: string;
  createdAt: string;
  completedAt: string | null;
}

export interface Plan {
  id: string;
  code: string;
  name: string;
  amountMinor: number;
  currency: string;
  interval: string;
  isActive: boolean;
  createdAt: string;
  deactivatedAt: string | null;
}

export interface AdminSubscriptionRow {
  id: string;
  vendorId: string;
  businessName: string;
  status: SubscriptionStatus;
  trialEndsAt: string;
  currentPeriodEnd: string | null;
  graceEndsAt: string | null;
  billingHoldReason: string | null;
  origin: string;
}

export interface AdminVendorBilling {
  vendor: { id: string; businessName: string; status: string; createdAt: string };
  entitlement: { entitled: boolean; status: OverviewStatus; subscriptionId: string | null };
  subscription: (NonNullable<SubscriptionOverview['subscription']> & { hasSavedCard: boolean; origin: string; createdAt: string }) | null;
  invoices: Invoice[];
  payments: (PaymentHistoryRow & { requiresReview?: boolean; reviewReason?: string | null })[];
  auditTrail: { id: string; action: string; actorType: string; createdAt: string; details?: unknown }[];
}

export interface AdminPaymentRow {
  id: string;
  vendorId: string;
  businessName: string;
  invoiceId: string;
  provider: 'paystack' | 'daraja';
  status: AttemptStatus;
  amountMinor: number;
  currency: string;
  providerReference: string | null;
  providerReceipt: string | null;
  failureReason: string | null;
  requiresReview: boolean;
  reviewReason: string | null;
  reviewedAt: string | null;
  initiatedBy: string;
  createdAt: string;
  completedAt: string | null;
  reversedAt: string | null;
}

export interface RevenueRow {
  currency: string;
  entryType: 'subscription_payment' | 'reversal' | 'refund';
  totalMinor: number;
  count: number;
  needsReview: number;
}
