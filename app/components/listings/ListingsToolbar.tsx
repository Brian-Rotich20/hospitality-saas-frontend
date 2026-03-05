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
  { value: 'event_venue',    label: 'Venues'         },
  { value: 'catering',       label: 'Catering'       },
  { value: 'accommodation',  label: 'Accommodation'  },
  { value: 'other',          label: 'Other'          },
];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'rating',    label: 'Top Rated'  },
  { value: 'price',     label: 'Price'      },
  { value: 'createdAt', label: 'Newest'     },
];

const inputCls = "h-9 px-3 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-[#2D3B45] focus:ring-2 focus:ring-[#2D3B45]/10 transition-all placeholder-gray-300 w-full";
const labelCls = "text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block";

export function ListingsToolbar({
  count, loading, filters, sortBy,
  hasActiveFilters, onFilterChange, onClearFilters, onSortChange,
}: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-30">

      {/* Toolbar row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-3">

        {/* Count */}
        <p className="text-xs text-gray-500 shrink-0 hidden sm:block">
          {filters.location
            ? <><span className="font-bold text-gray-700">{filters.location}</span> listings</>
            : 'All Listings'
          }
          {!loading && (
            <span className="ml-1.5 text-gray-400">
              · <strong className="text-gray-600">{count}</strong> found
            </span>
          )}
        </p>
        {!loading && (
          <p className="text-xs text-gray-500 sm:hidden">
            <strong className="text-gray-700">{count}</strong> results
          </p>
        )}

        {/* Right controls */}
        <div className="flex items-center gap-2 ml-auto">

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => onSortChange(e.target.value as SortBy)}
              className="appearance-none pl-3 pr-7 py-1.5 text-xs font-semibold text-gray-600
                bg-gray-50 border border-gray-200 rounded-lg cursor-pointer outline-none
                hover:border-gray-300 focus:border-[#2D3B45] transition-colors"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setFiltersOpen(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors
              ${hasActiveFilters
                ? 'bg-[#2D3B45] text-white border-[#2D3B45] hover:bg-[#3a4d5a]'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-100'}`}
          >
            <SlidersHorizontal size={13} />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="bg-[#F5C842] text-[#2D3B45] text-[9px] font-black w-4 h-4
                rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-4 sm:px-6 py-4">
          <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">

            {/* Keyword */}
            <div className="col-span-2 sm:col-span-1 lg:col-span-2">
              <label className={labelCls}>Keyword</label>
              <input type="text" placeholder="Search listings…"
                value={filters.search ?? ''}
                onChange={e => onFilterChange('search', e.target.value)}
                className={inputCls} />
            </div>

            {/* Category */}
            <div>
              <label className={labelCls}>Category</label>
              <div className="relative">
                <select
                  value={filters.category ?? ''}
                  onChange={e => onFilterChange('category', e.target.value)}
                  className="w-full h-9 pl-3 pr-7 text-xs bg-white border border-gray-200 rounded-lg
                    appearance-none outline-none focus:border-[#2D3B45] transition-all cursor-pointer font-medium text-gray-600"
                >
                  {CATEGORY_OPTIONS.map(o => (
                    <option key={o.value ?? '__all'} value={o.value ?? ''}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* City */}
            <div>
              <label className={labelCls}>City</label>
              <input type="text" placeholder="e.g. Nairobi"
                value={filters.location ?? ''}
                onChange={e => onFilterChange('location', e.target.value)}
                className={inputCls} />
            </div>

            {/* Price */}
            <div>
              <label className={labelCls}>Price (KSh)</label>
              <div className="flex gap-1.5">
                <input type="number" placeholder="Min"
                  value={filters.minPrice ?? ''}
                  onChange={e => onFilterChange('minPrice', e.target.value ? Number(e.target.value) : '')}
                  className="w-full h-9 px-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-[#2D3B45] transition-all placeholder-gray-300" />
                <input type="number" placeholder="Max"
                  value={filters.maxPrice ?? ''}
                  onChange={e => onFilterChange('maxPrice', e.target.value ? Number(e.target.value) : '')}
                  className="w-full h-9 px-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-[#2D3B45] transition-all placeholder-gray-300" />
              </div>
            </div>

            {/* Guests */}
            <div>
              <label className={labelCls}>Min. Guests</label>
              <input type="number" placeholder="No. of guests"
                value={filters.minCapacity ?? ''}
                onChange={e => onFilterChange('minCapacity', e.target.value ? Number(e.target.value) : '')}
                className={inputCls} />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="max-w-7xl mx-auto flex justify-end mt-3">
              <button onClick={onClearFilters}
                className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-600 transition-colors">
                <X size={11} /> Clear filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}