'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { listingsService } from '../../../lib/api/endpoints';
import type { Category } from '../../../lib/types/listing';
import { schema } from './schema';
import type { FormData, WizardStep } from './types';
import { STEP_ORDER } from './types';
import { Stepper } from './Stepper';
import { CategoryStep } from './steps/CategoryStep';
import { DetailsStep } from './steps/DetailsStep';
import { PricingStep } from './steps/PricingStep';
import { PreviewStep } from './steps/PreviewStep';

export function NewListingForm({ categories }: { categories: Category[] }) {
  const router = useRouter();


  const [step, setStep]           = useState<WizardStep>('category');
  const [furthest, setFurthest]   = useState<WizardStep>('category');
  const [photos, setPhotos]       = useState<string[]>([]);
  const [saving, setSaving]       = useState(false);
  const saveAsRef = useRef<'draft' | 'active'>('draft');

  const {
    register, watch, setValue, formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { pricingType: 'per_day', currency: 'KES' },
  });

  const categoryId    = watch('categoryId')    ?? '';
  const subCategoryId = watch('subCategoryId') ?? '';
  const pricingType   = watch('pricingType');

  // RHF keeps field values around after their <input> unmounts (shouldUnregister
  // defaults to false) — so switching pricing types doesn't clear whatever was
  // previously typed into price/minPrice/maxPrice. Without this, a stale value
  // (e.g. typed under 'per_day', left behind after switching to 'contact')
  // survives the `data.price ? ... : undefined` truthy check in submit() below
  // whenever the leftover value is a non-empty string like "0", and gets sent
  // as a real price on a listing that's supposed to have none.
  useEffect(() => {
    if (pricingType !== 'package') {
      setValue('minPrice', undefined);
      setValue('maxPrice', undefined);
    }
    if (pricingType === 'package' || pricingType === 'contact') {
      setValue('price', undefined);
    }
  }, [pricingType, setValue]);

  const advance = (next: WizardStep) => {
    setStep(next);
    if (STEP_ORDER.indexOf(next) > STEP_ORDER.indexOf(furthest)) setFurthest(next);
  };

  // ── Per-step validation guards (unchanged logic from the original file) ──
  const goDetails = () => {
    if (!categoryId) { toast.error('Pick a category first'); return; }
    advance('details');
  };

  const goPricing = () => {
    const title  = watch('title')       ?? '';
    const desc   = watch('description') ?? '';
    const county = watch('county')      ?? '';
    const area   = watch('area')        ?? '';

    if (title.length  < 5)  { toast.error('Title needs at least 5 characters'); return; }
    if (desc.length   < 20) { toast.error('Description needs at least 20 characters'); return; }
    if (!county)             { toast.error('Select a county'); return; }
    if (!area)               { toast.error('Select an area'); return; }
    if (photos.length < 1)   { toast.error('Add at least 1 photo'); return; }

    advance('pricing');
  };

  const goPreview = () => {
    const pricingType = watch('pricingType');
    const price = watch('price');
    const minPrice = watch('minPrice');
    const maxPrice = watch('maxPrice');

    if (pricingType === 'package' && (!minPrice || !maxPrice)) {
      toast.error('Enter both min and max price'); return;
    }
    if (pricingType !== 'package' && pricingType !== 'contact' && !price) {
      toast.error('Enter a price'); return;
    }

    advance('preview');
  };

  // ── Jump-back from the stepper — only to steps already validated past ──
  const jumpTo = (target: WizardStep) => setStep(target);

  // ── Submit (draft or publish) ────────────────────────────────────────
  const submit = async (mode: 'draft' | 'active') => {
    if (mode === 'active' && photos.length < 3) {
      toast.error('Add at least 3 photos to publish');
      return;
    }

    saveAsRef.current = mode;
    setSaving(true);

    try {
      const data = watch();
      const lat = data.lat;
      const lng = data.lng;
      const cleanPhotos = photos.filter(p => typeof p === 'string' && p.trim().length > 0);

      // Built explicitly off `pricingType` rather than "is this field
      // truthy" — the useEffect above already clears stale values on
      // change, but this is the layer that actually guarantees a 'contact'
      // or 'package' listing can never carry a leftover price/min/max,
      // regardless of what RHF happens to still be holding onto.
      const isPackage = data.pricingType === 'package';
      const isContact = data.pricingType === 'contact';

      const payload = {
        categoryId: data.subCategoryId || data.categoryId,
        title: data.title,
        description: data.description,
        currency: 'KES',
        location: {
          county: data.county,
          area: data.area,
          country: 'Kenya',
          ...(lat && { latitude: Number(lat) }),
          ...(lng && { longitude: Number(lng) }),
        },
        pricingType: data.pricingType,
        price:    (!isPackage && !isContact && data.price) ? Number(data.price) : undefined,
        minPrice: (isPackage && data.minPrice) ? Number(data.minPrice) : undefined,
        maxPrice: (isPackage && data.maxPrice) ? Number(data.maxPrice) : undefined,
        photos: cleanPhotos,
        coverPhoto: cleanPhotos[0],
      };

      const res = await listingsService.create(payload);
      const id = res.data?.id ?? (res.data as any)?.data?.id;

      if (mode === 'active' && id) {
        await listingsService.updateStatus(id, 'active').catch(() => {});
      }

      toast.success(mode === 'active' ? 'Listing published!' : 'Draft saved');

      // Without this, Next's client-side Router Cache can serve a stale
      // snapshot of /vendor/listings from before this listing existed (or
      // before its status changed to 'active') if that page was visited
      // earlier in this session — the create/publish itself already
      // succeeded on the backend by this point.
      router.refresh();
      router.push('/vendor/listings');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create listing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl">
      <Stepper current={step} furthestReached={furthest} onJump={jumpTo} />

      {/* Hidden registered fields kept for RHF wiring — no visible <form> submit needed
          since Preview owns the two explicit submit actions (draft / publish). */}
      <input type="hidden" {...register('categoryId')} />
      <input type="hidden" {...register('subCategoryId')} />
      <input type="hidden" {...register('county')} />
      <input type="hidden" {...register('area')} />

      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        {step === 'category' && (
          <CategoryStep
            categories={categories}
            categoryId={categoryId}
            subCategoryId={subCategoryId}
            onCategory={id => setValue('categoryId', id, { shouldValidate: true })}
            onSubCategory={id => setValue('subCategoryId', id)}
            onNext={goDetails}
          />
        )}

        {step === 'details' && (
          <DetailsStep
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            photos={photos}
            setPhotos={setPhotos}
            onBack={() => jumpTo('category')}
            onNext={goPricing}
          />
        )}

        {step === 'pricing' && (
          <PricingStep
            register={register}
            errors={errors}
            watch={watch}
            onBack={() => jumpTo('details')}
            onNext={goPreview}
          />
        )}

        {step === 'preview' && (
          <PreviewStep
            categories={categories}
            categoryId={categoryId}
            subCategoryId={subCategoryId}
            title={watch('title') ?? ''}
            description={watch('description') ?? ''}
            county={watch('county') ?? ''}
            area={watch('area') ?? ''}
            pricingType={watch('pricingType')}
            price={watch('price')}
            minPrice={watch('minPrice')}
            maxPrice={watch('maxPrice')}
            photos={photos}
            saving={saving}
            onEdit={jumpTo}
            onBack={() => jumpTo('pricing')}
            onSaveDraft={() => submit('draft')}
            onPublish={() => submit('active')}
          />
        )}
      </div>
    </div>
  );
}