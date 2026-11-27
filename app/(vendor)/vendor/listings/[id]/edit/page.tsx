'use client';

// Edit a listing. Contract: PUT /listings/:id with any of { categoryId, title (5–255),
// description (20–5000), location { county, area }, pricingType, price | minPrice+maxPrice,
// photos (≤20 URLs), coverPhoto }. Prices are display prices only: bookings are never charged.
// Photos are uploaded first (POST /upload/images, uploadType before the files).
// Publishing (elsewhere) needs at least 3 photos.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ImagePlus, Star, X } from 'lucide-react';
import { categoriesService, listingsService, uploadService } from '../../../../../lib/api/endpoints';
import type { ApiError } from '../../../../../lib/api/client';
import { Card, Notice, PageHeader, Skeleton } from '../../../../../components/ui/Surface';
import { Button, ButtonLink } from '../../../../../components/ui/Button';

type PricingType = 'per_hour' | 'per_day' | 'per_person' | 'package' | 'contact';
interface RawListing {
  id: string; title: string; description: string; categoryId: string; status: string;
  location: { county?: string; area?: string } | null;
  pricingType: PricingType; price: string | null; minPrice: string | null; maxPrice: string | null;
  photos: string[] | null; coverPhoto: string | null;
}
interface CategoryOption { id: string; name: string; parentId?: string | null }
interface CategoryNode extends CategoryOption { children?: CategoryNode[] }
const flatten = (nodes: CategoryNode[]): CategoryOption[] => nodes.flatMap((n) => [n, ...flatten(n.children ?? [])]);

