// components/listings/ReviewSection.tsx
// Server component — fetches reviews + stats server-side
// Eligibility check (needs auth) done client-side via ReviewGate

import { Star, MessageSquare } from 'lucide-react';
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

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12}
          className={i <= Math.round(rating) ? 'text-accent-bg fill-accent-bg' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-8 text-right text-gray-500 font-medium">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-accent-bg rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-gray-400">{count}</span>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const initials = review.customer.fullName
    ? review.customer.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const date = new Date(review.createdAt).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="py-4 border-b border-gray-50 last:border-0">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center shrink-0">
          <span className="text-[10px] font-black text-accent-bg">{initials}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-xs font-bold text-gray-900 truncate">
              {review.customer.fullName ?? 'Anonymous'}
            </p>
            <time className="text-[10px] text-gray-400 shrink-0">{date}</time>
          </div>

          <StarRow rating={review.rating} />

          {review.title && (
            <p className="text-sm font-bold text-gray-800 mt-2">{review.title}</p>
          )}
          <p className="text-sm text-gray-600 leading-relaxed mt-1">{review.body}</p>

          {/* Vendor reply */}
          {review.vendorReply && (
            <div className="mt-3 pl-3 border-l-2 border-ink/20 bg-gray-50 rounded-r-xl p-3">
              <p className="text-[10px] font-black text-ink uppercase tracking-wider mb-1">
                Vendor response
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">{review.vendorReply}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export async function ReviewSection({ listingId }: { listingId: string }) {
  const { reviews, stats } = await fetchReviews(listingId);

  return (
    <div id="reviews" className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden scroll-mt-20">

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={14} className="text-gray-400" />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Reviews
          </p>
        </div>
        {stats.total > 0 && stats.average !== null && (
          <div className="flex items-center gap-1.5">
            <StarRow rating={stats.average} />
            <span className="text-xs font-bold text-gray-700">{stats.average.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({stats.total})</span>
          </div>
        )}
      </div>

      <div className="px-5 py-4 space-y-5">

        {/* Rating breakdown — only if there are reviews */}
        {stats.total > 0 && (
          <div className="space-y-1.5">
            {[
              { label: '5 ★', count: stats.five  },
              { label: '4 ★', count: stats.four  },
              { label: '3 ★', count: stats.three },
              { label: '2 ★', count: stats.two   },
              { label: '1 ★', count: stats.one   },
            ].map(r => (
              <RatingBar key={r.label} label={r.label} count={r.count} total={stats.total} />
            ))}
          </div>
        )}

        {/* Review gate — client component handles eligibility check + form */}
        <ReviewGate listingId={listingId} />

        {/* Review list */}
        {reviews.length > 0 ? (
          <div>
            {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
          </div>
        ) : (
          <div className="text-center py-6">
            <Star size={22} className="text-gray-200 mx-auto mb-2" />
            <p className="text-xs text-gray-400">No reviews yet — be the first!</p>
          </div>
        )}
      </div>
    </div>
  );
}
