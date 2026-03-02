import {Header}  from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import ListingsPage from './(public)/(listings)/page';
export default function Home() {
  return (
    <main>
      <Header />
      <ListingsPage />
      <Footer />
    </main>
  );
}
