import { Header } from "./components/layout/Header";  
import { Footer } from "./components/layout/Footer";
import StoreContent from "./components/listings/StoreContent";
import { Suspense } from "react";

export default function Home() {
  return (
    <main>
      <Header />

      <Suspense fallback={
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-14 gap-0.5 min-w-max">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
          </div>
        </div>
      }>
        <StoreContent />
      </Suspense>

      <Footer />
    </main>
  );
}