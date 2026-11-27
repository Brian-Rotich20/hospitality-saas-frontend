import Link from 'next/link';
import Image from 'next/image';

// Only real destinations. Contact details, social accounts and legal pages are not linked
// until the business provides them (placeholders such as a 0700 000 000 number were removed).

const COLUMNS = [
  { title: 'Customers', links: [{ label: 'Browse listings', href: '/store' }, { label: 'How LinkMart works', href: '/about' }, { label: 'Create an account', href: '/auth/register' }] },
  { title: 'Vendors', links: [{ label: 'List your business', href: '/auth/register-vendor' }, { label: 'Vendor sign in', href: '/auth/login?redirect=%2Fvendor%2Fdashboard' }] },
];

export function Footer() {
  return (
    <footer className="bg-card border-t border-border text-text-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/store" className="inline-block no-underline">
              <Image src="/images/logo.png" alt="LinkMart" width={120} height={28} className="h-7 w-auto" />
            </Link>
            <p className="mt-4 text-[14px] leading-relaxed">
              Find venues, caterers and event services in Kenya and request to book. Vendors reply within 24 hours,
              and you pay the vendor directly.
            </p>
          </div>
          {COLUMNS.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h3 className="text-[13px] font-semibold text-text-primary mb-3">{c.title}</h3>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.href}><Link href={l.href} className="text-[14px] text-text-secondary hover:text-text-primary no-underline">{l.label}</Link></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mt-10 pt-6 border-t border-border text-[13px] text-text-muted">© {new Date().getFullYear()} LinkMart</p>
      </div>
    </footer>
  );
}
