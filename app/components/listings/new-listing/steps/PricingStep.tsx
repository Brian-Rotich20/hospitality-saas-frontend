'use client';

import { ArrowLeft, ChevronRight, DollarSign, Info } from 'lucide-react';
import { PRICING_OPTIONS } from '../constants';
import { field, Label, Err } from '../FormAtoms';

export function PricingStep({
  register, errors, watch, onBack, onNext,
}: {
  register: any;
  errors: any;
  watch: any;
  onBack: () => void;
  onNext: () => void;
}) {
  const pricingType = watch('pricingType');

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-black text-gray-900 mb-0.5">Pricing</h2>
        <p className="text-xs text-gray-400">Clear pricing builds trust and reduces back-and-forth.</p>
      </div>

      <div>
        <Label req>How do you charge?</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRICING_OPTIONS.map(({ value, label }) => {
            const checked = pricingType === value;
            return (
              <label key={value}
                className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer
                  text-xs font-bold transition-colors
                  ${checked ? 'border-[#2D3B45] bg-[#2D3B45]/5 text-[#2D3B45]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
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
      </div>

      {pricingType === 'package' ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label req>Min price (KSh)</Label>
            <div className="relative">
              <DollarSign size={13} className="absolute left-3 top-3 text-gray-400" />
              <input type="number" {...register('minPrice')} placeholder="50,000" className={`${field(!!errors.minPrice)} pl-8`} />
            </div>
            <Err msg={errors.minPrice?.message} />
          </div>
          <div>
            <Label req>Max price (KSh)</Label>
            <div className="relative">
              <DollarSign size={13} className="absolute left-3 top-3 text-gray-400" />
              <input type="number" {...register('maxPrice')} placeholder="200,000" className={`${field(!!errors.maxPrice)} pl-8`} />
            </div>
            <Err msg={errors.maxPrice?.message} />
          </div>
        </div>
      ) : pricingType === 'contact' ? (
        <div className="flex items-start gap-2.5 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
          <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 leading-relaxed">
            Customers will contact you directly to discuss pricing. Make sure your profile has up-to-date contact details.
          </p>
        </div>
      ) : (
        <div>
          <Label req>Price (KSh)</Label>
          <div className="relative">
            <DollarSign size={13} className="absolute left-3 top-3 text-gray-400" />
            <input type="number" {...register('price')} placeholder="e.g. 15,000" className={`${field(!!errors.price)} pl-8`} />
          </div>
          <Err msg={errors.price?.message} />
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200
            text-gray-600 rounded-xl text-sm font-bold hover:border-gray-400 transition">
          <ArrowLeft size={14} /> Back
        </button>
        <button type="button" onClick={onNext}
          className="flex-1 py-2.5 bg-[#2D3B45] text-white rounded-xl text-sm font-black
            hover:bg-[#3a4d5a] transition flex items-center justify-center gap-2">
          Review listing <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}