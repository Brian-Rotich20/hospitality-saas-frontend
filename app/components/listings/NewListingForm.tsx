// NewListingForm.tsx  — category-aware 3-step form
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
  Info, Plus, ImageIcon, Loader2, AlertCircle, Check,
  ArrowLeft, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

const MAX_PHOTOS   = 10;
const MAX_SIZE_MB  = 5;
const ACCEPT_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ── Schema (unchanged from your original) ─────────────────────────────────────
const schema = z.object({
  title:              z.string().min(5, 'At least 5 characters').max(100),
  description:        z.string().min(20, 'At least 20 characters').max(2000),
  categoryId:         z.string().min(1, 'Select a category'),
  city:               z.string().min(2, 'Required'),
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
}, { message: 'Price is required', path: ['price'] });

type FormData = z.infer<typeof schema>;

// ── Category config map ────────────────────────────────────────────────────────
  // ── Category-aware config ─────────────────────────────────────────────────────
  // Slug keys match what comes from your DB categories.slug
  const CATEGORY_CONFIG: Record<string, {
    pricingTypes:      string[];
    defaultPricing:    FormData['pricingType'];
    amenityPresets:    string[];
    showCapacity:      boolean;
    capacityLabel:     string;
    titlePlaceholder:  string;
    descPlaceholder:   string;
    durationUnit:      'hours' | 'days';
    priceLabel:        string;
  }> = {
    venue: {
      pricingTypes:     ['per_day', 'per_night', 'package', 'contact'],
      defaultPricing:   'per_day',
      amenityPresets:   ['WiFi', 'Parking', 'AC', 'Projector', 'Sound System', 'Catering', 'Security', 'Generator', 'Bar', 'Kitchen', 'Tables & Chairs', 'Restrooms'],
      showCapacity:     true,
      capacityLabel:    'Max guests',
      titlePlaceholder: 'e.g. Elegant Garden Venue with Pool – Karen, Nairobi',
      descPlaceholder:  'What makes this venue special? Describe the ambiance, layout, what\'s included, and what events it\'s perfect for.',
      durationUnit:     'days',
      priceLabel:       'Price per day (KSh)',
    },
    photography: {
      pricingTypes:     ['per_hour', 'per_day', 'package', 'contact'],
      defaultPricing:   'per_hour',
      amenityPresets:   ['Studio Lighting', 'Backdrop Options', 'Props', 'Changing Room', 'Editing Included', 'Raw Files', 'Same-day Preview', 'Outdoor Locations'],
      showCapacity:     false,
      capacityLabel:    '',
      titlePlaceholder: 'e.g. Professional Wedding & Event Photography – Nairobi',
      descPlaceholder:  'Describe your photography style, experience, what packages include, turnaround time, and equipment.',
      durationUnit:     'hours',
      priceLabel:       'Price per hour (KSh)',
    },
    catering: {
      pricingTypes:     ['per_person', 'package', 'contact'],
      defaultPricing:   'per_person',
      amenityPresets:   ['Halal', 'Vegetarian', 'Vegan', 'Gluten-free', 'Buffet Setup', 'Waitstaff', 'Cutlery & Crockery', 'Desserts', 'Bar Service'],
      showCapacity:     true,
      capacityLabel:    'Max guests served',
      titlePlaceholder: 'e.g. Full-service Catering for Events up to 500 – Nairobi',
      descPlaceholder:  'Describe your cuisine style, what\'s included (setup, service, cleanup), dietary options, and minimum order.',
      durationUnit:     'days',
      priceLabel:       'Price per person (KSh)',
    },
    entertainment: {
      pricingTypes:     ['per_hour', 'per_day', 'package', 'contact'],
      defaultPricing:   'per_hour',
      amenityPresets:   ['Sound System', 'Lighting Rig', 'MC Services', 'Live Band', 'DJ Equipment', 'Microphones', 'Stage', 'Smoke Machine'],
      showCapacity:     false,
      capacityLabel:    '',
      titlePlaceholder: 'e.g. Professional DJ + Sound System – Weddings & Corporate Events',
      descPlaceholder:  'Describe your act, what\'s included, genre specialties, setup time needed, and past events.',
      durationUnit:     'hours',
      priceLabel:       'Price per hour (KSh)',
    },
    decoration: {
      pricingTypes:     ['package', 'per_day', 'contact'],
      defaultPricing:   'package',
      amenityPresets:   ['Floral Arrangements', 'Balloon Décor', 'Lighting', 'Table Centerpieces', 'Backdrops', 'Setup & Teardown', 'Theme Packages', 'Candles'],
      showCapacity:     false,
      capacityLabel:    '',
      titlePlaceholder: 'e.g. Premium Wedding & Event Decoration – Nairobi & Environs',
      descPlaceholder:  'Describe your decoration style, themes you specialise in, what\'s included in packages, and portfolio highlights.',
      durationUnit:     'days',
      priceLabel:       'Package price from (KSh)',
    },
  };

  // Fallback for categories without a specific config
  const DEFAULT_CONFIG = {
    pricingTypes:     ['per_hour', 'per_day', 'per_person', 'package', 'contact'],
    defaultPricing:   'per_day' as FormData['pricingType'],
    amenityPresets:   ['WiFi', 'Parking', 'AC', 'Security', 'Generator'],
    showCapacity:     true,
    capacityLabel:    'Max capacity',
    titlePlaceholder: 'Give your listing a clear, descriptive title',
    descPlaceholder:  'Describe what you offer, what\'s included, and what makes you the right choice.',
    durationUnit:     'days' as 'hours' | 'days',
    priceLabel:       'Price (KSh)',
  };

  function getCategoryConfig(categories: Category[], categoryId: string) {
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return DEFAULT_CONFIG;
    // Try exact slug match, then partial match
    return CATEGORY_CONFIG[cat.slug] 
      ?? Object.entries(CATEGORY_CONFIG).find(([k]) => cat.slug.includes(k))?.[1]
      ?? DEFAULT_CONFIG;
  }
