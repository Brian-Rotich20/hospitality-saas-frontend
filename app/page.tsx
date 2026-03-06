import { Header } from "./components/layout/Header";  
import { Footer } from "./components/layout/Footer";
import StoreContent from "./components/listings/StoreContent";
export default function Home() {
  return (
    <main>
      <Header />
      <StoreContent />
      <Footer />
    </main>
  );
}
