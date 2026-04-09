'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutGrid, Building2, Utensils, Camera, Music,
  Flower2, Bus, MoreHorizontal, BookOpen, Sparkles,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutGrid, Building2, Utensils, Camera, Music,
  Flower2, Bus, MoreHorizontal, BookOpen, Sparkles,
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

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="py-6 px-4">
      <h2 className="text-base font-black text-gray-900 mb-4 tracking-tight">
        Browse by Category
      </h2>

      <div className="grid grid-cols-4 gap-3">
        {categories.map(({ id, name, slug, icon, imageUrl }) => {
          const Icon = (icon && ICON_MAP[icon]) ? ICON_MAP[icon]
                     : (ICON_MAP[slug] ?? Sparkles);

          return (
            <Link
              key={id}
              href={`/store?category=${slug}`}
              className="flex flex-col items-center gap-2 no-underline group">

              {/* Image tile */}
              <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100
                flex items-center justify-center border border-gray-100
                group-hover:border-[#2D3B45]/20 group-hover:shadow-sm transition-all">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover group-hover:scale-105
                      transition-transform duration-300"
                  />
                ) : (
                  /* Icon fallback styled like Jiji tiles */
                  <div className="w-full h-full flex items-center justify-center
                    bg-gradient-to-br from-gray-50 to-gray-100">
                    <Icon
                      size={28}
                      className="text-[#2D3B45]/60 group-hover:text-[#2D3B45] transition-colors"
                      strokeWidth={1.5}
                    />
                  </div>
                )}
              </div>

              {/* Label */}
              <span className="text-[11px] font-semibold text-gray-700 text-center
                leading-tight group-hover:text-[#2D3B45] transition-colors line-clamp-2">
                {name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}