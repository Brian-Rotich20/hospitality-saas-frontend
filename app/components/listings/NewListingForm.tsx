'use client';

import {
  useState, useCallback, useRef, useEffect,
} from 'react';
import { useRouter }       from 'next/navigation';
import { useForm }         from 'react-hook-form';
import { zodResolver }     from '@hookform/resolvers/zod';
import { z }               from 'zod';
import { useAuth }         from '../../lib/auth/auth.context';
import { listingsService } from '../../lib/api/endpoints';
import type { Category }   from '../../lib/types/listing';
import {
  MapPin, DollarSign, Upload, X, ChevronRight,
  Info, ImageIcon, Loader2, AlertCircle, Check, ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const MAX_PHOTOS  = 10;
const MAX_MB      = 5;
const ACCEPT      = ['image/jpeg', 'image/png', 'image/webp'];

const KENYA_COUNTIES = [
  'Baringo','Bomet','Bungoma','Busia','Elgeyo-Marakwet','Embu','Garissa',
  'Homa Bay','Isiolo','Kajiado','Kakamega','Kericho','Kiambu','Kilifi',
  'Kirinyaga','Kisii','Kisumu','Kitui','Kwale','Laikipia','Lamu','Machakos',
  'Makueni','Mandera','Marsabit','Meru','Migori','Mombasa','Murang\'a',
  'Nairobi','Nakuru','Nandi','Narok','Nyamira','Nyandarua','Nyeri',
  'Samburu','Siaya','Taita-Taveta','Tana River','Tharaka-Nithi','Trans Nzoia',
  'Turkana','Uasin Gishu','Vihiga','Wajir','West Pokot',
];

const PRICING_OPTIONS = [
  { value: 'per_hour',   label: 'Per hour'         },
  { value: 'per_day',    label: 'Per day'           },
  { value: 'per_person', label: 'Per person'        },
  { value: 'package',    label: 'Package'           },
  { value: 'contact',    label: 'Contact for price' },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Schema — aligned with backend
// ─────────────────────────────────────────────────────────────────────────────
const schema = z.object({
  categoryId:    z.string().min(1, 'Select a category'),
  subCategoryId: z.string().optional(),
  title:         z.string().min(5, 'At least 5 characters').max(255),
  description:   z.string().min(20, 'At least 20 characters').max(5000),
  county:        z.string().min(2, 'Select a county'),
  area:          z.string().min(2, 'Select an area'),
  pricingType:   z.enum(['per_hour', 'per_day', 'per_person', 'package', 'contact']),
  price:         z.coerce.number().positive().optional(),
  minPrice:      z.coerce.number().positive().optional(),
  maxPrice:      z.coerce.number().positive().optional(),
  currency:      z.string().default('KES'),
  lat:          z.coerce.number().optional(),
  lng:          z.coerce.number().optional(),  
}).refine(data => {
  if (data.pricingType === 'package')  return !!data.minPrice && !!data.maxPrice;
  if (data.pricingType !== 'contact')  return !!data.price;
  return true;
}, { message: 'Price is required', path: ['price'] });

type FormData = z.infer<typeof schema>;

// ─────────────────────────────────────────────────────────────────────────────
// Shared atoms
// ─────────────────────────────────────────────────────────────────────────────
const field = (err?: boolean) =>
  `w-full px-3 py-2.5 text-sm rounded-xl border bg-white text-gray-900
   placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D3B45]
   focus:border-transparent transition
   ${err ? 'border-red-400' : 'border-gray-200'}`;

function Label({ children, req }: { children: React.ReactNode; req?: boolean }) {
  return (
    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
      {children}
      {req && <span className="text-red-400 normal-case font-normal ml-1">*</span>}
    </label>
  );
}

function Err({ msg }: { msg?: string }) {
  return msg
    ? <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
        <AlertCircle size={10} />{msg}
      </p>
    : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step bar
// ─────────────────────────────────────────────────────────────────────────────
const STEPS = ['Category', 'Details', 'Pricing'];

function StepBar({ step }: { step: number }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((label, i) => {
        const n      = i + 1;
        const done   = step > n;
        const active = step === n;
        return (
          <div key={n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center
                text-xs font-black transition-all
                ${done   ? 'bg-[#2D3B45] text-white'
                : active ? 'bg-[#F5C842] text-[#2D3B45]'
                :          'bg-gray-100 text-gray-400'}`}>
                {done ? <Check size={13} /> : n}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wide
                ${active ? 'text-[#2D3B45]' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-3 mb-4 transition-colors
                ${step > n ? 'bg-[#2D3B45]' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Category + Subcategory
// ─────────────────────────────────────────────────────────────────────────────
function CategoryStep({
  categories,
  categoryId,
  subCategoryId,
  onCategory,
  onSubCategory,
  onNext,
}: {
  categories:    Category[];
  categoryId:    string;
  subCategoryId: string;
  onCategory:    (id: string) => void;
  onSubCategory: (id: string) => void;
  onNext:        () => void;
}) {
  // Only top-level categories (no parentId)
  const topLevel = categories.filter(c => !c.parentId);
  const selected = topLevel.find(c => c.id === categoryId);

  // Subcategories = children of selected top-level
  const subs = selected?.children ?? categories.filter(c => c.parentId === categoryId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-black text-gray-900 mb-0.5">What are you listing?</h2>
        <p className="text-xs text-gray-400">Pick the category that best describes your service.</p>
      </div>

      {/* Top-level categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {topLevel.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => { onCategory(cat.id); onSubCategory(''); }}
            className={`relative flex flex-col items-start gap-1.5 p-3.5 rounded-2xl
              border-2 text-left transition-all
              ${categoryId === cat.id
                ? 'border-[#2D3B45] bg-[#2D3B45]/5'
                : 'border-gray-100 hover:border-gray-300 bg-white'}`}
          >
            {categoryId === cat.id && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-[#2D3B45] rounded-full
                flex items-center justify-center">
                <Check size={9} className="text-white" />
              </span>
            )}
            {cat.icon && (
              <span className="text-lg">{cat.icon}</span>
            )}
            <span className={`text-xs font-black leading-tight
              ${categoryId === cat.id ? 'text-[#2D3B45]' : 'text-gray-800'}`}>
              {cat.name}
            </span>
          </button>
        ))}
      </div>

      {/* Subcategories — appear when parent is selected */}
      {categoryId && subs.length > 0 && (
        <div>
          <Label>Subcategory <span className="text-gray-400 font-normal normal-case">(optional but helps customers find you)</span></Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {subs.map(sub => (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSubCategory(subCategoryId === sub.id ? '' : sub.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors
                  ${subCategoryId === sub.id
                    ? 'bg-[#2D3B45] text-white border-[#2D3B45]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#2D3B45]'}`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onNext}
        disabled={!categoryId}
        className="w-full py-3 bg-[#2D3B45] text-white rounded-xl text-sm font-black
          hover:bg-[#3a4d5a] transition disabled:opacity-40
          flex items-center justify-center gap-2"
      >
        Continue <ChevronRight size={15} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Nominatim area autocomplete hook
// ─────────────────────────────────────────────────────────────────────────────
interface NominatimResult {
  place_id: number;
  display_name: string;
  address: {
    suburb?:       string;
    neighbourhood?: string;
    quarter?:      string;
    city_district?: string;
    town?:         string;
    village?:      string;
    county?:       string;
    state?:        string;
  };
  lat: string;
  lon: string;
}

function useAreaSearch(county: string) {
  const [query,       setQuery]       = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [loading,     setLoading]     = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!query || query.length < 2 || !county) {
      setSuggestions([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        // Nominatim free API — scoped to Kenya + the selected county
        const params = new URLSearchParams({
          q:              `${query}, ${county}, Kenya`,
          format:         'json',
          addressdetails: '1',
          limit:          '6',
          countrycodes:   'ke',
          'accept-language': 'en',
        });

        const res  = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          { headers: { 'User-Agent': 'LinkMart/1.0' } },
        );
        const data: NominatimResult[] = await res.json();

        // Deduplicate by suburb/neighbourhood name
        const seen = new Set<string>();
        const unique = data.filter(r => {
          const label = extractAreaLabel(r);
          if (seen.has(label)) return false;
          seen.add(label);
          return true;
        });

        setSuggestions(unique);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query, county]);

  return { query, setQuery, suggestions, setSuggestions, loading };
}

function extractAreaLabel(r: NominatimResult): string {
  const a = r.address;
  return (
    a.suburb       ??
    a.neighbourhood ??
    a.quarter       ??
    a.city_district ??
    a.town          ??
    a.village       ??
    // fallback: first part of display_name before first comma
    r.display_name.split(',')[0].trim()
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Location picker component
// ─────────────────────────────────────────────────────────────────────────────
function LocationPicker({
  county, area, onCounty, onArea, errors,
}: {
  county:   string;
  area:     string;
  onCounty: (v: string) => void;
  onArea:   (v: string, lat?: number, lng?: number) => void;
  errors:   { county?: { message?: string }; area?: { message?: string } };
}) {
  const { query, setQuery, suggestions, setSuggestions, loading } =
    useAreaSearch(county);
  const [open, setOpen] = useState(false);
  const wrapRef         = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pickArea = (r: NominatimResult) => {
    const label = extractAreaLabel(r);
    onArea(label, parseFloat(r.lat), parseFloat(r.lon));
    setQuery(label);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* County dropdown */}
      <div>
        <Label req>County</Label>
        <div className="relative">
          <MapPin size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
          <select
            value={county}
            onChange={e => { onCounty(e.target.value); onArea(''); setQuery(''); }}
            className={`${field(!!errors.county)} pl-8 cursor-pointer appearance-none`}
          >
            <option value="">Select county…</option>
            {KENYA_COUNTIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <Err msg={errors.county?.message} />
      </div>

      {/* Area autocomplete — only shown once county is picked */}
      {county && (
        <div ref={wrapRef} className="relative">
          <Label req>Area / Estate</Label>
          <div className="relative">
            <MapPin size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
            {loading && (
              <Loader2 size={13} className="absolute right-3 top-3 text-gray-400 animate-spin" />
            )}
            <input
              value={area || query}
              placeholder={`Search area in ${county}…`}
              onChange={e => {
                setQuery(e.target.value);
                onArea(e.target.value);
                setOpen(true);
              }}
              onFocus={() => suggestions.length > 0 && setOpen(true)}
              className={`${field(!!errors.area)} pl-8 pr-8`}
              autoComplete="off"
            />
          </div>
          <Err msg={errors.area?.message} />

          {/* Suggestions dropdown */}
          {open && suggestions.length > 0 && (
            <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200
              rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
              {suggestions.map(r => {
                const label = extractAreaLabel(r);
                return (
                  <li key={r.place_id}>
                    <button
                      type="button"
                      onMouseDown={() => pickArea(r)}
                      className="w-full flex items-start gap-2 px-3 py-2.5
                        hover:bg-gray-50 text-left transition-colors"
                    >
                      <MapPin size={12} className="text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{label}</p>
                        <p className="text-[10px] text-gray-400 truncate max-w-xs">
                          {r.display_name}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* No results hint */}
          {open && query.length >= 2 && suggestions.length === 0 && !loading && (
            <p className="text-[11px] text-gray-400 mt-1">
              No areas found — try a different spelling or type the name directly.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Photo uploader
// ─────────────────────────────────────────────────────────────────────────────
interface UploadedPhoto {
  localId:   string;
  url:       string;
  uploading: boolean;
  error?:    string;
}

function PhotoUploader({
  value, onChange, token,
}: {
  value:    string[];
  onChange: (v: string[]) => void;
  token:    string | null;
}) {
  const [photos,   setPhotos]   = useState<UploadedPhoto[]>(
    value.map(url => ({ url, uploading: false, localId: url })),
  );
  const [dragging, setDragging] = useState(false);
  const inputRef                = useRef<HTMLInputElement>(null);
  const uploadedCount           = photos.filter(p => p.url && !p.error).length;
  const remaining               = MAX_PHOTOS - photos.filter(p => !p.error).length;

  useEffect(() => {
    onChange(photos.filter(p => p.url && !p.uploading && !p.error).map(p => p.url));
  }, [photos]);

  const uploadFile = useCallback(async (file: File, localId: string) => {
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await fetch('/api/upload/image', {
        method:  'POST',
        body:    fd,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error ?? `Upload failed (${res.status})`);
      }
      const json = await res.json();
      const url: string = json.data?.url ?? json.url;
      if (!url) throw new Error('No URL returned');
      setPhotos(prev => prev.map(p =>
        p.localId === localId ? { ...p, url, uploading: false } : p,
      ));
    } catch (err) {
      setPhotos(prev => prev.map(p =>
        p.localId === localId
          ? { ...p, uploading: false, error: err instanceof Error ? err.message : 'Upload failed' }
          : p,
      ));
    }
  }, [token]);

  const processFiles = useCallback((files: File[]) => {
    const valid = files.filter(f => ACCEPT.includes(f.type) && f.size <= MAX_MB * 1024 * 1024);
    const slots = Math.min(valid.length, remaining);
    if (!slots) return;
    const next: UploadedPhoto[] = valid.slice(0, slots).map(f => ({
      url: '', uploading: true,
      localId: `${f.name}-${Date.now()}-${Math.random()}`,
    }));
    setPhotos(prev => [...prev, ...next]);
    next.forEach((p, i) => uploadFile(valid[i], p.localId));
  }, [remaining, uploadFile]);

  return (
    <div className="space-y-3">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-gray-500">
          {uploadedCount} of {MAX_PHOTOS} photos
          {uploadedCount > 0 && ' · first photo is your cover'}
        </span>
        <span className={`font-bold ${uploadedCount >= 3 ? 'text-emerald-600' : 'text-amber-600'}`}>
          {uploadedCount < 3 ? `${3 - uploadedCount} more needed to publish` : '✓ Ready to publish'}
        </span>
      </div>

      {/* Drop zone */}
      {remaining > 0 && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); processFiles(Array.from(e.dataTransfer.files)); }}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer
            transition-colors select-none
            ${dragging
              ? 'border-[#2D3B45] bg-[#2D3B45]/5'
              : 'border-gray-200 hover:border-[#2D3B45] hover:bg-gray-50'}`}
        >
          <input
            ref={inputRef} type="file" multiple accept={ACCEPT.join(',')}
            className="sr-only"
            onChange={e => { processFiles(Array.from(e.target.files ?? [])); e.target.value = ''; }}
          />
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center
            mx-auto mb-2 transition-colors
            ${dragging ? 'bg-[#2D3B45] text-white' : 'bg-gray-100 text-gray-400'}`}>
            <Upload size={18} />
          </div>
          <p className="text-sm font-bold text-gray-700">
            {dragging ? 'Drop here' : 'Drag photos or click to upload'}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            JPG · PNG · WebP · max {MAX_MB}MB each
          </p>
        </div>
      )}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p, i) => (
            <div key={p.localId}
              className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 group">
              {p.uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                  <Loader2 size={18} className="text-[#2D3B45] animate-spin" />
                </div>
              )}
              {p.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10 p-2">
                  <AlertCircle size={16} className="text-red-400" />
                </div>
              )}
              {p.url && !p.uploading && !p.error && (
                <img src={p.url} alt={`photo ${i + 1}`} className="w-full h-full object-cover" />
              )}
              {i === 0 && p.url && !p.error && (
                <span className="absolute top-1 left-1 text-[9px] font-black
                  bg-[#F5C842] text-[#2D3B45] px-1.5 py-0.5 rounded z-20">
                  COVER
                </span>
              )}
              <button
                type="button"
                onClick={() => setPhotos(prev => prev.filter(x => x.localId !== p.localId))}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white
                  rounded-full flex items-center justify-center opacity-0
                  group-hover:opacity-100 transition-opacity z-20 hover:bg-red-500"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Details (title, description, location, photos)
// ─────────────────────────────────────────────────────────────────────────────
function DetailsStep({
  register, errors, watch, setValue,
  photos, setPhotos, token,
  onBack, onNext,
}: {
  register:  any;
  errors:    any;
  watch:     any;
  setValue:  any;
  photos:    string[];
  setPhotos: (v: string[]) => void;
  token:     string | null;
  onBack:    () => void;
  onNext:    () => void;
}) {
  const county = watch('county') ?? '';
  const area   = watch('area')   ?? '';

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-black text-gray-900 mb-0.5">About your listing</h2>
        <p className="text-xs text-gray-400">
          A clear title and real photos get 3× more enquiries.
        </p>
      </div>

      {/* Title */}
      <div>
        <Label req>Title</Label>
        <input
          {...register('title')}
          placeholder="e.g. Professional Wedding Photography – Nairobi"
          className={field(!!errors.title)}
        />
        <Err msg={errors.title?.message} />
      </div>

      {/* Description */}
      <div>
        <Label req>Description</Label>
        <textarea
          {...register('description')}
          rows={4}
          placeholder="What makes your service special? What's included? Who is it best for?"
          className={`${field(!!errors.description)} resize-none`}
        />
        <Err msg={errors.description?.message} />
      </div>

      {/* Location */}
      <LocationPicker
        county={county}
        area={area}
        onCounty={v => setValue('county', v, { shouldValidate: true })}
        onArea={(v, lat, lng) => {
          setValue('area', v, { shouldValidate: true });
          // lat/lng stored silently for future map use — not required fields
          if (lat) setValue('_lat', lat);
          if (lng) setValue('_lng', lng);
        }}
        errors={errors}
      />

      {/* Photos */}
      <div>
        <Label req>Photos</Label>
        <PhotoUploader value={photos} onChange={setPhotos} token={token} />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200
            text-gray-600 rounded-xl text-sm font-bold hover:border-gray-400 transition">
          <ArrowLeft size={14} /> Back
        </button>
        <button type="button" onClick={onNext}
          className="flex-1 py-2.5 bg-[#2D3B45] text-white rounded-xl text-sm font-black
            hover:bg-[#3a4d5a] transition flex items-center justify-center gap-2">
          Continue <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Pricing
// ─────────────────────────────────────────────────────────────────────────────
function PricingStep({
  register, errors, watch,
  saving, saveAsRef, onBack,
}: {
  register:  any;
  errors:    any;
  watch:     any;
  saving:    boolean;
  saveAsRef: React.MutableRefObject<'draft' | 'active'>;
  onBack:    () => void;
}) {
  const pricingType = watch('pricingType');

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-black text-gray-900 mb-0.5">Pricing</h2>
        <p className="text-xs text-gray-400">
          Clear pricing builds trust and reduces back-and-forth.
        </p>
      </div>

      {/* Pricing type */}
      <div>
        <Label req>How do you charge?</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRICING_OPTIONS.map(({ value, label }) => {
            const checked = pricingType === value;
            return (
              <label key={value}
                className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer
                  text-xs font-bold transition-colors
                  ${checked
                    ? 'border-[#2D3B45] bg-[#2D3B45]/5 text-[#2D3B45]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                <input
                  type="radio" value={value}
                  {...register('pricingType')} className="sr-only"
                />
                <span className={`w-3.5 h-3.5 rounded-full border-2 shrink-0
                  flex items-center justify-center
                  ${checked ? 'border-[#2D3B45]' : 'border-gray-300'}`}>
                  {checked && <span className="w-1.5 h-1.5 rounded-full bg-[#2D3B45]" />}
                </span>
                {label}
              </label>
            );
          })}
        </div>
      </div>

      {/* Price inputs */}
      {pricingType === 'package' ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label req>Min price (KSh)</Label>
            <div className="relative">
              <DollarSign size={13} className="absolute left-3 top-3 text-gray-400" />
              <input type="number" {...register('minPrice')} placeholder="50,000"
                className={`${field(!!errors.minPrice)} pl-8`} />
            </div>
            <Err msg={errors.minPrice?.message} />
          </div>
          <div>
            <Label req>Max price (KSh)</Label>
            <div className="relative">
              <DollarSign size={13} className="absolute left-3 top-3 text-gray-400" />
              <input type="number" {...register('maxPrice')} placeholder="200,000"
                className={`${field(!!errors.maxPrice)} pl-8`} />
            </div>
            <Err msg={errors.maxPrice?.message} />
          </div>
        </div>
      ) : pricingType === 'contact' ? (
        <div className="flex items-start gap-2.5 px-4 py-3 bg-blue-50
          border border-blue-100 rounded-xl">
          <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 leading-relaxed">
            Customers will contact you directly to discuss pricing.
            Make sure your profile has up-to-date contact details.
          </p>
        </div>
      ) : (
        <div>
          <Label req>Price (KSh)</Label>
          <div className="relative">
            <DollarSign size={13} className="absolute left-3 top-3 text-gray-400" />
            <input type="number" {...register('price')} placeholder="e.g. 15,000"
              className={`${field(!!errors.price)} pl-8`} />
          </div>
          <Err msg={errors.price?.message} />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2 pb-8">
        <button type="button" onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200
            text-gray-600 rounded-xl text-sm font-bold hover:border-gray-400 transition">
          <ArrowLeft size={14} /> Back
        </button>
        <button
          type="submit"
          disabled={saving}
          onClick={() => { saveAsRef.current = 'draft'; }}
          className="flex-1 py-2.5 border-2 border-[#2D3B45] text-[#2D3B45]
            rounded-xl text-sm font-black hover:bg-[#2D3B45]/5
            transition disabled:opacity-50">
          {saving && saveAsRef.current === 'draft' ? 'Saving…' : 'Save draft'}
        </button>
        <button
          type="submit"
          disabled={saving}
          onClick={() => { saveAsRef.current = 'active'; }}
          className="flex-1 py-2.5 bg-[#2D3B45] text-white rounded-xl text-sm
            font-black hover:bg-[#3a4d5a] transition disabled:opacity-50
            flex items-center justify-center gap-2">
          {saving && saveAsRef.current === 'active'
            ? 'Publishing…'
            : <><span>Publish</span><ChevronRight size={15} /></>}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root form
// ─────────────────────────────────────────────────────────────────────────────
export function NewListingForm({ categories }: { categories: Category[] }) {
  const router    = useRouter();
  const { token } = useAuth();
  const saveAsRef = useRef<'draft' | 'active'>('draft');

  const [step,    setStep]    = useState(1);
  const [photos,  setPhotos]  = useState<string[]>([]);
  const [saving,  setSaving]  = useState(false);

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { pricingType: 'per_day', currency: 'KES' },
  });

  const categoryId    = watch('categoryId')    ?? '';
  const subCategoryId = watch('subCategoryId') ?? '';

  // ── Navigation guards ───────────────────────────────────────────────────────
  const goStep2 = () => {
    if (!categoryId) { toast.error('Pick a category first'); return; }
    setStep(2);
  };

  const goStep3 = () => {
    const title  = watch('title')       ?? '';
    const desc   = watch('description') ?? '';
    const county = watch('county')      ?? '';
    const area   = watch('area')        ?? '';

    if (title.length  < 5)  { toast.error('Title needs at least 5 characters'); return; }
    if (desc.length   < 20) { toast.error('Description needs at least 20 characters'); return; }
    if (!county)             { toast.error('Select a county'); return; }
    if (!area)               { toast.error('Select an area'); return; }
    if (photos.length < 1)   { toast.error('Add at least 1 photo'); return; }

    setStep(3);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const onSubmit = async (data: FormData) => {
    if (saveAsRef.current === 'active' && photos.length < 3) {
      toast.error('Add at least 3 photos to publish');
      return;
    }

    setSaving(true);

    try {
      const lat = watch('_lat');
      const lng = watch('_lng');

      const payload = {
        categoryId: data.subCategoryId || data.categoryId,
        title: data.title,
        description: data.description,

        location: {
          county: data.county,
          area: data.area,
          country: 'Kenya',
          ...(lat && { latitude: Number(lat) }),
          ...(lng && { longitude: Number(lng) }),
        },

        pricingType: data.pricingType,
        price: data.price,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
        currency: data.currency,

        photos,
        coverPhoto: photos[0],
      };

      const res = await listingsService.create(payload);

      const id = res.data?.id ?? (res.data as any)?.data?.id;

      if (saveAsRef.current === 'active' && id) {
        await listingsService.updateStatus(id, 'active').catch(() => {});
      }

      toast.success(
        saveAsRef.current === 'active'
          ? 'Listing published!'
          : 'Draft saved'
      );

      router.push('/vendor/listings');

    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create listing');
    } finally {
      setSaving(false);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl">
      <StepBar step={step} />

      {/* Hidden registered fields */}
      <input type="hidden" {...register('categoryId')} />
      <input type="hidden" {...register('subCategoryId')} />
      <input type="hidden" {...register('county')} />
      <input type="hidden" {...register('area')} />

      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        {step === 1 && (
          <CategoryStep
            categories={categories}
            categoryId={categoryId}
            subCategoryId={subCategoryId}
            onCategory={id => setValue('categoryId', id, { shouldValidate: true })}
            onSubCategory={id => setValue('subCategoryId', id)}
            onNext={goStep2}
          />
        )}
        {step === 2 && (
          <DetailsStep
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            photos={photos}
            setPhotos={setPhotos}
            token={token}
            onBack={() => setStep(1)}
            onNext={goStep3}
          />
        )}
        {step === 3 && (
          <PricingStep
            register={register}
            errors={errors}
            watch={watch}
            saving={saving}
            saveAsRef={saveAsRef}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </form>
  );
}