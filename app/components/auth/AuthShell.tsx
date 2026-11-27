import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

// Split sign-in / sign-up screen: a brand panel on the left (desktop only) and the form on
// the right, both on #030207 with green-yellow accents. Forms inside use the .auth-dark
// styles in globals.css, which retheme their light utility classes for this dark surface.

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-dark min-h-[100dvh] bg-night text-white grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <aside className="auth-halftone hidden lg:flex flex-col items-center justify-center px-12 border-r border-night-border" aria-hidden>
        <div className="relative z-10 text-center max-w-[420px]">
          <Image src="/images/mark.png" alt="" width={72} height={72} className="w-[72px] h-[72px] rounded-full mx-auto mb-8" priority />
          <p className="text-[40px] leading-[1.12] font-semibold tracking-[-0.025em] text-balance">
            Book Kenya’s hospitality vendors on <span className="text-lime">LinkMart</span>.
          </p>
          <p className="mt-5 text-[15px] leading-relaxed text-white/60">
            Venues, caterers and event services. Vendors reply within 24 hours and you pay them directly.
          </p>
        </div>
      </aside>

      <main className="flex flex-col min-h-[100dvh] px-5 sm:px-10 py-6">
        <div className="flex items-center justify-between">
          <Link href="/store" className="inline-flex items-center gap-2 text-[15px] font-semibold text-white no-underline hover:text-lime">
            <ArrowLeft size={17} aria-hidden /> Back to store
          </Link>
          <Link href="/store" className="lg:hidden flex items-center gap-2 no-underline" aria-label="LinkMart home">
            <Image src="/images/mark.png" alt="" width={28} height={28} className="w-7 h-7 rounded-full" />
            <span className="text-[17px] font-bold text-white">LinkMart</span>
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-[440px]">{children}</div>
        </div>
      </main>
    </div>
  );
}
