'use client';

import { ArrowLeft, ImageIcon, MapPin, Pencil } from 'lucide-react';
import type { Category } from '../../../../lib/types/listing';
import { PRICING_OPTIONS } from '../constants';
import type { WizardStep } from '../types';

interface PreviewStepProps {
  categories: Category[];
  categoryId: string;
  subCategoryId: string;
  title: string;
  description: string;
  county: string;
  area: string;
  pricingType: string;
  price?: number;
  minPrice?: number;
  maxPrice?: number;
  photos: string[];
  saving: boolean;
  onEdit: (step: WizardStep) => void;
  onBack: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

function formatPrice(
  pricingType: string, price?: number, minPrice?: number, maxPrice?: number,
) {
  const fmt = (n: number) => `KSh ${n.toLocaleString()}`;
  if (pricingType === 'contact') return 'Contact for price';
  if (pricingType === 'package' && minPrice && maxPrice) return `${fmt(minPrice)} – ${fmt(maxPrice)}`;
  if (!price) return '—';
  const suffix = { per_hour: '/hr', per_day: '/day', per_person: '/person', package: '', contact: '' }[pricingType] ?? '';
  return `${fmt(price)}${suffix}`;
}

function EditBadge({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400
        hover:text-[#2D3B45] transition-colors"
    >
      <Pencil size={10} /> Edit {label}
    </button>
  );
}

export function PreviewStep({
  categories, categoryId, subCategoryId, title, description, county, area,
  pricingType, price, minPrice, maxPrice, photos, saving,
  onEdit, onBack, onSaveDraft, onPublish,
}: PreviewStepProps) {
  const category = categories.find(c => c.id === categoryId);
  const subCategory = category?.children?.find(c => c.id === subCategoryId)
    ?? categories.find(c => c.id === subCategoryId);
  const cover = photos[0];
  const priceLabel = formatPrice(pricingType, price, minPrice, maxPrice);
  const missingPhotosForPublish = photos.length < 3;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-black text-gray-900 mb-0.5">Review your listing</h2>
        <p className="text-xs text-gray-400">This is exactly how customers will see it. Check it over before you publish.</p>
      </div>

      {/* ── Card preview — mirrors your live ListingCard layout ───────────── */}
      <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm max-w-sm mx-auto">
        <div className="aspect-video bg-gray-100 relative">
          {cover ? (
            <img src={cover} alt={title || 'Listing cover photo'} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <ImageIcon size={28} />
            </div>
          )}
          {category && (
            <span className="absolute top-2 left-2 text-[10px] font-black bg-white/90
              text-[#2D3B45] px-2 py-1 rounded-lg">
              {subCategory?.name ?? category.name}
            </span>
          )}
        </div>
        <div className="p-4 space-y-1.5">
          <h3 className="text-sm font-black text-gray-900 leading-snug line-clamp-2">
            {title || 'Untitled listing'}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2">{description || 'No description yet.'}</p>
          <div className="flex items-center gap-1 text-[11px] text-gray-400 pt-1">
            <MapPin size={11} />
            <span>{area && county ? `${area}, ${county}` : 'Location not set'}</span>
          </div>
          <div className="pt-2 flex items-center justify-between">
            <span className="text-sm font-black text-[#2D3B45]">{priceLabel}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              {PRICING_OPTIONS.find(p => p.value === pricingType)?.label}
            </span>
          </div>
        </div>
      </div>

      {/* ── Edit shortcuts ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-1">
        <EditBadge label="category" onClick={() => onEdit('category')} />
        <EditBadge label="details"  onClick={() => onEdit('details')} />
        <EditBadge label="pricing"  onClick={() => onEdit('pricing')} />
      </div>

      {missingPhotosForPublish && (
        <p className="text-[11px] text-amber-600 text-center font-bold">
          Add {3 - photos.length} more photo{3 - photos.length === 1 ? '' : 's'} to publish — you can still save as a draft.
        </p>
      )}

      <div className="flex gap-3 pt-2 pb-8">
        <button type="button" onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200
            text-gray-600 rounded-xl text-sm font-bold hover:border-gray-400 transition">
          <ArrowLeft size={14} /> Back
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={onSaveDraft}
          className="flex-1 py-2.5 border-2 border-[#2D3B45] text-[#2D3B45] rounded-xl
            text-sm font-black hover:bg-[#2D3B45]/5 transition disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save draft'}
        </button>
        <button
          type="button"
          disabled={saving || missingPhotosForPublish}
          onClick={onPublish}
          className="flex-1 py-2.5 bg-[#2D3B45] text-white rounded-xl text-sm font-black
            hover:bg-[#3a4d5a] transition disabled:opacity-50"
        >
          {saving ? 'Publishing…' : 'Publish'}
        </button>
      </div>
    </div>
  );
}