// components/listings/ReviewForm.tsx
'use client';

import { useState } from 'react';
import { Star, Send, Loader2 } from 'lucide-react';
import { reviewsService } from '../../lib/api/endpoints';
import toast from 'react-hot-toast';

interface Props {
  listingId: string;
  bookingId: string;
  onSuccess: () => void;
}

export function ReviewForm({ listingId, bookingId, onSuccess }: Props) {
  const [rating,    setRating]    = useState(0);
  const [hovered,   setHovered]   = useState(0);
  const [title,     setTitle]     = useState('');
  const [body,      setBody]      = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0)       { toast.error('Select a star rating'); return; }
    if (body.length < 10)   { toast.error('Write at least 10 characters'); return; }

    setSubmitting(true);
    try {
      await reviewsService.create({ bookingId, rating, title: title || undefined, body });
      toast.success('Review submitted — thank you!');
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Leave a review</p>

      {/* Star picker */}
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              className="p-0.5 transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                size={28}
                className={`transition-colors ${
                  n <= (hovered || rating)
                    ? 'text-[#F5C842] fill-[#F5C842]'
                    : 'text-gray-200 fill-gray-200'
                }`}
              />
            </button>
          ))}
        </div>
        {(hovered || rating) > 0 && (
          <p className="text-xs font-bold text-[#2D3B45]">
            {LABELS[hovered || rating]}
          </p>
        )}
      </div>

      {/* Optional title */}
      <div>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Headline (optional)"
          maxLength={120}
          className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white
            text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2
            focus:ring-[#2D3B45] focus:border-transparent transition"
        />
      </div>

      {/* Body */}
      <div>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Share your experience — what was great? what could be better?"
          rows={4}
          maxLength={2000}
          required
          className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white
            text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2
            focus:ring-[#2D3B45] focus:border-transparent transition resize-none"
        />
        <p className="text-[10px] text-gray-400 mt-1 text-right">{body.length}/2000</p>
      </div>

      <button
        type="submit"
        disabled={submitting || rating === 0}
        className="w-full flex items-center justify-center gap-2 py-3
          bg-[#2D3B45] text-white text-sm font-black rounded-xl
          hover:bg-[#3a4d5a] transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting
          ? <><Loader2 size={14} className="animate-spin" /> Submitting…</>
          : <><Send size={13} /> Submit Review</>}
      </button>
    </form>
  );
}