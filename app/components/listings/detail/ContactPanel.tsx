// Vendor contact on a listing: the business identity plus direct actions as buttons
// (WhatsApp, call, email). Contact comes from the vendor's business profile, so it is the
// same on every listing of that vendor. Missing channels are not shown.

import { BadgeCheck, Mail, MessageCircle, Phone } from 'lucide-react';
import type { ListingVendor } from '../../../lib/types/listing';
import { formatPhone, mailtoHref, telHref, whatsappHref } from '../../../lib/vendors/contact';

const BTN = 'w-full h-11 px-4 rounded-xl flex items-center justify-center gap-2 text-[13px] font-semibold no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

export function ContactPanel({ vendor, listingTitle, headingLevel = 2 }: { vendor: ListingVendor; listingTitle: string; headingLevel?: 2 | 3 }) {
  const message = `Hi ${vendor.businessName}, I found "${listingTitle}" on LinkMart and would like to know more.`;
  const wa = whatsappHref(vendor.whatsappNumber, message);
  const tel = telHref(vendor.phoneNumber);
  const mail = mailtoHref(vendor.businessEmail, `Enquiry about ${listingTitle} (LinkMart)`);
  const phoneLabel = formatPhone(vendor.phoneNumber);
  const H = headingLevel === 2 ? 'h2' : 'h3';

  return (
    <section aria-labelledby={`contact-${vendor.id}`} className="bg-card border border-border rounded-2xl p-5">
      <H id={`contact-${vendor.id}`} className="text-[15px] font-semibold text-text-primary">Contact the vendor</H>
      <div className="mt-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-subtle overflow-hidden flex items-center justify-center shrink-0">
          {vendor.logo
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={vendor.logo} alt="" className="w-full h-full object-cover" />
            : <span className="text-[15px] font-semibold text-primary">{vendor.businessName.charAt(0).toUpperCase()}</span>}
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-text-primary truncate">{vendor.businessName}</p>
          {vendor.verified && <p className="flex items-center gap-1 text-[12px] text-primary"><BadgeCheck size={13} aria-hidden /> Verified business</p>}
        </div>
      </div>

      {!wa && !tel && !mail ? (
        <p className="mt-4 text-[13px] text-text-secondary">This vendor hasn’t added contact details yet. Send a booking request to reach them.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className={`${BTN} bg-[#25D366] text-[#030207] hover:bg-[#1EBE5A]`}>
              <MessageCircle size={17} aria-hidden /> Chat on WhatsApp
            </a>
          )}
          {tel && (
            <a href={tel} className={`${BTN} border border-primary text-primary bg-card hover:bg-primary-subtle`}>
              <Phone size={16} aria-hidden /> Call <span className="tabular-nums">{phoneLabel}</span>
            </a>
          )}
          {mail && (
            <a href={mail} className={`${BTN} border border-border text-text-primary bg-card hover:bg-surface-muted`}>
              <Mail size={16} aria-hidden /> Email vendor
            </a>
          )}
        </div>
      )}
    </section>
  );
}
