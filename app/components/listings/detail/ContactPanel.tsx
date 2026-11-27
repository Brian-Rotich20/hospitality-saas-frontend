// Vendor contact on a listing: the business identity plus direct actions (WhatsApp, call,
// email). Contact comes from the vendor's business profile, so it is the same on every
// listing of that vendor. Empty actions are not shown.

import { BadgeCheck, ChevronRight, Mail, MessageCircle, Phone } from 'lucide-react';
import type { ListingVendor } from '../../../lib/types/listing';
import { formatPhone, mailtoHref, telHref, whatsappHref } from '../../../lib/vendors/contact';

export function ContactPanel({ vendor, listingTitle, headingLevel = 2 }: { vendor: ListingVendor; listingTitle: string; headingLevel?: 2 | 3 }) {
  const message = `Hi ${vendor.businessName}, I found "${listingTitle}" on LinkMart and would like to know more.`;
  const actions = [
    { key: 'whatsapp', Icon: MessageCircle, label: 'WhatsApp', value: formatPhone(vendor.whatsappNumber), href: whatsappHref(vendor.whatsappNumber, message), external: true },
    { key: 'phone', Icon: Phone, label: 'Call', value: formatPhone(vendor.phoneNumber), href: telHref(vendor.phoneNumber), external: false },
    { key: 'email', Icon: Mail, label: 'Email', value: vendor.businessEmail ?? '', href: mailtoHref(vendor.businessEmail, `Enquiry about ${listingTitle} (LinkMart)`), external: false },
  ].filter((a) => a.href);
  const H = headingLevel === 2 ? 'h2' : 'h3';

  return (
    <section aria-labelledby={`contact-${vendor.id}`} className="bg-card border border-border rounded-2xl p-5">
      <H id={`contact-${vendor.id}`} className="text-[17px] font-semibold text-text-primary">Contact the vendor</H>
      <div className="mt-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary-subtle overflow-hidden flex items-center justify-center shrink-0">
          {vendor.logo
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={vendor.logo} alt="" className="w-full h-full object-cover" />
            : <span className="text-[18px] font-semibold text-primary">{vendor.businessName.charAt(0).toUpperCase()}</span>}
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-text-primary truncate">{vendor.businessName}</p>
          {vendor.verified && <p className="flex items-center gap-1 text-[13px] text-primary"><BadgeCheck size={14} aria-hidden /> Verified business</p>}
        </div>
      </div>

      {actions.length === 0 ? (
        <p className="mt-4 text-[14px] text-text-secondary">This vendor hasn’t added contact details yet. Send a booking request to reach them.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {actions.map(({ key, Icon, label, value, href, external }) => (
            <li key={key}>
              <a href={href!} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="flex items-center gap-3 py-3 no-underline group">
                <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${key === 'whatsapp' ? 'bg-primary text-white' : 'bg-surface-muted text-text-primary'}`}>
                  <Icon size={17} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-text-primary group-hover:text-primary">{label}</span>
                  <span className="block text-[13px] text-text-secondary truncate tabular">{value}</span>
                </span>
                <ChevronRight size={16} className="text-text-muted shrink-0" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
