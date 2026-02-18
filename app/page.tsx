import Image from "next/image";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { HeroSection } from "./components/public/HeroSection";
import { CategoriesSection } from "./components/public/CategoriesSection";
import { FeaturedListingsSection } from "./components/public/FeaturedListingsSection";   


export default function Home() {
  return (
    <main>
     
      <Header />
      <HeroSection />
      <CategoriesSection />
      <FeaturedListingsSection />
      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Become a Vendor?
          </h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            List your venue, catering service, or accommodation on our platform and reach thousands of customers
          </p>
          <a
            href="/auth/register-vendor"
            className="inline-block px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Join as a Vendor
          </a>
        </div>
      </section>
      <Footer />
    </main>
  );
}
