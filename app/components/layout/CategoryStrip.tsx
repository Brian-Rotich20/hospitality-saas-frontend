//CategoryStrip.tsx
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutGrid, Building2, Utensils, Camera, Music,
  Flower2, Bus, MoreHorizontal, BookOpen, Sparkles,
} from 'lucide-react';

// Map backend slugs to lucide icons — extend as categories grow
const ICON_MAP: Record<string, React.ElementType> = {
  all:           LayoutGrid,
  event_venue:   Building2,
  venues:        Building2,
  catering:      Utensils,
  food:          Utensils,
  photography:   Camera,
  music:         Music,
  entertainment: MoreHorizontal,
  decor:         Flower2,
  decoration:    Flower2,
  transport:     Bus,
  education:     BookOpen,
};

interface Category {
  id:    string;
  name:  string;
  slug:  string;
  icon?: string;
}

interface CategoryStripProps {
  categories: Category[];
}

export function CategoryStrip({ categories }: CategoryStripProps) {
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const activeSlug   = searchParams.get('category');

  // Prepend "All" manually
  const allItem = { id: 'all', name: 'All', slug: 'all' };
  const items   = [allItem, ...categories];

  return (
    <nav className="bg-white border-b border-gray-100 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-14 gap-0.5 min-w-max">
        {items.map(({ id, name, slug }) => {
          const Icon   = ICON_MAP[slug] ?? Sparkles;
          const href   = slug === 'all' ? '/store' : `/store?category=${slug}`;
          const active = slug === 'all'
            ? pathname === '/store' && !activeSlug
            : activeSlug === slug;

          return (
            <Link key={id} href={href}
              className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl
                shrink-0 no-underline transition-colors
                ${active
                  ? 'text-[#2D3B45]'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}>
              <Icon size={18} strokeWidth={active ? 2.2 : 1.7} />
              <span className="text-[11px] font-semibold whitespace-nowrap leading-none">
                {name}
              </span>
              {active && (
                <span className="absolute -bottom-px left-3 right-3 h-0.5 bg-[#F5C842] rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}