// Display price for a listing. Prices are informational (set by the vendor); LinkMart never
// charges for bookings. API prices are decimal strings ("50000.00") or null.

const UNIT: Record<string, string> = { per_hour: 'per hour', per_day: 'per day', per_person: 'per person', package: 'per package' };

export interface PriceParts { amount: string; unit: string | null; from: boolean }

export function listingPrice(l: { pricingType: string; price: string | null; minPrice?: string | null; maxPrice?: string | null; currency?: string | null }): PriceParts | null {
  if (l.pricingType === 'contact') return null;
  const raw = l.price ?? l.minPrice ?? null;
  const n = raw !== null ? Number(raw) : NaN;
  if (!Number.isFinite(n) || n <= 0) return null;
  return {
    amount: `${l.currency ?? 'KES'} ${n.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`,
    unit: UNIT[l.pricingType] ?? null,
    from: l.price === null || l.pricingType === 'package',
  };
}
