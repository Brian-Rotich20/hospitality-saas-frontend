// app/(admin)/vendors/layout.tsx
// Thin layout — just passes through, admin layout handles sidebar
export default function VendorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}