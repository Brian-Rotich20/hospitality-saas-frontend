// components/layout/Header.tsx

import { NavBar }        from './NavBar';
// import { Suspense }      from 'react';

// interface Category {
//   id:       string;
//   name:     string;
//   slug:     string;
//   icon?:    string;
//   imageUrl?: string;
// }

// async function fetchCategories(): Promise<Category[]> {
//   try {
//     const res = await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL}/categories`,
//       { next: { revalidate: 3600 } }
//     );
//     if (!res.ok) return [];
//     return (await res.json()).data ?? [];
//   } catch {
//     return [];
//   }
// }

export async function Header() {
  
  return (
    <div className="font-sans">
      <NavBar />


    </div>
  );
}