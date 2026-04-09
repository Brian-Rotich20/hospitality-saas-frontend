// components/layout/CategoryStrip.tsx — full replacement

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutGrid, Building2, Utensils, Camera, Music,
  Flower2, Bus, MoreHorizontal, BookOpen, Sparkles,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutGrid, Building2, Utensils, Camera, Music,
  Flower2, Bus, MoreHorizontal, BookOpen, Sparkles,
  // slug fallbacks
  venues: Building2, catering: Utensils, photography: Camera,
  music: Music, decor: Flower2, transport: Bus,
  entertainment: MoreHorizontal, education: BookOpen,
};

interface Category {
  id:       string;
  name:     string;
  slug:     string;
  icon?:    string;
  imageUrl?: string;
}

export function CategoryStrip({ categories }: { categories: Category[] }) {
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const activeSlug   = searchParams.get('category');

  const items = [
    { id: 'all', name: 'All', slug: 'all', icon: 'LayoutGrid', imageUrl: undefined },
    ...categories,
  ];

  return (
    <div
      className="bg-white border-b border-gray-100 z-40 overflow-x-auto scrollbar-none"
      style={{ position: 'sticky', top: 'var(--header-h, 116px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-14 gap-0.5 w-max min-w-full">
        {items.map(({ id, name, slug, icon, imageUrl }) => {
          const href   = slug === 'all' ? '/store' : `/store?category=${slug}`;
          const active = slug === 'all'
            ? pathname === '/store' && !activeSlug
            : activeSlug === slug;
          const Icon   = (icon && ICON_MAP[icon]) ? ICON_MAP[icon]
                       : (ICON_MAP[slug] ?? Sparkles);

          return (
            <Link key={id} href={href}
              className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl
                shrink-0 no-underline transition-colors cursor-pointer
                ${active
                  ? 'text-[#2D3B45]'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}>

              {/* ✅ Image if available, icon fallback */}
              <div className={`w-6 h-6 rounded-md overflow-hidden flex items-center justify-center
                ${active ? 'opacity-100' : 'opacity-70'}`}>
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={name}
                    width={24}
                    height={24}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Icon size={18} strokeWidth={active ? 2.2 : 1.7} />
                )}
              </div>

              <span className="text-[11px] font-semibold whitespace-nowrap leading-none">
                {name}
              </span>

              {active && (
                <span className="absolute -bottom-px left-3 right-3 h-0.5
                  bg-[#F5C842] rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}