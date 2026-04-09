// components/layout/Header.tsx

import { NavBar }        from './NavBar';
import { CategoryStrip } from './CategoryStrip';
import { Suspense }      from 'react';

interface Category {
  id:       string;
  name:     string;
  slug:     string;
  icon?:    string;
  imageUrl?: string;
}

async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/categories`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    return (await res.json()).data ?? [];
  } catch {
    return [];
  }
}

export async function Header() {
  const categories = await fetchCategories();

  return (
    <div className="font-sans">
      <NavBar />

      {/* ✅ CategoryStrip DESKTOP ONLY — mobile gets sidebar inside StoreContent */}
      <div className="hidden lg:block">
        <Suspense fallback={
          <div className="bg-white border-b border-gray-100 h-14" />
        }>
          <CategoryStrip categories={categories} />
        </Suspense>
      </div>
    </div>
  );
}