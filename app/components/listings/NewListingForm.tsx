'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter }        from 'next/navigation';
import { useForm }          from 'react-hook-form';
import { zodResolver }      from '@hookform/resolvers/zod';
import { z }                from 'zod';
import { useAuth }          from '../../lib/auth/auth.context';
import { listingsService }  from '../../lib/api/endpoints';
import type { Category }    from '../../lib/types/listing';
import {
  MapPin, DollarSign, Users, Upload, X, ChevronRight,
  Info, Plus, ImageIcon, Loader2, AlertCircle,
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
  capacity:           z.coerce.number().min(1).max(10000).optional(),
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
  if (data.pricingType !== 'contact' && data.pricingType !== 'package') return !!data.price;
  if (data.pricingType === 'package') return !!data.minPrice && !!data.maxPrice;
  return true;
}, { message: 'Price is required for this pricing type', path: ['price'] });

type FormData = z.infer<typeof schema>;


const PRICING_TYPES = [
  { value: 'per_hour',   label: 'Per Hour'         },
  { value: 'per_day',    label: 'Per Day'           },
  { value: 'per_night',  label: 'Per Night'         },
  { value: 'per_person', label: 'Per Person'        },
  { value: 'package',    label: 'Package'           },
  { value: 'contact',    label: 'Contact for Price' },
];

const COMMON_AMENITIES = [
  'WiFi', 'Parking', 'AC', 'Projector', 'Sound System', 'Catering',
  'Security', 'Generator', 'Pool', 'Gym', 'Bar', 'Kitchen',
];

const MAX_PHOTOS   = 10;
const MAX_SIZE_MB  = 5;
const ACCEPT_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ── Shared styles 
const inp = (err?: boolean) =>
  `w-full px-3 py-2.5 text-sm rounded-xl border bg-white text-gray-900 placeholder-gray-400
   focus:outline-none focus:ring-2 focus:ring-[#2D3B45] focus:border-transparent transition
   ${err ? 'border-red-400' : 'border-gray-200'}`;

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-black text-gray-600 uppercase tracking-wide mb-1.5">
      {children}{required && <span className="text-red-400 normal-case font-normal ml-1">*</span>}
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

