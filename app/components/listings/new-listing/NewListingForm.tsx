'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAuth } from '../../../lib/auth/auth.context';
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
  const { token } = useAuth();

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
        price: data.price ? Number(data.price) : undefined,
        minPrice: data.minPrice ? Number(data.minPrice) : undefined,
        maxPrice: data.maxPrice ? Number(data.maxPrice) : undefined,
        photos: cleanPhotos,
        coverPhoto: cleanPhotos[0],
      };

      const res = await listingsService.create(payload);
      const id = res.data?.id ?? (res.data as any)?.data?.id;

      if (mode === 'active' && id) {
        await listingsService.updateStatus(id, 'active').catch(() => {});
      }

      toast.success(mode === 'active' ? 'Listing published!' : 'Draft saved');
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
            token={token}
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