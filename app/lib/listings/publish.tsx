'use client';

// Publishing a listing (PATCH /listings/:id/status { status: 'active' }) can be refused for
// reasons the vendor can fix: missing business contact (422 BUSINESS_CONTACT_REQUIRED, with
// details.missing), an inactive subscription (403 SUBSCRIPTION_INACTIVE), fewer than 3 photos
// or invalid pricing (422 VALIDATION_FAILED), or a suspended account (403 VENDOR_SUSPENDED).

import Link from 'next/link';
import toast from 'react-hot-toast';
import type { ApiError } from '../api/client';
import { CONTACT_LABEL } from '../vendors/contact';

export function publishErrorToast(err: unknown, opts: { savedAsDraft?: boolean } = {}) {
  const e = err as Partial<ApiError> & { details?: { missing?: string[] } };
  const suffix = opts.savedAsDraft ? ' It was saved as a draft.' : '';
  if (e.code === 'BUSINESS_CONTACT_REQUIRED') {
    const missing = (!Array.isArray(e.details) && e.details?.missing) || [];
    toast.error(
      <span>
        Add your {missing.length ? missing.map((m) => CONTACT_LABEL[m] ?? m).join(', ') : 'contact details'} to publish.{suffix}{' '}
        <Link href="/vendor/settings/profile" className="underline font-semibold">Open business profile</Link>
      </span>,
      { duration: 8000 },
    );
    return;
  }
  if (e.code === 'SUBSCRIPTION_INACTIVE') {
    toast.error(
      <span>Your subscription isn’t active, so listings can’t be published.{suffix} <Link href="/vendor/subscription" className="underline font-semibold">Go to billing</Link></span>,
      { duration: 8000 },
    );
    return;
  }
  if (e.code === 'VENDOR_SUSPENDED') { toast.error(`Your vendor account is suspended.${suffix}`); return; }
  toast.error(`${e.message || 'Could not publish the listing.'}${suffix}`);
}
