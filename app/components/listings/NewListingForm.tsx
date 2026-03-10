// components/vendor/listings/NewListingForm.tsx
// ✅ Client Component — all form interaction here, no data fetching

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { listingsService } from '../../lib/api/endpoints';
import type { Category } from '../../lib/types/listing';
import {
  MapPin, DollarSign, Users, Image, Tag, AlignLeft,
  Plus, X, ChevronRight, Info,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  title:              z.string().min(5,  'At least 5 characters').max(100),
  description:        z.string().min(20, 'At least 20 characters').max(2000),
  categoryId:         z.string().min(1,  'Select a category'),
  city:               z.string().min(2,  'Required'),
  address:            z.string().optional(),
  county:             z.string().optional(),
  capacity:           z.coerce.number().min(1, 'At least 1').max(10000).optional(),
  pricingType:        z.enum(['per_hour', 'per_day', 'per_night', 'per_person', 'package', 'contact']),
  price:              z.coerce.number().positive('Must be positive').optional(),
  minPrice:           z.coerce.number().positive().optional(),
  maxPrice:           z.coerce.number().positive().optional(),
  currency:           z.string().default('KES'),
  instantBooking:     z.boolean().default(false),
  minBookingDuration: z.coerce.number().min(1).default(1),
  maxBookingDuration: z.coerce.number().min(1).default(30),
  leadTime:           z.coerce.number().min(0).default(1),
}).refine(data => {
  if (data.pricingType !== 'contact' && data.pricingType !== 'package') {
    return !!data.price;
  }
  if (data.pricingType === 'package') {
    return !!data.minPrice && !!data.maxPrice;
  }
  return true;
}, { message: 'Price is required for this pricing type', path: ['price'] });

type FormData = z.infer<typeof schema>;

const PRICING_TYPES = [
  { value: 'per_hour',   label: 'Per Hour'   },
  { value: 'per_day',    label: 'Per Day'    },
  { value: 'per_night',  label: 'Per Night'  },
  { value: 'per_person', label: 'Per Person' },
  { value: 'package',    label: 'Package'    },
  { value: 'contact',    label: 'Contact for Price' },
];

// ── Shared input style ────────────────────────────────────────────────────────
const inp = (err?: boolean) =>
  `w-full px-3 py-2.5 text-sm rounded-xl border bg-white text-gray-900 placeholder-gray-400
   focus:outline-none focus:ring-2 focus:ring-[#2D3B45] focus:border-transparent transition
   ${err ? 'border-red-400' : 'border-gray-200'}`;

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-black text-gray-600 uppercase tracking-wide mb-1.5">
      {children} {required && <span className="text-red-400 normal-case font-normal">*</span>}
    </label>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4 pt-2">
      <h2 className="text-sm font-black text-gray-800">{children}</h2>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

function ErrorMsg({ msg }: { msg?: string }) {
  return msg ? <p className="text-red-500 text-[11px] mt-1">{msg}</p> : null;
}

// ── Amenity chips ─────────────────────────────────────────────────────────────
const COMMON_AMENITIES = [
  'WiFi', 'Parking', 'AC', 'Projector', 'Sound System', 'Catering',
  'Security', 'Generator', 'Pool', 'Gym', 'Bar', 'Kitchen',
];

interface AmenitiesPickerProps {
  value:    string[];
  onChange: (v: string[]) => void;
}

