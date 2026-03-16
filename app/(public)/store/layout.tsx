// app/(public)/store/layout.tsx
// ✅ Server Component — wraps all store pages with Header + Footer
// Remove inline style — use Tailwind only
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}