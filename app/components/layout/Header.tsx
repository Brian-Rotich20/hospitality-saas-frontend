// Server Component — fetches categories server-side, no client bundle cost
// Passes data down to client sub-components

import { NavBar } from './NavBar';
import { CategoryStrip } from './CategoryStrip';

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
      <CategoryStrip categories={categories} />
    </div>
  );
}