'use client';

// Saved listings. GET /users/me/saved (verified customers; listings that are no longer public
// are omitted by the server) and POST /users/me/saved/:listingId, which toggles.
// Prices are the vendor's display prices: LinkMart charges nothing for bookings.

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Heart, MapPin } from 'lucide-react';
import { customerService } from '../../../lib/api/endpoints';
import type { ApiError } from '../../../lib/api/client';
import { useLoad } from '../../../lib/hooks/useLoad';
import { Card, EmptyState, Notice, PageHeader, Skeleton } from '../../../components/ui/Surface';
import { Button, ButtonLink } from '../../../components/ui/Button';

interface SavedListing {
  id: string; title: string; slug: string; coverPhoto: string | null;
  location: { county?: string; area?: string } | null;
  pricingType: string; price: string | null; minPrice: string | null; maxPrice: string | null; currency: string | null;
}

const UNIT: Record<string, string> = { per_hour: 'per hour', per_day: 'per day', per_person: 'per person', package: 'per package' };

function priceLabel(l: SavedListing): string {
  if (l.pricingType === 'contact') return 'Price on request';
  const amount = l.price ?? l.minPrice;
  if (!amount) return 'Price on request';
  const n = Number(amount);
  if (!Number.isFinite(n)) return 'Price on request';
  return `${l.price ? '' : 'From '}${l.currency ?? 'KES'} ${n.toLocaleString('en-KE', { maximumFractionDigits: 0 })}${UNIT[l.pricingType] ? ` ${UNIT[l.pricingType]}` : ''}`;
}

export default function SavedListingsPage() {
  const { data, error, loading, reload, setData } = useLoad(() => customerService.getSaved() as Promise<{ data: SavedListing[] }>, []);
  const [removing, setRemoving] = useState<string | null>(null);
  const items = data ?? [];

  const remove = async (l: SavedListing) => {
    if (removing) return;
    setRemoving(l.id);
    try {
      const res = await customerService.toggleSaved(l.id) as { data?: { saved?: boolean } };
      if (res.data?.saved) {
        // The toggle re-saved it (it had already been removed elsewhere): undo once more.
        await customerService.toggleSaved(l.id);
      }
      setData(items.filter((x) => x.id !== l.id));
      toast.success('Removed from saved');
    } catch (err) {
      toast.error((err as ApiError).message || 'Could not remove it. Please try again.');
    } finally {
      setRemoving(null);
    }
  };

  const verifyNeeded = error?.code === 'EMAIL_NOT_VERIFIED';

  return (
    <div>
      <PageHeader title="Saved" description="Listings you’ve saved to come back to." />

      {verifyNeeded ? (
        <Notice tone="warning" title="Verify your email to save listings"
          action={<ButtonLink href="/auth/verify-email?redirect=%2Fcustomer%2Fsaved" size="sm">Verify email</ButtonLink>} />
      ) : error ? (
        <Notice tone="error" title="Could not load your saved listings"
          action={<Button size="sm" variant="secondary" onClick={() => void reload()}>Retry</Button>} />
      ) : loading && !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState icon={<Heart size={20} />} title="Nothing saved yet"
            action={<ButtonLink href="/store" variant="primary">Browse listings</ButtonLink>}>
            Tap the heart on any listing to keep it here.
          </EmptyState>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((l) => {
            const place = [l.location?.area, l.location?.county].filter(Boolean).join(', ');
            return (
              <li key={l.id} className="group bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
                <Link href={`/store/${l.id}`} className="block no-underline">
                  <div className="aspect-[4/3] bg-surface-muted overflow-hidden">
                    {l.coverPhoto
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={l.coverPhoto} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                      : null}
                  </div>
                  <div className="px-4 pt-3.5">
                    <p className="text-[15px] font-semibold text-text-primary line-clamp-2">{l.title}</p>
                    {place && <p className="mt-1 flex items-center gap-1 text-[13px] text-text-secondary"><MapPin size={13} aria-hidden /> {place}</p>}
                    <p className="mt-1.5 text-[14px] font-semibold text-text-primary tabular">{priceLabel(l)}</p>
                  </div>
                </Link>
                <div className="mt-auto flex gap-2 px-4 pb-4 pt-3">
                  <ButtonLink href={`/store/${l.id}/book`} variant="primary" size="sm" className="flex-1">Request to book</ButtonLink>
                  <Button size="sm" variant="secondary" loading={removing === l.id} onClick={() => void remove(l)} aria-label={`Remove ${l.title} from saved`}>
                    Remove
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