const PRICING: { value: PricingType; label: string }[] = [
  { value: 'per_day', label: 'Per day' }, { value: 'per_hour', label: 'Per hour' }, { value: 'per_person', label: 'Per person' },
  { value: 'package', label: 'Package (price range)' }, { value: 'contact', label: 'Price on request' },
];
const MAX_PHOTOS = 20;
const MIN_PUBLISH_PHOTOS = 3;
const input = 'w-full h-11 rounded-[10px] border px-3.5 text-[15px] bg-card outline-none focus:ring-2 focus:ring-ink/15';
const ok = 'border-border-strong focus:border-ink';
const bad = 'border-error';

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [original, setOriginal] = useState<RawListing | null>(null);
  const [loadError, setLoadError] = useState<ApiError | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [county, setCounty] = useState('');
  const [area, setArea] = useState('');
  const [pricingType, setPricingType] = useState<PricingType>('per_day');
  const [price, setPrice] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [cover, setCover] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoadError(null);
    try {
      const [l, c] = await Promise.all([listingsService.getById(id), categoriesService.getTree().catch(() => ({ data: [] }))]);
      const d = l.data as unknown as RawListing;
      setOriginal(d);
      setTitle(d.title); setDescription(d.description ?? ''); setCategoryId(d.categoryId);
      setCounty(d.location?.county ?? ''); setArea(d.location?.area ?? '');
      setPricingType(d.pricingType); setPrice(d.price ? String(Number(d.price)) : '');
      setMinPrice(d.minPrice ? String(Number(d.minPrice)) : ''); setMaxPrice(d.maxPrice ? String(Number(d.maxPrice)) : '');
      setPhotos(d.photos ?? []); setCover(d.coverPhoto ?? d.photos?.[0] ?? null);
      setCategories(Array.isArray(c.data) ? flatten(c.data as unknown as CategoryNode[]) : []);
    } catch (err) {
      setLoadError(err as ApiError);
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [id]);

  const sortedCategories = useMemo(() => {
    const byId = new Map(categories.map((c) => [c.id, c]));
    return categories.map((c) => ({ id: c.id, label: c.parentId && byId.get(c.parentId) ? `${byId.get(c.parentId)!.name} › ${c.name}` : c.name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [categories]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (title.trim().length < 5) e.title = 'At least 5 characters.';
    if (description.trim().length < 20) e.description = 'At least 20 characters, so customers know what they’re booking.';
    if (county.trim().length < 2) e.county = 'Enter the county.';
    if (area.trim().length < 2) e.area = 'Enter the area or town.';
    const pos = (v: string) => Number(v) > 0 && Number(v) <= 100_000_000;
    if (pricingType === 'package') {
      if (!pos(minPrice)) e.minPrice = 'Enter the lowest price.';
      if (!pos(maxPrice)) e.maxPrice = 'Enter the highest price.';
      if (pos(minPrice) && pos(maxPrice) && Number(minPrice) > Number(maxPrice)) e.maxPrice = 'Must be at least the lowest price.';
    } else if (pricingType !== 'contact' && !pos(price)) e.price = 'Enter a price, or choose “Price on request”.';
    return e;
  };

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = MAX_PHOTOS - photos.length;
    const chosen = Array.from(files).slice(0, Math.max(0, room));
    if (!chosen.length) { toast.error(`A listing can have up to ${MAX_PHOTOS} photos.`); return; }
    setUploading(true);
    try {
      const res = await uploadService.uploadImages(chosen, 'listing_photo');
      const urls = (Array.isArray(res.data) ? res.data : []).map((u) => u.url).filter(Boolean);
      setPhotos((p) => [...p, ...urls]);
      setCover((c) => c ?? urls[0] ?? null);
    } catch (err) {
      toast.error((err as ApiError).message || 'Upload failed. Use JPEG, PNG or WebP under 5 MB.');
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const removePhoto = (url: string) => {
    setPhotos((p) => p.filter((x) => x !== url));
    if (cover === url) setCover(photos.find((x) => x !== url) ?? null);
  };

  const save = async () => {
    if (!original || saving) return;
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) { setSaveError('Check the highlighted fields.'); return; }
    setSaving(true);
    setSaveError(null);
    const payload: Record<string, unknown> = {
      title: title.trim(), description: description.trim(),
      location: { county: county.trim(), area: area.trim() },
      pricingType, photos,
      ...(categoryId && categoryId !== original.categoryId ? { categoryId } : {}),
      ...(cover ? { coverPhoto: cover } : {}),
      ...(pricingType === 'package' ? { minPrice: Number(minPrice), maxPrice: Number(maxPrice) } : pricingType === 'contact' ? {} : { price: Number(price) }),
    };
    try {
      await listingsService.update(id, payload);
      toast.success('Listing saved');
      router.push(`/vendor/listings/${id}`);
    } catch (err) {
      const ae = err as ApiError;
      if (Array.isArray(ae.details)) {
        const map: Record<string, string> = {};
        for (const d of ae.details) map[d.path.replace(/^\//, '').split('/').pop() ?? ''] = d.message;
        setErrors(map);
      }
      setSaveError(ae.code === 'VENDOR_SUSPENDED' ? 'Your vendor account is suspended, so listings can’t be changed.'
        : ae.status === 404 ? 'This listing no longer exists.' : ae.message || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loadError) {
    const missing = loadError.status === 404 || loadError.status === 400 || loadError.status === 422;
    return (
      <div className="max-w-[760px] mx-auto">
        <PageHeader title={missing ? 'Listing not found' : 'Could not load this listing'} back={{ href: '/vendor/listings', label: 'Listings' }} />
        {!missing && <Button variant="secondary" onClick={() => void load()}>Retry</Button>}
      </div>
    );
  }
  if (!original) {
    return (
      <div className="max-w-[760px] mx-auto" aria-busy="true">
        <Skeleton className="h-4 w-28 mb-4" /><Skeleton className="h-8 w-56 mb-6" />
        <Skeleton className="h-72 w-full rounded-2xl mb-4" /><Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  const field = (key: string) => (errors[key] ? bad : ok);
  const err = (key: string) => errors[key] && <p className="mt-1.5 text-[13px] text-error">{errors[key]}</p>;

  return (
    <div className="max-w-[760px] mx-auto">
      <PageHeader title="Edit listing" back={{ href: `/vendor/listings/${id}`, label: original.title }} />

      <form className="space-y-5" noValidate onSubmit={(e) => { e.preventDefault(); void save(); }}>
        <Card title="Details">
          <div className="space-y-4">
            <label className="block"><span className="block text-[13px] font-semibold mb-1.5">Title</span>
              <input className={`${input} ${field('title')}`} value={title} maxLength={255} onChange={(e) => setTitle(e.target.value)} />{err('title')}</label>
            <label className="block"><span className="block text-[13px] font-semibold mb-1.5">Description</span>
              <textarea className={`w-full rounded-[10px] border px-3.5 py-2.5 text-[15px] leading-relaxed bg-card outline-none focus:ring-2 focus:ring-ink/15 ${field('description')}`}
                rows={6} maxLength={5000} value={description} onChange={(e) => setDescription(e.target.value)} />
              <span className="mt-1 block text-[12px] text-text-muted tabular">{description.trim().length}/5000</span>{err('description')}</label>
            {sortedCategories.length > 0 && (
              <label className="block"><span className="block text-[13px] font-semibold mb-1.5">Category</span>
                <select className={`${input} ${ok}`} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  {sortedCategories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select></label>
            )}
          </div>
        </Card>

        <Card title="Location">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className="block text-[13px] font-semibold mb-1.5">County</span>
              <input className={`${input} ${field('county')}`} value={county} maxLength={100} onChange={(e) => setCounty(e.target.value)} />{err('county')}</label>
            <label className="block"><span className="block text-[13px] font-semibold mb-1.5">Area or town</span>
              <input className={`${input} ${field('area')}`} value={area} maxLength={200} onChange={(e) => setArea(e.target.value)} />{err('area')}</label>
          </div>
        </Card>

        <Card title="Price shown to customers" description="For information only. Customers pay you directly; LinkMart never charges for bookings.">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2"><span className="block text-[13px] font-semibold mb-1.5">Pricing</span>
              <select className={`${input} ${ok}`} value={pricingType} onChange={(e) => setPricingType(e.target.value as PricingType)}>
                {PRICING.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select></label>
            {pricingType === 'package' ? (
              <>
                <label className="block"><span className="block text-[13px] font-semibold mb-1.5">From (KES)</span>
                  <input inputMode="decimal" className={`${input} tabular ${field('minPrice')}`} value={minPrice} onChange={(e) => setMinPrice(e.target.value.replace(/[^\d.]/g, ''))} />{err('minPrice')}</label>
                <label className="block"><span className="block text-[13px] font-semibold mb-1.5">To (KES)</span>
                  <input inputMode="decimal" className={`${input} tabular ${field('maxPrice')}`} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value.replace(/[^\d.]/g, ''))} />{err('maxPrice')}</label>
              </>
            ) : pricingType !== 'contact' && (
              <label className="block"><span className="block text-[13px] font-semibold mb-1.5">Price (KES)</span>
                <input inputMode="decimal" className={`${input} tabular ${field('price')}`} value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ''))} />{err('price')}</label>
            )}
          </div>
        </Card>

        <Card title="Photos" description={`Up to ${MAX_PHOTOS}. The cover photo is shown first. Published listings need at least ${MIN_PUBLISH_PHOTOS}.`}>
          {photos.length < MIN_PUBLISH_PHOTOS && (
            <div className="mb-4"><Notice tone="warning" title={`Add ${MIN_PUBLISH_PHOTOS - photos.length} more photo${MIN_PUBLISH_PHOTOS - photos.length === 1 ? '' : 's'} to publish this listing.`} /></div>
          )}
          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {photos.map((url) => (
              <li key={url} className={`relative aspect-[4/3] rounded-xl overflow-hidden bg-surface-muted border-2 ${cover === url ? 'border-ink' : 'border-transparent'}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removePhoto(url)} aria-label="Remove photo"
                  className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80">
                  <X size={14} aria-hidden />
                </button>
                {cover === url ? (
                  <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full bg-ink text-white text-[11px] font-semibold">Cover</span>
                ) : (
                  <button type="button" onClick={() => setCover(url)}
                    className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full bg-white/90 text-text-primary text-[11px] font-semibold flex items-center gap-1 hover:bg-white">
                    <Star size={11} aria-hidden /> Make cover
                  </button>
                )}
              </li>
            ))}
            {photos.length < MAX_PHOTOS && (
              <li>
                <button type="button" onClick={() => fileInput.current?.click()} disabled={uploading}
                  className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-border-strong text-text-secondary flex flex-col items-center justify-center gap-1.5 hover:border-ink hover:text-text-primary disabled:opacity-60">
                  <ImagePlus size={20} aria-hidden />
                  <span className="text-[13px] font-semibold">{uploading ? 'Uploading…' : 'Add photos'}</span>
                </button>
                <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => void addPhotos(e.target.files)} />
              </li>
            )}
          </ul>
        </Card>

        {saveError && <Notice tone="error" title={saveError} />}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pb-4">
          <ButtonLink href={`/vendor/listings/${id}`} variant="secondary" size="lg">Cancel</ButtonLink>
          <Button type="submit" size="lg" loading={saving} loadingText="Saving…" disabled={uploading}>Save changes</Button>
        </div>
      </form>
    </div>
  );
}
