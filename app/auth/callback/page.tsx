import { Suspense } from 'react';
import CallbackHandler from './CallbackHandler';

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-[#2D3B45] flex items-center justify-center">
      <Suspense
        fallback={
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        }
      >
        <CallbackHandler />
      </Suspense>
    </div>
  );
}