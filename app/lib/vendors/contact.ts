// Vendor business contact helpers. Mirrors backend/src/modules/vendors/contact.ts: numbers
// are accepted in Kenyan local or international form and stored as E.164 (+254712345678).
// Older vendors may still have local-format numbers (07…), so links normalise on the fly.

export interface VendorContact {
  businessEmail?: string | null;
  phoneNumber?: string | null;
  whatsappNumber?: string | null;
}

/** E.164 (+254712345678) or null when the input is not a valid phone number. */
export function normalisePhone(input: string | null | undefined): string | null {
  if (!input) return null;
  const s = input.trim().replace(/[\s\-.()]/g, '');
  let m = /^0(\d{9})$/.exec(s);
  if (m) return `+254${m[1]}`;
  m = /^\+?254(\d{9})$/.exec(s);
  if (m) return `+254${m[1]}`;
  m = /^\+([1-9]\d{7,14})$/.exec(s);
  if (m) return `+${m[1]}`;
  return null;
}

/** Readable form: +254 712 345 678 for Kenyan numbers, otherwise the E.164 string. */
export function formatPhone(input: string | null | undefined): string {
  const n = normalisePhone(input);
  if (!n) return input ?? '';
  const ke = /^\+254(\d{3})(\d{3})(\d{3})$/.exec(n);
  return ke ? `+254 ${ke[1]} ${ke[2]} ${ke[3]}` : n;
}

export const telHref = (phone: string | null | undefined) => {
  const n = normalisePhone(phone);
  return n ? `tel:${n}` : null;
};

/** wa.me wants the international number as digits only, without "+". */
export const whatsappHref = (phone: string | null | undefined, text?: string) => {
  const n = normalisePhone(phone);
  if (!n) return null;
  return `https://wa.me/${n.slice(1)}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
};

export const mailtoHref = (email: string | null | undefined, subject?: string) =>
  email ? `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}` : null;

export const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export const CONTACT_LABEL: Record<string, string> = {
  businessEmail: 'business email', phoneNumber: 'phone number', whatsappNumber: 'WhatsApp number',
};
