'use client';

// Shown across the vendor workspace when the account can't trade normally:
// suspended by an admin (VENDOR_SUSPENDED) or a lapsed subscription (listings hidden).
// GET /vendors/me returns `status` and `subscription` (the entitlement).

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { vendorsService } from '../../lib/api/endpoints';
import { Notice } from '../ui/Surface';

interface VendorMe { status?: string; subscription?: { entitled: boolean; status: string } }

export function VendorStatusBanner() {
  const pathname = usePathname();
  const [me, setMe] = useState<VendorMe | null>(null);

  useEffect(() => {
    let cancelled = false;
    vendorsService.getProfile()
      .then((res) => { if (!cancelled) setMe(res.data as unknown as VendorMe); })
      .catch(() => { /* pages report their own errors */ });
    return () => { cancelled = true; };
  }, [pathname]);

  if (!me) return null;
  if (me.status === 'suspended') {
    return (
      <div className="mb-5">
        <Notice tone="error" title="Your vendor account is suspended">
          Your listings are hidden and changes are blocked. You can still see your bookings, messages and billing. Contact LinkMart support to resolve this.
        </Notice>
      </div>
    );
  }
  if (me.subscription && !me.subscription.entitled && pathname !== '/vendor/subscription') {
    return (
      <div className="mb-5">
        <Notice tone="error" title="Your listings are hidden"
          action={<Link href="/vendor/subscription" className="text-[13px] font-semibold underline whitespace-nowrap">Go to billing</Link>}>
          Your subscription isn’t active, so customers can’t find you and you can’t accept requests.
        </Notice>
      </div>
    );
  }
  return null;
}
