import { Suspense } from 'react';
import CallbackHandler from './CallbackHander';

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#2D3B45] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}