// ── Amenities picker 
function AmenitiesPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [custom, setCustom] = useState('');

  const toggle = (item: string) =>
    onChange(value.includes(item) ? value.filter(a => a !== item) : [...value, item]);

  const addCustom = () => {
    const trimmed = custom.trim();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
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
      <div className="flex gap-2">
        <input value={custom} onChange={e => setCustom(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
          placeholder="Add custom amenity..."
          className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white
            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D3B45] transition" />
        <button type="button" onClick={addCustom}
          className="px-3 py-2 bg-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-200 transition">
          <Plus size={13} />
        </button>
      </div>
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

// ── Photo uploader 
interface UploadedPhoto {
  localId:   string;
  url:       string;
  uploading: boolean;
  error?:    string;
}

function PhotoUploader({value, onChange, token,}: {
  value:    string[];
  onChange: (v: string[]) => void;
  token:    string | null;
}) {
  const [photos,   setPhotos]   = useState<UploadedPhoto[]>(
    value.map(url => ({ url, uploading: false, localId: url }))
  );
  const [dragging, setDragging] = useState(false);
  const inputRef               = useRef<HTMLInputElement>(null);
  const remaining              = MAX_PHOTOS - photos.filter(p => !p.error).length;

  useEffect(() => {
    const urls = photos
      .filter(p => p.url && !p.uploading && !p.error)
      .map(p => p.url);
    onChange(urls);
  }, [photos]);


  // ✅ Authorization header added
  const uploadFile = useCallback(async (file: File, localId: string) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload/image', {
        method:  'POST',
        body:    formData,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || `Upload failed (${res.status})`);
      }

      const json = await res.json();
      const url: string = json.data?.url ?? json.url;
      if (!url) throw new Error('No URL returned from upload');

    setPhotos(prev =>
            prev.map(p => p.localId === localId ? { ...p, url, uploading: false } : p)
          );
        } catch (err) {
          const error = err instanceof Error ? err.message : 'Upload failed';
          setPhotos(prev =>
            prev.map(p => p.localId === localId ? { ...p, uploading: false, error } : p)
          );
        }
      }, [token]);
      
  const processFiles = useCallback((files: File[]) => {
    const valid = files.filter(f =>
      ACCEPT_TYPES.includes(f.type) && f.size <= MAX_SIZE_MB * 1024 * 1024
    );
    const slots = Math.min(valid.length, remaining);
    if (!slots) return;

    const newPhotos: UploadedPhoto[] = valid.slice(0, slots).map(f => ({
      url: '', uploading: true,
      localId: `${f.name}-${Date.now()}-${Math.random()}`,
    }));

    setPhotos(prev => [...prev, ...newPhotos]);
    newPhotos.forEach((p, i) => uploadFile(valid[i], p.localId));
  }, [remaining, uploadFile]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  };

  const removePhoto = (localId: string) => {
      setPhotos(prev => prev.filter(p => p.localId !== localId));
    };

  return (
    <div className="space-y-3">
      {remaining > 0 && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true);  }}
          onDragLeave={e => { e.preventDefault(); setDragging(false); }}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
            transition-colors duration-150 select-none
            ${dragging
              ? 'border-[#2D3B45] bg-[#2D3B45]/5'
              : 'border-gray-200 hover:border-[#2D3B45] hover:bg-gray-50'}`}>
          <input ref={inputRef} type="file" accept={ACCEPT_TYPES.join(',')}
            multiple className="sr-only"
            onChange={e => { processFiles(Array.from(e.target.files ?? [])); e.target.value = ''; }} />
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-colors
            ${dragging ? 'bg-[#2D3B45] text-white' : 'bg-gray-100 text-gray-400'}`}>
            <Upload size={20} />
          </div>
          <p className="text-sm font-bold text-gray-700 mb-1">
            {dragging ? 'Drop photos here' : 'Drag & drop photos here'}
          </p>
          <p className="text-xs text-gray-400 mb-3">
            or <span className="text-[#2D3B45] font-bold underline">browse from your device</span>
          </p>
          <p className="text-[11px] text-gray-300">
            JPEG · PNG · WebP · Max {MAX_SIZE_MB}MB · {remaining} slot{remaining !== 1 ? 's' : ''} left
          </p>
        </div>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {photos.map((photo, i) => (
            <div key={photo.localId}
              className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 group">
              {photo.uploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
                  <Loader2 size={18} className="text-[#2D3B45] animate-spin mb-1" />
                  <span className="text-[10px] text-gray-500 font-semibold">Uploading...</span>
                </div>
              )}
              {photo.error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 z-10 p-2">
                  <AlertCircle size={16} className="text-red-400 mb-1" />
                  <span className="text-[9px] text-red-500 font-semibold text-center leading-tight line-clamp-2">
                    {photo.error}
                  </span>
                </div>
              )}
              {photo.url && !photo.uploading && !photo.error && (
                <img src={photo.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              )}
              {!photo.url && !photo.uploading && !photo.error && (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={18} className="text-gray-300" />
                </div>
              )}
              {i === 0 && photo.url && !photo.error && (
                <span className="absolute top-1.5 left-1.5 text-[9px] font-black
                  bg-[#F5C842] text-[#2D3B45] px-1.5 py-0.5 rounded-md z-20">
                  COVER
                </span>
              )}
              <button type="button" onClick={() => removePhoto(photo.localId)}
                className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/60 text-white rounded-full
                  flex items-center justify-center opacity-0 group-hover:opacity-100
                  transition-opacity z-20 hover:bg-red-500">
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-[11px] text-gray-400 flex items-center gap-1">
        <ImageIcon size={11} />
        {photos.filter(p => p.url && !p.error).length} of {MAX_PHOTOS} photos added
        {photos.filter(p => p.url && !p.error).length > 0 && ' · First photo is the cover'}
      </p>
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────
export function NewListingForm({ categories }: { categories: Category[] }) {
  const router        = useRouter();
  const { token }     = useAuth(); // ✅ get token for upload auth
  const saveAsRef = useRef<'draft' | 'active'>('draft');
  const [amenities,   setAmenities] = useState<string[]>([]);
  const [photos,      setPhotos]    = useState<string[]>([]);
  const [saving,      setSaving]    = useState(false);
  // const [saveAs,      setSaveAs]    = useState<'draft' | 'active'>('draft');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      pricingType: 'per_day', currency: 'KES',
      instantBooking: false, minBookingDuration: 1, maxBookingDuration: 30, leadTime: 1,
    },
  });

  const pricingType = watch('pricingType');

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const payload = {
        title: data.title, description: data.description, categoryId: data.categoryId,
        location: { city: data.city, address: data.address, county: data.county, country: 'Kenya' },
        capacity: data.capacity, pricingType: data.pricingType,
        price: data.price, minPrice: data.minPrice, maxPrice: data.maxPrice,
        currency: data.currency, photos, coverPhoto: photos[0], amenities,
        instantBooking: data.instantBooking,
        minBookingDuration: data.minBookingDuration,
        maxBookingDuration: data.maxBookingDuration,
        leadTime: data.leadTime,
      };

      const res = await listingsService.create(payload);
      const id  = res.data?.id ?? (res.data as any)?.data?.id;

     if (saveAsRef.current === 'active' && id) {  // ✅ ref — always current value
      await listingsService.updateStatus(id, 'active').catch(() => {});
    }

      toast.success(saveAsRef.current === 'active' ? 'Listing published!' : 'Listing saved as draft');
      router.push('/vendor/listings');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create listing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">

      {/* Basic Info */}
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
            <select {...register('categoryId')} className={`${inp(!!errors.categoryId)} cursor-pointer`}>
              <option value="">Select a category...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ErrorMsg msg={errors.categoryId?.message} />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <SectionTitle>Location</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label required>City</Label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-3 text-gray-400" />
              <input {...register('city')} placeholder="Nairobi" className={`${inp(!!errors.city)} pl-8`} />
            </div>
            <ErrorMsg msg={errors.city?.message} />
          </div>
          <div>
            <Label>County</Label>
            <input {...register('county')} placeholder="Nairobi County" className={inp()} />
          </div>
          <div className="col-span-2">
            <Label>Address / Area</Label>
            <input {...register('address')} placeholder="Westlands, Parklands, Karen..." className={inp()} />
          </div>
        </div>
      </div>

      {/* Pricing */}
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
                      ${checked ? 'border-[#2D3B45] bg-[#2D3B45]/5 text-[#2D3B45]' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
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

      {/* Capacity & Booking Rules */}
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
            <input type="number" {...register('leadTime')} placeholder="1" className={inp(!!errors.leadTime)} />
            <p className="text-[11px] text-gray-400 mt-1">Advance notice required</p>
          </div>
          <div>
            <Label>Min Booking (days)</Label>
            <input type="number" {...register('minBookingDuration')} placeholder="1" className={inp()} />
          </div>
          <div>
            <Label>Max Booking (days)</Label>
            <input type="number" {...register('maxBookingDuration')} placeholder="30" className={inp()} />
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center gap-3 cursor-pointer">
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

      {/* Amenities */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <SectionTitle>Amenities</SectionTitle>
        <AmenitiesPicker value={amenities} onChange={setAmenities} />
      </div>

      {/* Photos — ✅ token passed for upload auth */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <SectionTitle>Photos</SectionTitle>
        <PhotoUploader value={photos} onChange={setPhotos} token={token} />
      </div>

      {/* Submit */}
      <div className="flex gap-3 pb-8">
        <button
          type="submit"
          disabled={saving}
          onClick={() => { saveAsRef.current = 'draft'; }}
          className="flex-1 py-3 border-2 border-[#2D3B45] text-[#2D3B45] rounded-xl text-sm font-black
            hover:bg-[#2D3B45]/5 transition disabled:opacity-50">
          {saving && saveAsRef.current === 'draft' ? 'Saving...' : 'Save as Draft'}
        </button>
        <button
          type="submit"
          disabled={saving}
          onClick={() => { saveAsRef.current = 'active'; }}
          className="flex-1 py-3 bg-[#2D3B45] text-white rounded-xl text-sm font-black
            hover:bg-[#3a4d5a] transition disabled:opacity-50 flex items-center justify-center gap-2">
          {saving && saveAsRef.current === 'active'
            ? 'Publishing...'
            : <><span>Publish Listing</span><ChevronRight size={15} /></>}
        </button>
      </div>
    </form>
  );
}