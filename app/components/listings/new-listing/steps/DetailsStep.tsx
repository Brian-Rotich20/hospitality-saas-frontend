'use client';

import { ArrowLeft, ChevronRight } from 'lucide-react';
import { DESCRIPTION_MAX, DESCRIPTION_MIN, TITLE_MAX } from '../constants';
import { field, Label, Err, CharCounter } from '../FormAtoms';
import { LocationPicker } from '../LocationPicker';
import { PhotoUploader } from '../PhotoUploader';

export function DetailsStep({
  register, errors, watch, setValue,
  photos, setPhotos,
  onBack, onNext,
}: {
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  photos: string[];
  setPhotos: (v: string[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const county = watch('county') ?? '';
  const area   = watch('area')   ?? '';
  const title  = watch('title')  ?? '';
  const desc   = watch('description') ?? '';

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-black text-gray-900 mb-0.5">About your listing</h2>
        <p className="text-xs text-gray-400">A clear title and real photos get 3× more enquiries.</p>
      </div>

      <div>
        <Label req>Title</Label>
        <input
          {...register('title')}
          maxLength={TITLE_MAX}
          placeholder="e.g. Professional Wedding Photography – Nairobi"
          className={field(!!errors.title)}
        />
        <div className="flex items-start justify-between">
          <Err msg={errors.title?.message} />
          <CharCounter value={title} max={TITLE_MAX} min={5} />
        </div>
      </div>

      <div>
        <Label req>Description</Label>
        <textarea
          {...register('description')}
          maxLength={DESCRIPTION_MAX}
          rows={4}
          placeholder="What makes your service special? What's included? Who is it best for?"
          className={`${field(!!errors.description)} resize-none`}
        />
        <div className="flex items-start justify-between">
          <Err msg={errors.description?.message} />
          <CharCounter value={desc} max={DESCRIPTION_MAX} min={DESCRIPTION_MIN} />
        </div>
      </div>

      <LocationPicker
        county={county}
        area={area}
        onCounty={v => setValue('county', v, { shouldValidate: true })}
        onArea={(v, lat, lng) => {
          setValue('area', v, { shouldValidate: true });
          if (lat) setValue('lat', lat);
          if (lng) setValue('lng', lng);
        }}
        errors={errors}
      />

      <div>
        <Label req>Photos</Label>
        <PhotoUploader value={photos} onChange={setPhotos} />
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