function AmenitiesPicker({ value, onChange }: AmenitiesPickerProps) {
  const [custom, setCustom] = useState('');

  const toggle = (item: string) => {
    onChange(value.includes(item) ? value.filter(a => a !== item) : [...value, item]);
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setCustom('');
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {COMMON_AMENITIES.map(a => (
          <button key={a} type="button" onClick={() => toggle(a)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors
              ${value.includes(a)
                ? 'bg-[#2D3B45] text-white border-[#2D3B45]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#2D3B45]'}`}>
            {a}
          </button>
        ))}
      </div>
      {/* Custom amenity */}
      <div className="flex gap-2">
        <input
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
          placeholder="Add custom amenity..."
          className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white
            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D3B45] transition"
        />
        <button type="button" onClick={addCustom}
          className="px-3 py-2 bg-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-200 transition">
          <Plus size={13} />
        </button>
      </div>
      {/* Selected custom chips */}
      {value.filter(a => !COMMON_AMENITIES.includes(a)).length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.filter(a => !COMMON_AMENITIES.includes(a)).map(a => (
            <span key={a} className="flex items-center gap-1 px-3 py-1.5 bg-[#2D3B45] text-white rounded-lg text-xs font-bold">
              {a}
              <button type="button" onClick={() => toggle(a)} className="hover:text-red-300 transition">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Photo URLs input ───────────────────────────────────────────────────────────
interface PhotoInputProps {
  value:    string[];
  onChange: (v: string[]) => void;
}

function PhotoInput({ value, onChange }: PhotoInputProps) {
  const [url, setUrl] = useState('');

  const add = () => {
    const trimmed = url.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setUrl('');
  };

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Paste image URL..."
          className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white
            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D3B45] transition"
        />
        <button type="button" onClick={add}
          className="px-4 py-2.5 bg-[#2D3B45] text-white rounded-xl text-xs font-bold hover:bg-[#3a4d5a] transition">
          Add
        </button>
      </div>
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {value.map((src, i) => (
            <div key={src} className="relative group aspect-video rounded-xl overflow-hidden bg-gray-100">
              <img src={src} alt="" className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 text-[9px] font-black bg-[#F5C842] text-[#2D3B45] px-1.5 py-0.5 rounded-md">
                  COVER
                </span>
              )}
              <button
                type="button"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white rounded-full
                  flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
        <Info size={11} /> First image becomes the cover photo
      </p>
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────
interface Props {
  categories: Category[];
}

export function NewListingForm({ categories }: Props) {
  const router = useRouter();
  const [amenities, setAmenities] = useState<string[]>([]);
  const [photos,    setPhotos]    = useState<string[]>([]);
  const [saving,    setSaving]    = useState(false);
  const [saveAs,    setSaveAs]    = useState<'draft' | 'active'>('draft');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      pricingType:        'per_day',
      currency:           'KES',
      instantBooking:     false,
      minBookingDuration: 1,
      maxBookingDuration: 30,
      leadTime:           1,
    },
  });

  const pricingType = watch('pricingType');

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const payload = {
        title:              data.title,
        description:        data.description,
        categoryId:         data.categoryId,
        location: {
          city:    data.city,
          address: data.address,
          county:  data.county,
          country: 'Kenya',
        },
        capacity:           data.capacity,
        pricingType:        data.pricingType,
        price:              data.price,
        minPrice:           data.minPrice,
        maxPrice:           data.maxPrice,
        currency:           data.currency,
        photos,
        coverPhoto:         photos[0],
        amenities,
        instantBooking:     data.instantBooking,
        minBookingDuration: data.minBookingDuration,
        maxBookingDuration: data.maxBookingDuration,
        leadTime:           data.leadTime,
      };

      const res = await listingsService.create(payload);
      const id  = res.data?.id ?? res.data?.id;

      // If vendor chose to publish immediately, update status
      if (saveAs === 'active' && id) {
        try {
          await listingsService.updateStatus(id, 'active');
        } catch {
          // non-fatal — listing created as draft, vendor can publish later
        }
      }

      toast.success(saveAs === 'active' ? 'Listing published!' : 'Listing saved as draft');
      router.push('/vendor/listings');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create listing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">

      {/* ── Basic Info ─────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <SectionTitle>Basic Information</SectionTitle>

        <div className="space-y-4">
          <div>
            <Label required>Listing Title</Label>
            <input {...register('title')} placeholder="e.g. Elegant Garden Venue - Nairobi"
              className={inp(!!errors.title)} />
            <ErrorMsg msg={errors.title?.message} />
          </div>

          <div>
            <Label required>Description</Label>
            <textarea {...register('description')} rows={4}
              placeholder="Describe your venue or service. What makes it special? What's included?"
              className={`${inp(!!errors.description)} resize-none`} />
            <ErrorMsg msg={errors.description?.message} />
          </div>

          <div>
            <Label required>Category</Label>
            <select {...register('categoryId')}
              className={`${inp(!!errors.categoryId)} cursor-pointer`}>
              <option value="">Select a category...</option>
              {categories.map((c: Category) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ErrorMsg msg={errors.categoryId?.message} />
          </div>
        </div>
      </div>

      {/* ── Location ───────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <SectionTitle>Location</SectionTitle>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label required>City</Label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-3 text-gray-400" />
              <input {...register('city')} placeholder="Nairobi"
                className={`${inp(!!errors.city)} pl-8`} />
            </div>
            <ErrorMsg msg={errors.city?.message} />
          </div>

          <div>
            <Label>County</Label>
            <input {...register('county')} placeholder="Nairobi County"
              className={inp()} />
          </div>

          <div className="col-span-2">
            <Label>Address / Area</Label>
            <input {...register('address')} placeholder="Westlands, Parklands, Karen..."
              className={inp()} />
          </div>
        </div>
      </div>

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <SectionTitle>Pricing</SectionTitle>

        <div className="space-y-4">
          <div>
            <Label required>Pricing Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {PRICING_TYPES.map(({ value, label }) => {
                const checked = pricingType === value;
                return (
                  <label key={value}
                    className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer text-xs font-bold transition-colors
                      ${checked
                        ? 'border-[#2D3B45] bg-[#2D3B45]/5 text-[#2D3B45]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                    <input type="radio" value={value} {...register('pricingType')} className="sr-only" />
                    <span className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center
                      ${checked ? 'border-[#2D3B45]' : 'border-gray-300'}`}>
                      {checked && <span className="w-1.5 h-1.5 rounded-full bg-[#2D3B45]" />}
                    </span>
                    {label}
                  </label>
                );
              })}
            </div>
            <ErrorMsg msg={errors.pricingType?.message} />
          </div>

          {/* Price fields — conditional on pricing type */}
          {pricingType === 'package' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>Min Price (KSh)</Label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-3 text-gray-400" />
                  <input type="number" {...register('minPrice')} placeholder="50,000"
                    className={`${inp(!!errors.minPrice)} pl-8`} />
                </div>
                <ErrorMsg msg={errors.minPrice?.message} />
              </div>
              <div>
                <Label required>Max Price (KSh)</Label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-3 text-gray-400" />
                  <input type="number" {...register('maxPrice')} placeholder="200,000"
                    className={`${inp(!!errors.maxPrice)} pl-8`} />
                </div>
                <ErrorMsg msg={errors.maxPrice?.message} />
              </div>
            </div>
          ) : pricingType !== 'contact' ? (
            <div>
              <Label required>Price (KSh)</Label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-3 text-gray-400" />
                <input type="number" {...register('price')} placeholder="e.g. 15000"
                  className={`${inp(!!errors.price)} pl-8`} />
              </div>
              <ErrorMsg msg={errors.price?.message} />
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
              <Info size={14} className="text-blue-500 shrink-0" />
              <p className="text-xs text-blue-700">Customers will contact you directly for pricing.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Capacity & Booking Rules ────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <SectionTitle>Capacity & Booking Rules</SectionTitle>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Max Capacity</Label>
            <div className="relative">
              <Users size={14} className="absolute left-3 top-3 text-gray-400" />
              <input type="number" {...register('capacity')} placeholder="e.g. 200"
                className={`${inp(!!errors.capacity)} pl-8`} />
            </div>
            <ErrorMsg msg={errors.capacity?.message} />
          </div>

          <div>
            <Label>Lead Time (days)</Label>
            <input type="number" {...register('leadTime')} placeholder="1"
              className={inp(!!errors.leadTime)} />
            <p className="text-[11px] text-gray-400 mt-1">Advance notice required</p>
          </div>

          <div>
            <Label>Min Booking (days)</Label>
            <input type="number" {...register('minBookingDuration')} placeholder="1"
              className={inp()} />
          </div>

          <div>
            <Label>Max Booking (days)</Label>
            <input type="number" {...register('maxBookingDuration')} placeholder="30"
              className={inp()} />
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input type="checkbox" {...register('instantBooking')} className="sr-only peer" />
              <div className="w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-[#2D3B45] transition-colors" />
              <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Instant Booking</p>
              <p className="text-[11px] text-gray-400">Customers can book without waiting for approval</p>
            </div>
          </label>
        </div>
      </div>

      {/* ── Amenities ──────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <SectionTitle>Amenities</SectionTitle>
        <AmenitiesPicker value={amenities} onChange={setAmenities} />
      </div>

      {/* ── Photos ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <SectionTitle>Photos</SectionTitle>
        <PhotoInput value={photos} onChange={setPhotos} />
      </div>

      {/* ── Submit ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-3 pb-8">
        <button
          type="submit"
          disabled={saving}
          onClick={() => setSaveAs('draft')}
          className="flex-1 py-3 border-2 border-[#2D3B45] text-[#2D3B45] rounded-xl text-sm font-black
            hover:bg-[#2D3B45]/5 transition disabled:opacity-50">
          {saving && saveAs === 'draft' ? 'Saving...' : 'Save as Draft'}
        </button>
        <button
          type="submit"
          disabled={saving}
          onClick={() => setSaveAs('active')}
          className="flex-1 py-3 bg-[#2D3B45] text-white rounded-xl text-sm font-black
            hover:bg-[#3a4d5a] transition disabled:opacity-50 flex items-center justify-center gap-2">
          {saving && saveAs === 'active'
            ? 'Publishing...'
            : <><span>Publish Listing</span><ChevronRight size={15} /></>}
        </button>
      </div>
    </form>
  );
}