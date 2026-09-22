
'use client';

import React from 'react';
import { ImageOff } from 'lucide-react';

interface State { hasError: boolean; }

// Wraps a single ListingCard so one malformed listing (bad price, missing
// field, anything) can't take the whole grid down with it. Next's route-level
// error.tsx only catches at the *page* level — without this, a single
// throwing card still unmounts every sibling in the same .map().
//
// Must be 'use client' (error boundaries need componentDidCatch, a client
// lifecycle method) — but it can still wrap server-rendered children like
// ListingCard just fine; only this thin wrapper pays the client-JS cost.
export class CardBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('[CardBoundary] a listing card failed to render:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card flex flex-col items-center justify-center gap-2 p-6 text-center min-h-[200px]">
          <ImageOff size={20} className="text-gray-300" />
          <p className="text-[11px] text-gray-400">This listing couldn't be displayed</p>
        </div>
      );
    }
    return this.props.children;
  }
}