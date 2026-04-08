import { cookies } from 'next/headers';
import { CategoryManagerClient } from '../../../components/admin/CategoryManagerClient';

async function fetchCategories(token: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/tree`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return (await res.json()).data ?? [];
  } catch { return []; }
}

export default async function AdminCategoriesPage() {
  const cookieStore = await cookies();
  const token       = cookieStore.get('access_token')?.value ?? '';
  const categories  = await fetchCategories(token);

  return <CategoryManagerClient initialCategories={categories} />;
}