'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { ListingFilters } from '../../lib/types/listing';

type SortBy = 'price' | 'rating' | 'createdAt';

interface Props {
  count: number;
  loading: boolean;
  filters: ListingFilters;
  sortBy: SortBy;
  hasActiveFilters: boolean;
  onFilterChange: (key: keyof ListingFilters, value: string | number) => void;
  onClearFilters: () => void;
  onSortChange: (val: SortBy) => void;
}

const CATEGORY_OPTIONS: { value: ListingFilters['category']; label: string }[] = [
  { value: undefined,        label: 'All Categories' },
  { value: 'venue',          label: 'Venues'         },
  { value: 'catering',       label: 'Catering'       },
  { value: 'accommodation',  label: 'Accommodation'  },
  { value: 'other',          label: 'Other'          },
];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'rating',    label: 'Sort by: Highest Rated'  },
  { value: 'price',     label: 'Sort by: Price'          },
  { value: 'createdAt', label: 'Sort by: Newest'         },
];

export function ListingsToolbar({
  count, loading, filters, sortBy,
  hasActiveFilters, onFilterChange, onClearFilters, onSortChange,
}: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeCount = Object.values(filters).filter(
    v => v !== undefined && v !== ''
  ).length;

  return (
    <div className="bg-white border-b border-slate-100">

      {/* ── Toolbar row ── */}
      <div className="max-w-[1280px] mx-auto px-6 h-14 flex items-center justify-between gap-4">

        {/* Left — location + count */}
        <p className="text-[13.5px] text-slate-500 shrink-0">
          {filters.location
            ? <>Listings in <span className="font-semibold text-slate-700">{filters.location}</span></>
            : 'All Listings'
          }
          {!loading && (
            <span className="ml-2 text-slate-400">
              · <strong className="text-slate-600">{count}</strong> found
            </span>
          )}
        </p>

        {/* Right — sort + filter toggle */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => onSortChange(e.target.value as SortBy)}
              className="appearance-none pl-3 pr-8 py-2 text-[13px] font-medium text-slate-600
                bg-slate-50 border border-slate-200 rounded-xl cursor-pointer outline-none
                hover:border-slate-300 focus:border-[#1d9bf0] transition-colors"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Filters button */}
          <button
            onClick={() => setFiltersOpen(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              border transition-colors
              ${hasActiveFilters
                ? 'bg-[#1d9bf0] text-white border-[#1d9bf0] hover:bg-[#0b86d6]'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
              }`}
          >
            <SlidersHorizontal size={14} />
            Filters
            {hasActiveFilters && (
              <span className="bg-white text-[#1d9bf0] text-[10px] font-bold w-4 h-4
                rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Filter panel ── */}
      {filtersOpen && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4 animate-slide-down">
          <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">

            {/* search */}
            <div className="flex flex-col gap-1 lg:col-span-2">
              <label className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">
                Keyword
              </label>
              <input
                type="text"
                placeholder="Search listings…"
                value={filters.search ?? ''}
                onChange={e => onFilterChange('search', e.target.value)}
                className="h-9 px-3 text-[13px] bg-white border border-slate-200 rounded-lg outline-none
                  focus:border-[#1d9bf0] focus:ring-2 focus:ring-[#1d9bf0]/10 transition-all placeholder-slate-400"
              />
            </div>

            {/* category — matches Listing['category'] union */}
            <div className="flex flex-col gap-1">
              <label className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">
                Category
              </label>
              <div className="relative">
                <select
                  value={filters.category ?? ''}
                  onChange={e => onFilterChange('category', e.target.value)}
                  className="w-full h-9 pl-3 pr-7 text-[13px] bg-white border border-slate-200 rounded-lg
                    appearance-none outline-none focus:border-[#1d9bf0] transition-all cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map(o => (
                    <option key={o.value ?? '__all'} value={o.value ?? ''}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* location — maps to listing.location.city */}
            <div className="flex flex-col gap-1">
              <label className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">
                City
              </label>
              <input
                type="text"
                placeholder="e.g. Nairobi"
                value={filters.location ?? ''}
                onChange={e => onFilterChange('location', e.target.value)}
                className="h-9 px-3 text-[13px] bg-white border border-slate-200 rounded-lg outline-none
                  focus:border-[#1d9bf0] focus:ring-2 focus:ring-[#1d9bf0]/10 transition-all placeholder-slate-400"
              />
            </div>

            {/* priceMin + priceMax — number fields */}
            <div className="flex flex-col gap-1">
              <label className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">
                Price (KSh)
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceMin ?? ''}
                  onChange={e => onFilterChange('priceMin', e.target.value ? Number(e.target.value) : '')}
                  className="w-full h-9 px-2 text-[13px] bg-white border border-slate-200 rounded-lg outline-none
                    focus:border-[#1d9bf0] transition-all placeholder-slate-400"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceMax ?? ''}
                  onChange={e => onFilterChange('priceMax', e.target.value ? Number(e.target.value) : '')}
                  className="w-full h-9 px-2 text-[13px] bg-white border border-slate-200 rounded-lg outline-none
                    focus:border-[#1d9bf0] transition-all placeholder-slate-400"
                />
              </div>
            </div>

            {/* capacity — number field */}
            <div className="flex flex-col gap-1">
              <label className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">
                Min. Guests
              </label>
              <input
                type="number"
                placeholder="No. of guests"
                value={filters.capacity ?? ''}
                onChange={e => onFilterChange('capacity', e.target.value ? Number(e.target.value) : '')}
                className="h-9 px-3 text-[13px] bg-white border border-slate-200 rounded-lg outline-none
                  focus:border-[#1d9bf0] focus:ring-2 focus:ring-[#1d9bf0]/10 transition-all placeholder-slate-400"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="max-w-[1280px] mx-auto flex justify-end mt-3">
              <button
                onClick={onClearFilters}
                className="flex items-center gap-1.5 text-[12.5px] font-medium text-red-400 hover:text-red-600 transition-colors"
              >
                <X size={12} /> Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}