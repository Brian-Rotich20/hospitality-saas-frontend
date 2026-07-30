'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronRight, Search, X } from 'lucide-react';
import type { Category } from '../../../../lib/types/listing';
import { Label } from '../FormAtoms';

interface CategoryStepProps {
  categories:    Category[];
  categoryId:    string;
  subCategoryId: string;
  onCategory:    (id: string) => void;
  onSubCategory: (id: string) => void;
  onNext:        () => void;
}

// Once the list grows past this, the search box earns its space visually
// (below this it just adds noise to a short list of buttons).
const SEARCH_THRESHOLD = 12;

export function CategoryStep({
  categories, categoryId, subCategoryId, onCategory, onSubCategory, onNext,
}: CategoryStepProps) {
  const [query, setQuery] = useState('');

  const topLevel = categories.filter(c => !c.parentId);
  const selected = topLevel.find(c => c.id === categoryId);
  const subs     = selected?.children ?? categories.filter(c => c.parentId === categoryId);

  const filtered = useMemo(() => {
    if (!query.trim()) return topLevel;
    const q = query.trim().toLowerCase();
    return topLevel.filter(c => c.name.toLowerCase().includes(q));
  }, [topLevel, query]);

  const showSearch = topLevel.length > SEARCH_THRESHOLD;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-black text-gray-900 mb-0.5">What are you listing?</h2>
        <p className="text-xs text-gray-400">Pick the category that best describes your service.</p>
      </div>

      {showSearch && (
        <div className="relative">
          <Search size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search categories…"
            className="w-full pl-8 pr-8 py-2.5 text-sm rounded-xl border border-gray-200
              bg-white placeholder-gray-400 focus:outline-none focus:ring-2
              focus:ring-[#2D3B45] focus:border-transparent transition"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Top-level categories */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {filtered.map(cat => {
            const isSelected = categoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategory(cat.id)}
                className={`relative flex flex-col items-center gap-2 p-3 border rounded-xl
                  text-center transition-colors cursor-pointer
                  ${isSelected
                    ? 'border-[#2D3B45] bg-[#2D3B45]/5'
                    : 'border-gray-200 bg-white hover:border-[#2D3B45] hover:bg-gray-50'}`}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-[#2D3B45] rounded-full
                    flex items-center justify-center">
                    <Check size={9} className="text-white" />
                  </span>
                )}

                {cat.imageUrl ? (
                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                    <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                  </div>
                ) : cat.icon ? (
                  <span className="text-lg">{cat.icon}</span>
                ) : null}

                <span className={`text-xs font-black leading-tight
                  ${isSelected ? 'text-[#2D3B45]' : 'text-gray-800'}`}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-gray-400 text-center py-6">
          No categories match &ldquo;{query}&rdquo;.
        </p>
      )}

      {/* Subcategories */}
      {categoryId && subs.length > 0 && (
        <div>
          <Label>
            Subcategory{' '}
            <span className="text-gray-400 font-normal normal-case">
              (optional but helps customers find you)
            </span>
          </Label>
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