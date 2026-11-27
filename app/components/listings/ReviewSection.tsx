// components/listings/ReviewSection.tsx
// Server component — fetches reviews + stats server-side
// Eligibility check (needs auth) done client-side via ReviewGate

import { Star } from 'lucide-react';
import { ReviewGate }          from './ReviewGate';
import { serverFetch }         from '../../lib/api/server';

interface Review {
  id:              string;
  rating:          number;
  title?:          string;
  body:            string;
  vendorReply?:    string;
  vendorRepliedAt?: string;
  createdAt:       string;
  customer: {
    id:       string;
    fullName?: string;
  };
}

interface Stats {
  total:   number;
  /** Number with one decimal, or null when there are no reviews (backend contract). */
  average: number | null;
  five:    number;
  four:    number;
  three:   number;
  two:     number;
  one:     number;
}

const EMPTY: { reviews: Review[]; stats: Stats } = { reviews: [], stats: { total: 0, average: null, five: 0, four: 0, three: 0, two: 0, one: 0 } };

async function fetchReviews(listingId: string): Promise<{ reviews: Review[]; stats: Stats }> {
  const { data } = await serverFetch<{ reviews: Review[]; stats: Stats }>(`/reviews/listing/${encodeURIComponent(listingId)}?limit=20`);
  return data ?? EMPTY;
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} aria-hidden className={i <= Math.round(rating) ? 'text-star fill-star' : 'text-border-strong fill-border-strong'} />
      ))}
    </span>
  );
}

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-[13px]">
      <span className="w-14 text-text-secondary tabular">{stars} star{stars === 1 ? '' : 's'}</span>
      <div className="flex-1 h-2 bg-surface-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right text-text-secondary tabular">{count}</span>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const name = review.customer.fullName ?? 'Customer';
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const date = new Date(review.createdAt).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' });
  return (
    <li className="py-5 first:pt-0">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-full bg-primary-subtle text-primary text-[13px] font-semibold flex items-center justify-center shrink-0" aria-hidden>{initials}</span>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-text-primary truncate">{name}</p>
          <p className="flex items-center gap-2 text-[13px] text-text-secondary"><StarRow rating={review.rating} size={12} /> <time>{date}</time></p>
        </div>
      </div>
      {review.title && <p className="mt-3 text-[15px] font-semibold text-text-primary">{review.title}</p>}
      <p className="mt-1.5 text-[15px] leading-relaxed text-text-secondary max-w-[68ch]">{review.body}</p>
      {review.vendorReply && (
        <div className="mt-3 bg-primary-subtle rounded-xl px-4 py-3 max-w-[68ch]">
          <p className="text-[13px] font-semibold text-primary mb-0.5">Response from the vendor</p>
          <p className="text-[14px] leading-relaxed text-text-secondary">{review.vendorReply}</p>
        </div>
      )}
    </li>
  );
}

export async function ReviewSection({ listingId }: { listingId: string }) {
  const { reviews, stats } = await fetchReviews(listingId);
  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="scroll-mt-24">
      <h2 id="reviews-heading" className="text-[20px] font-semibold text-text-primary mb-4">Reviews</h2>

      {stats.total > 0 && stats.average !== null && (
        <div className="grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-10 items-center bg-card border border-border rounded-2xl p-5 mb-6">
          <div>
            <p className="flex items-baseline gap-1"><span className="text-[40px] leading-none font-semibold text-text-primary tabular">{stats.average.toFixed(1)}</span><span className="text-[15px] text-text-secondary">/5</span></p>
            <div className="mt-2"><StarRow rating={stats.average} size={16} /></div>
            <p className="mt-1 text-[13px] text-text-secondary">{stats.total} review{stats.total === 1 ? '' : 's'}</p>
          </div>
          <div className="space-y-2">
            {([[5, stats.five], [4, stats.four], [3, stats.three], [2, stats.two], [1, stats.one]] as const).map(([n, c]) => (
              <RatingBar key={n} stars={n} count={c} total={stats.total} />
            ))}
          </div>
        </div>
      )}

      {/* Eligibility check + form (client component) */}
      <ReviewGate listingId={listingId} />

      {reviews.length > 0 ? (
        <ul className="mt-2 divide-y divide-border">{reviews.map((r) => <ReviewCard key={r.id} review={r} />)}</ul>
      ) : (
        <p className="mt-3 text-[15px] text-text-secondary">No reviews yet. Customers can review after a completed booking.</p>
      )}
    </section>
  );
}
