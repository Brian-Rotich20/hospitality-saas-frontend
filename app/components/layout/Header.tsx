// Server Component — fetches categories server-side, no client bundle cost
// Passes data down to client sub-components

import { NavBar } from './NavBar';
import { CategoryStrip } from './CategoryStrip';
import { Suspense } from 'react';

interface Category {
  id:    string;
  name:  string;
  slug:  string;
  icon?: string;
}

async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/categories`,
      {
        next: { revalidate: 3600 }, // ISR — re-fetch every hour
      }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export async function Header() {
  const categories = await fetchCategories();

  return (
      <div className="font-sans">
        <NavBar />

        <Suspense
          fallback={
            <div className="bg-white border-b border-gray-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-14 gap-0.5 min-w-max">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
              </div>
            </div>
          }
        >
          <CategoryStrip categories={categories} />
        </Suspense>
      </div>
    );
  }