// components/listings/ReviewGate.tsx
// Client component — checks auth + eligibility, then renders ReviewForm
'use client';

import { useState, useEffect } from 'react';
import Link    from 'next/link';
import { useAuth }        from '../../lib/auth/auth.context';
import { reviewsService } from '../../lib/api/endpoints';
import { ReviewForm }     from './ReviewForm';
import { CheckCircle, LogIn } from 'lucide-react';

interface Props {
  listingId: string;
}

type State =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'not_eligible'; reason: string }
  | { status: 'already_reviewed' }
  | { status: 'eligible'; bookingId: string }
  | { status: 'submitted' };

export function ReviewGate({ listingId }: Props) {
  const { isAuthenticated, user } = useAuth();
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    if (!isAuthenticated) {
      setState({ status: 'unauthenticated' });
      return;
    }
    if (user?.role !== 'customer') {
      setState({ status: 'not_eligible', reason: 'Only customers can leave reviews' });
      return;
    }

    reviewsService.getEligibility(listingId)
      .then((res: any) => {
        const data = res.data;
        if (data.existingReviewId) {
          setState({ status: 'already_reviewed' });
        } else if (data.canReview) {
          setState({ status: 'eligible', bookingId: data.bookingId });
        } else {
          setState({ status: 'not_eligible', reason: data.reason });
        }
      })
      .catch(() => setState({ status: 'not_eligible', reason: 'Could not verify eligibility' }));
  }, [isAuthenticated, user, listingId]);

  if (state.status === 'loading') return null;

  if (state.status === 'unauthenticated') {
    return (
      <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
        <LogIn size={14} className="text-gray-400 shrink-0" />
        <p className="text-xs text-gray-500 flex-1">
          <Link href={`/auth/login?redirect=/store/${listingId}`}
            className="font-bold text-[#2D3B45] hover:underline">Sign in</Link>
          {' '}to leave a review after your booking.
        </p>
      </div>
    );
  }

  if (state.status === 'already_reviewed') {
    return (
      <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
        <CheckCircle size={14} className="text-emerald-500 shrink-0" />
        <p className="text-xs font-semibold text-emerald-700">You've already reviewed this listing. Thank you!</p>
      </div>
    );
  }

  if (state.status === 'submitted') {
    return (
      <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
        <CheckCircle size={14} className="text-emerald-500 shrink-0" />
        <p className="text-xs font-semibold text-emerald-700">Review submitted — thank you!</p>
      </div>
    );
  }

  if (state.status === 'not_eligible') {
    // Quietly return null — no clutter for vendor/admin visitors or users without bookings
    return null;
  }

  // eligible — show the form
  return (
    <ReviewForm
      listingId={listingId}
      bookingId={state.bookingId}
      onSuccess={() => setState({ status: 'submitted' })}
    />
  );
}