import Link from 'next/link';
import { ButtonLink } from '../../components/ui/Button';

export const metadata = {
  title: 'How LinkMart works',
  description: 'Request to book hospitality vendors in Kenya. Vendors reply within 24 hours and you pay them directly.',
};

// Every statement here mirrors how the product actually behaves (see backend API reference):
// request-to-book, a 24-hour reply window, contact details after acceptance, no booking payments,
// and a vendor subscription with a one-month free trial. No prices are stated: the price is set by
// LinkMart administrators and shown to vendors in their billing page.

const CUSTOMER_STEPS = [
  { title: 'Find a vendor', body: 'Browse venues, caterers and event services, and check the dates you need on each listing’s calendar.' },
  { title: 'Send a request', body: 'Choose your dates and number of guests. Sending a request is free and doesn’t hold the dates yet.' },
  { title: 'Get an answer within 24 hours', body: 'The vendor accepts or declines. If they don’t reply in 24 hours the request expires and you can try someone else.' },
  { title: 'Agree the details and pay the vendor', body: 'Once accepted you get the vendor’s phone number and can message them. You pay the vendor directly; LinkMart never takes booking payments or fees.' },
];

const VENDOR_POINTS = [
  { title: 'Free for your first month', body: 'Switch your account to a vendor account and your free trial starts straight away.' },
  { title: 'One subscription, no commission', body: 'LinkMart charges vendors a subscription, paid by M-Pesa or card. There is no commission on your bookings.' },
  { title: 'You stay in control', body: 'Publish listings, block dates you can’t take, and accept or decline each request.' },
];

export default function AboutPage() {
  return (
    <div className="max-w-[880px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-[34px] sm:text-[42px] leading-[1.1] font-bold tracking-[-0.02em] text-text-primary text-balance">
        Book hospitality vendors directly, without paying a middleman
      </h1>
      <p className="mt-4 text-[17px] leading-relaxed text-text-secondary max-w-[60ch]">
        LinkMart connects people planning events and stays with vendors in Kenya. You send a booking request, the vendor
        answers, and the two of you arrange payment between yourselves.
      </p>

      <section className="mt-12" aria-labelledby="customers">
        <h2 id="customers" className="text-[22px] font-semibold text-text-primary">For customers</h2>
        <ol className="mt-5 grid gap-px bg-border border border-border rounded-2xl overflow-hidden">
          {CUSTOMER_STEPS.map((s, i) => (
            <li key={s.title} className="bg-card px-5 py-4 flex gap-4">
              <span className="w-7 h-7 shrink-0 rounded-full bg-surface-muted text-text-primary text-[13px] font-bold flex items-center justify-center tabular" aria-hidden>{i + 1}</span>
              <div>
                <h3 className="text-[16px] font-semibold text-text-primary">{s.title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-text-secondary">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-6"><ButtonLink href="/store" variant="primary" size="lg">Browse listings</ButtonLink></div>
      </section>

      <section className="mt-14" aria-labelledby="vendors">
        <h2 id="vendors" className="text-[22px] font-semibold text-text-primary">For vendors</h2>
        <dl className="mt-5 grid gap-6 sm:grid-cols-3">
          {VENDOR_POINTS.map((p) => (
            <div key={p.title}>
              <dt className="text-[16px] font-semibold text-text-primary">{p.title}</dt>
              <dd className="mt-1.5 text-[15px] leading-relaxed text-text-secondary">{p.body}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex flex-wrap gap-2">
          <ButtonLink href="/auth/register-vendor" variant="primary" size="lg">List your business</ButtonLink>
          <Link href="/auth/login?redirect=%2Fvendor%2Fdashboard" className="inline-flex items-center h-12 px-4 text-[15px] font-semibold text-text-secondary hover:text-text-primary">I already have an account</Link>
        </div>
      </section>
    </div>
  );
}
