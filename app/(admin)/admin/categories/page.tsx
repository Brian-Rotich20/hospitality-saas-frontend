import { CategoryManagerClient } from '../../../components/admin/CategoryManagerClient';
import { serverFetch } from '../../../lib/api/server';

// Same defensive unwrap used elsewhere — handles both
// { data: [...] } and { data: { data: [...], meta } } response shapes.
function asArray(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray((value as any)?.data)) return (value as any).data;
  return [];
}

export default async function AdminCategoriesPage() {
  const { data, error } = await serverFetch<any>('/categories/tree');
  if (error) {
    console.error('[AdminCategoriesPage] /categories/tree failed:', error);
  }
  const categories = asArray(data);

  return <CategoryManagerClient initialCategories={categories} />;
}