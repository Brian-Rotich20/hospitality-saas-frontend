import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-page)' }}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}