// ── Shared UI atoms ───────────────────────────────────────────────────────────
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
function ErrorMsg({ msg }: { msg?: string }) {
  return msg ? <p className="text-red-500 text-[11px] mt-1">{msg}</p> : null;
}

// ── Step indicator ─────────────────────────────────────────────────────────────
function StepBar({ step }: { step: number }) {
  const steps = ['Category', 'Essentials', 'Pricing & Details'];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const num      = i + 1;
        const done     = step > num;
        const active   = step === num;
        return (
          <div key={num} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black
                transition-all
                ${done   ? 'bg-[#2D3B45] text-white'
                : active ? 'bg-[#F5C842] text-[#2D3B45]'
                :          'bg-gray-100 text-gray-400'}`}>
                {done ? <Check size={13} /> : num}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wide whitespace-nowrap
                ${active ? 'text-[#2D3B45]' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-3 mb-4 transition-colors
                ${step > num ? 'bg-[#2D3B45]' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1: Category picker ────────────────────────────────────────────────────
function CategoryStep({
  categories, value, onChange, onNext,
}: {
  categories: Category[];
  value:      string;
  onChange:   (id: string) => void;
  onNext:     () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-gray-900 mb-1">What are you listing?</h2>
        <p className="text-sm text-gray-500">
          Choose the category that best describes your service or venue.
          This helps us show the right fields for your listing.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map(cat => {
          const selected = value === cat.id;
          const config   = getCategoryConfig(categories, cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange(cat.id)}
              className={`relative flex flex-col items-start gap-2 p-4 rounded-2xl border-2
                text-left transition-all
                ${selected
                  ? 'border-[#2D3B45] bg-[#2D3B45]/5'
                  : 'border-gray-100 hover:border-gray-300 bg-white'}`}
            >
              {selected && (
                <span className="absolute top-2.5 right-2.5 w-5 h-5 bg-[#2D3B45] rounded-full
                  flex items-center justify-center">
                  <Check size={11} className="text-white" />
                </span>
              )}
              <span className={`text-sm font-black ${selected ? 'text-[#2D3B45]' : 'text-gray-800'}`}>
                {cat.name}
              </span>
              <span className="text-[10px] text-gray-400 font-medium leading-tight">
                {config.defaultPricing.replace('_', ' ')} · {config.showCapacity ? 'capacity' : 'no capacity'}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!value}
        className="w-full py-3 bg-[#2D3B45] text-white rounded-xl text-sm font-black
          hover:bg-[#3a4d5a] transition disabled:opacity-40 flex items-center justify-center gap-2"
      >
        Continue <ChevronRight size={15} />
      </button>
    </div>
  );
}

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
    <div>
      <div
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDragOver={e => e.preventDefault()}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition
          ${dragging ? 'border-[#2D3B45] bg-[#2D3B45]/5' : 'border-gray-200 hover:border-gray-300'}`}
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={24} className="mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 font-medium">Drag photos here or click to upload</p>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP up to 5MB each</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT_TYPES.join(',')}
          onChange={e => processFiles(Array.from(e.currentTarget.files || []))}
          className="hidden"
        />
      </div>
      <div className="grid grid-cols-3 gap-3 mt-4">
        {photos.map(p => (
          <div key={p.localId} className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
            {p.uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Loader2 size={20} className="text-white animate-spin" />
              </div>
            )}
            {p.error && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                <AlertCircle size={20} className="text-red-500" />
              </div>
            )}
            {!p.error && p.url && (
              <img src={p.url} alt="upload" className="w-full h-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => removePhoto(p.localId)}
              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      {remaining > 0 && (
        <p className="text-xs text-gray-500 mt-2">
          {remaining} slot{remaining !== 1 ? 's' : ''} remaining
        </p>
      )}
    </div>
  );
}

// ── Step 2: Essentials ─────────────────────────────────────────────────────────
function EssentialsStep({
  register, errors, config, photos, setPhotos, token, onBack, onNext,
}: {
  register:  any;
  errors:    any;
  config:    ReturnType<typeof getCategoryConfig>;
  photos:    string[];
  setPhotos: (v: string[]) => void;
  token:     string | null;
  onBack:    () => void;
  onNext:    () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-gray-900 mb-1">Tell us about your listing</h2>
        <p className="text-sm text-gray-500">
          Good photos and a clear description get you 3× more enquiries.
        </p>
      </div>

      {/* Title */}
      <div>
        <Label required>Listing title</Label>
        <input {...register('title')} placeholder={config.titlePlaceholder} className={inp(!!errors.title)} />
        <ErrorMsg msg={errors.title?.message} />
      </div>

      {/* Description */}
      <div>
        <Label required>Description</Label>
        <textarea
          {...register('description')}
          rows={5}
          placeholder={config.descPlaceholder}
          className={`${inp(!!errors.description)} resize-none`}
        />
        <ErrorMsg msg={errors.description?.message} />
      </div>

      {/* Location — city is the only required field here */}
      <div className="grid grid-cols-2 gap-3">
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
          <input {...register('county')} placeholder="e.g. Nairobi County" className={inp()} />
        </div>
        <div className="col-span-2">
          <Label>Area / address</Label>
          <input {...register('address')} placeholder="e.g. Westlands, Karen, CBD…" className={inp()} />
        </div>
      </div>

      {/* Photos */}
      <div>
        <Label required>Photos</Label>
        <p className="text-[11px] text-gray-400 mb-2">
          Add at least 3 photos. First photo becomes your cover image.
        </p>
        <PhotoUploader value={photos} onChange={setPhotos} token={token} />
      </div>

      {/* Nav */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-3 border border-gray-200 text-gray-600
            rounded-xl text-sm font-bold hover:border-gray-400 transition">
          <ArrowLeft size={14} /> Back
        </button>
        <button type="button" onClick={onNext}
          className="flex-1 py-3 bg-[#2D3B45] text-white rounded-xl text-sm font-black
            hover:bg-[#3a4d5a] transition flex items-center justify-center gap-2">
          Continue <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ── Amenities picker (unchanged logic, config-driven presets) ─────────────────
function AmenitiesPicker({
  value, onChange, presets,
}: {
  value:    string[];
  onChange: (v: string[]) => void;
  presets:  string[];
}) {
  const [custom, setCustom] = useState('');
  const toggle = (item: string) =>
    onChange(value.includes(item) ? value.filter(a => a !== item) : [...value, item]);
  const addCustom = () => {
    const t = custom.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setCustom('');
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {presets.map(a => (
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
          placeholder="Add custom amenity…"
          className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white
            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D3B45] transition" />
        <button type="button" onClick={addCustom}
          className="px-3 py-2 bg-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-200 transition">
          <Plus size={13} />
        </button>
      </div>
      {value.filter(a => !presets.includes(a)).length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.filter(a => !presets.includes(a)).map(a => (
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

// ── Step 3: Pricing & details ──────────────────────────────────────────────────
const PRICING_LABELS: Record<string, string> = {
  per_hour:   'Per hour',
  per_day:    'Per day',
  per_night:  'Per night',
  per_person: 'Per person',
  package:    'Package',
  contact:    'Contact for price',
};

function PricingStep({
  register, errors, watch, setValue, config,
  amenities, setAmenities, saving, saveAsRef, onBack,
}: {
  register:     any;
  errors:       any;
  watch:        any;
  setValue:     any;
  config:       ReturnType<typeof getCategoryConfig>;
  amenities:    string[];
  setAmenities: (v: string[]) => void;
  saving:       boolean;
  saveAsRef:    React.MutableRefObject<'draft' | 'active'>;
  onBack:       () => void;
}) {
  const pricingType = watch('pricingType');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-gray-900 mb-1">Pricing & details</h2>
        <p className="text-sm text-gray-500">Set your pricing and add any relevant details.</p>
      </div>

      {/* Pricing type — only show what makes sense for this category */}
      <div>
        <Label required>How do you charge?</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {config.pricingTypes.map(value => {
            const checked = pricingType === value;
            return (
              <label key={value}
                className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer text-xs
                  font-bold transition-colors
                  ${checked
                    ? 'border-[#2D3B45] bg-[#2D3B45]/5 text-[#2D3B45]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                <input
                  type="radio"
                  value={value}
                  {...register('pricingType')}
                  className="sr-only"
                />
                <span className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center
                  ${checked ? 'border-[#2D3B45]' : 'border-gray-300'}`}>
                  {checked && <span className="w-1.5 h-1.5 rounded-full bg-[#2D3B45]" />}
                </span>
                {PRICING_LABELS[value]}
              </label>
            );
          })}
        </div>
      </div>

      {/* Price field(s) */}
      {pricingType === 'package' ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label required>Min price (KSh)</Label>
            <div className="relative">
              <DollarSign size={14} className="absolute left-3 top-3 text-gray-400" />
              <input type="number" {...register('minPrice')} placeholder="50,000"
                className={`${inp(!!errors.minPrice)} pl-8`} />
            </div>
            <ErrorMsg msg={errors.minPrice?.message} />
          </div>
          <div>
            <Label required>Max price (KSh)</Label>
            <div className="relative">
              <DollarSign size={14} className="absolute left-3 top-3 text-gray-400" />
              <input type="number" {...register('maxPrice')} placeholder="200,000"
                className={`${inp(!!errors.maxPrice)} pl-8`} />
            </div>
            <ErrorMsg msg={errors.maxPrice?.message} />
          </div>
        </div>
      ) : pricingType === 'contact' ? (
        <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
          <Info size={14} className="text-blue-500 shrink-0" />
          <p className="text-xs text-blue-700">Customers will contact you directly to discuss pricing.</p>
        </div>
      ) : (
        <div>
          <Label required>{config.priceLabel}</Label>
          <div className="relative">
            <DollarSign size={14} className="absolute left-3 top-3 text-gray-400" />
            <input type="number" {...register('price')} placeholder="e.g. 15,000"
              className={`${inp(!!errors.price)} pl-8`} />
          </div>
          <ErrorMsg msg={errors.price?.message} />
        </div>
      )}

      {/* Capacity — only if relevant */}
      {config.showCapacity && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{config.capacityLabel}</Label>
            <div className="relative">
              <Users size={14} className="absolute left-3 top-3 text-gray-400" />
              <input type="number" {...register('capacity')} placeholder="e.g. 200"
                className={`${inp(!!errors.capacity)} pl-8`} />
            </div>
          </div>
          <div>
            <Label>Lead time ({config.durationUnit === 'hours' ? 'hours' : 'days'})</Label>
            <input type="number" {...register('leadTime')} placeholder="1" className={inp()} />
            <p className="text-[11px] text-gray-400 mt-1">Advance notice needed</p>
          </div>
        </div>
      )}

      {/* Booking duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Min booking ({config.durationUnit})</Label>
          <input type="number" {...register('minBookingDuration')} placeholder="1" className={inp()} />
        </div>
        <div>
          <Label>Max booking ({config.durationUnit})</Label>
          <input type="number" {...register('maxBookingDuration')} placeholder="30" className={inp()} />
        </div>
      </div>

      {/* Instant booking toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div className="relative">
          <input type="checkbox" {...register('instantBooking')} className="sr-only peer" />
          <div className="w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-[#2D3B45] transition-colors" />
          <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow
            transition-transform peer-checked:translate-x-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-800">Instant booking</p>
          <p className="text-[11px] text-gray-400">Customers can book without your approval</p>
        </div>
      </label>

      {/* Amenities — presets driven by category */}
      <div>
        <Label>Amenities & features</Label>
        <p className="text-[11px] text-gray-400 mb-2">
          Select what's included. These help customers find and compare you.
        </p>
        <AmenitiesPicker
          value={amenities}
          onChange={setAmenities}
          presets={config.amenityPresets}
        />
      </div>

      {/* Submit buttons */}
      <div className="flex gap-3 pt-2 pb-8">
        <button type="button" onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-3 border border-gray-200 text-gray-600
            rounded-xl text-sm font-bold hover:border-gray-400 transition">
          <ArrowLeft size={14} /> Back
        </button>
        <button
          type="submit"
          disabled={saving}
          onClick={() => { saveAsRef.current = 'draft'; }}
          className="flex-1 py-3 border-2 border-[#2D3B45] text-[#2D3B45] rounded-xl text-sm
            font-black hover:bg-[#2D3B45]/5 transition disabled:opacity-50">
          {saving && saveAsRef.current === 'draft' ? 'Saving…' : 'Save as draft'}
        </button>
        <button
          type="submit"
          disabled={saving}
          onClick={() => { saveAsRef.current = 'active'; }}
          className="flex-1 py-3 bg-[#2D3B45] text-white rounded-xl text-sm font-black
            hover:bg-[#3a4d5a] transition disabled:opacity-50 flex items-center justify-center gap-2">
          {saving && saveAsRef.current === 'active'
            ? 'Publishing…'
            : <><span>Publish</span><ChevronRight size={15} /></>}
        </button>
      </div>
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────
export function NewListingForm({ categories }: { categories: Category[] }) {
  const router     = useRouter();
  const { token }  = useAuth();
  const saveAsRef  = useRef<'draft' | 'active'>('draft');
  const [step,     setStep]     = useState(1);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [photos,    setPhotos]    = useState<string[]>([]);
  const [saving,    setSaving]    = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      pricingType: 'per_day', currency: 'KES',
      instantBooking: false, minBookingDuration: 1, maxBookingDuration: 30, leadTime: 1,
    },
  });

  const categoryId = watch('categoryId');
  const config     = getCategoryConfig(categories, categoryId);

  // When category changes, update pricing type default and reset amenities
  useEffect(() => {
    if (!categoryId) return;
    const cfg = getCategoryConfig(categories, categoryId);
    setValue('pricingType', cfg.defaultPricing);
    setAmenities([]);
  }, [categoryId, categories, setValue]);

  const goToStep2 = () => {
    if (!categoryId) return;
    setStep(2);
  };

  const goToStep3 = () => {
    // Validate step 2 fields before proceeding
    const title       = watch('title');
    const description = watch('description');
    const city        = watch('city');
    if (!title || title.length < 5)       { toast.error('Add a title (5+ characters)'); return; }
    if (!description || description.length < 20) { toast.error('Add a description (20+ characters)'); return; }
    if (!city || city.length < 2)          { toast.error('Add your city'); return; }
    setStep(3);
  };

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

      if (saveAsRef.current === 'active' && id) {
        await listingsService.updateStatus(id, 'active').catch(() => {});
      }

      toast.success(saveAsRef.current === 'active' ? 'Listing published!' : 'Draft saved');
      router.push('/vendor/listings');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create listing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
      <StepBar step={step} />

      {/* Hidden field — always registered */}
      <input type="hidden" {...register('categoryId')} />

      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        {step === 1 && (
          <CategoryStep
            categories={categories}
            value={categoryId}
            onChange={id => setValue('categoryId', id)}
            onNext={goToStep2}
          />
        )}
        {step === 2 && (
          <EssentialsStep
            register={register}
            errors={errors}
            config={config}
            photos={photos}
            setPhotos={setPhotos}
            token={token}
            onBack={() => setStep(1)}
            onNext={goToStep3}
          />
        )}
        {step === 3 && (
          <PricingStep
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            config={config}
            amenities={amenities}
            setAmenities={setAmenities}
            saving={saving}
            saveAsRef={saveAsRef}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </form>
  );
}