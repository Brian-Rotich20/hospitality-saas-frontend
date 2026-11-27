'use client';

// Business profile: how the vendor appears to customers on every listing. Contract:
// GET/PUT /api/vendors/me ({ businessName, logo, businessEmail, phoneNumber, whatsappNumber });
// numbers are stored as E.164 and null clears a field. Publishing a listing needs all three
// contact fields (422 BUSINESS_CONTACT_REQUIRED). The sign-in email lives under Account and is
// never changed here. Payout details are private to the vendor and kept as before.

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ImagePlus } from 'lucide-react';
import { uploadService, vendorsService } from '../../../../lib/api/endpoints';
import type { ApiError } from '../../../../lib/api/client';
import type { PayoutDetailsInput, Vendor } from '../../../../lib/types/vendor';
import { CONTACT_LABEL, formatPhone, isValidEmail, normalisePhone } from '../../../../lib/vendors/contact';
import { Card, Notice, PageHeader, Skeleton } from '../../../../components/ui/Surface';
import { Button } from '../../../../components/ui/Button';

type Field = 'businessName' | 'businessEmail' | 'phoneNumber' | 'whatsappNumber';
const input = 'w-full h-11 rounded-[10px] border bg-card px-3.5 text-[15px] outline-none focus:ring-2 focus:ring-primary/20';
const field = (bad: boolean) => `${input} ${bad ? 'border-error' : 'border-border-strong focus:border-primary'}`;

export default function BusinessProfilePage() {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<Record<Field, string>>({ businessName: '', businessEmail: '', phoneNumber: '', whatsappNumber: '' });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fill = (v: Vendor) => {
    setVendor(v);
    setForm({
      businessName: v.businessName ?? '',
      businessEmail: v.businessEmail ?? '',
      phoneNumber: v.phoneNumber ? formatPhone(v.phoneNumber) : '',
      whatsappNumber: v.whatsappNumber ? formatPhone(v.whatsappNumber) : '',
    });
    setLogoPreview(v.logo ?? null);
    setLogoFile(null);
  };

  const load = async () => {
    setLoadError(null);
    try {
      const res = await vendorsService.getProfile();
      fill(res.data);
    } catch (err) {
      setLoadError((err as ApiError).message || 'Could not load your business profile.');
    }
  };
  useEffect(() => { void load(); }, []);

  const set = (k: Field, v: string) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  const dirty = useMemo(() => {
    if (!vendor) return false;
    return logoFile !== null
      || form.businessName.trim() !== (vendor.businessName ?? '')
      || form.businessEmail.trim().toLowerCase() !== (vendor.businessEmail ?? '')
      || (normalisePhone(form.phoneNumber) ?? form.phoneNumber.trim()) !== (normalisePhone(vendor.phoneNumber) ?? vendor.phoneNumber ?? '')
      || (normalisePhone(form.whatsappNumber) ?? form.whatsappNumber.trim()) !== (normalisePhone(vendor.whatsappNumber) ?? vendor.whatsappNumber ?? '');
  }, [form, logoFile, vendor]);

  const validate = () => {
    const e: Partial<Record<Field, string>> = {};
    if (form.businessName.trim().length < 3) e.businessName = 'Use at least 3 characters.';
    if (form.businessEmail.trim() && !isValidEmail(form.businessEmail)) e.businessEmail = 'Enter a valid email address.';
    if (form.phoneNumber.trim() && !normalisePhone(form.phoneNumber)) e.phoneNumber = 'Enter a valid number, e.g. 0712 345 678 or +254 712 345 678.';
    if (form.whatsappNumber.trim() && !normalisePhone(form.whatsappNumber)) e.whatsappNumber = 'Enter a valid number, e.g. 0712 345 678 or +254 712 345 678.';
    return e;
  };

  const save = async () => {
    if (saving) return;
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) { setSaveError('Check the highlighted fields.'); return; }
    setSaving(true);
    setSaveError(null);
    try {
      let logo: string | undefined;
      if (logoFile) logo = (await uploadService.uploadImage(logoFile, 'vendor_logo')).data.url;
      const res = await vendorsService.updateProfile({
        businessName: form.businessName.trim(),
        ...(logo ? { logo } : {}),
        businessEmail: form.businessEmail.trim() || null,
        phoneNumber: form.phoneNumber.trim() ? normalisePhone(form.phoneNumber) : null,
        whatsappNumber: form.whatsappNumber.trim() ? normalisePhone(form.whatsappNumber) : null,
      });
      // PUT returns the owner view without the computed fields: re-read for contactMissing.
      const fresh = await vendorsService.getProfile().catch(() => ({ data: res.data }));
      fill(fresh.data);
      toast.success('Business profile saved');
    } catch (err) {
      const ae = err as ApiError;
      if (Array.isArray(ae.details)) {
        const map: Partial<Record<Field, string>> = {};
        for (const d of ae.details) { const k = d.path.replace(/^\//, '') as Field; if (k in form) map[k] = d.message; }
        setErrors(map);
      }
      setSaveError(ae.message || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loadError) {
    return (
      <div className="max-w-[760px] mx-auto">
        <PageHeader title="Business profile" />
        <Notice tone="error" title={loadError} action={<Button size="sm" variant="secondary" onClick={() => void load()}>Retry</Button>} />
      </div>
    );
  }
  if (!vendor) {
    return (
      <div className="max-w-[760px] mx-auto" aria-busy="true">
        <Skeleton className="h-8 w-56 mb-2" /><Skeleton className="h-5 w-80 mb-6" />
        <Skeleton className="h-40 w-full rounded-2xl mb-5" /><Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const missing = vendor.contactMissing ?? [];

  return (
    <div className="max-w-[760px] mx-auto space-y-5">
      <PageHeader title="Business profile"
        description={<>How your business appears to customers on every listing. Your sign-in email and password are under <Link href="/vendor/settings/account" className="font-semibold text-primary underline underline-offset-2">Account</Link>.</>} />

      {missing.length > 0 && (
        <Notice tone="warning" title="Add your contact details to publish listings">
          Customers need a way to reach you. Still missing: {missing.map((m) => CONTACT_LABEL[m]).join(', ')}.
        </Notice>
      )}

      <form className="space-y-5" noValidate onSubmit={(e) => { e.preventDefault(); void save(); }}>
        <Card title="Business">
          <div className="flex flex-col sm:flex-row gap-5 sm:items-start">
            <div className="flex items-center gap-4 sm:flex-col sm:items-center sm:w-28 shrink-0">
              <div className="w-20 h-20 rounded-full bg-surface-muted border border-border overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {logoPreview ? <img src={logoPreview} alt="Business logo" className="w-full h-full object-cover" /> : <ImagePlus size={22} className="text-text-muted" aria-hidden />}
              </div>
              <Button type="button" size="sm" variant="secondary" onClick={() => fileRef.current?.click()}>{logoPreview ? 'Change logo' : 'Add logo'}</Button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); } }} />
            </div>
            <label className="block flex-1">
              <span className="block text-[14px] font-semibold mb-1.5">Business name</span>
              <input className={field(!!errors.businessName)} value={form.businessName} maxLength={255} onChange={(e) => set('businessName', e.target.value)} aria-invalid={!!errors.businessName} />
              {errors.businessName && <span className="block mt-1.5 text-[13px] text-error">{errors.businessName}</span>}
              <span className="block mt-1.5 text-[13px] text-text-muted">Your public page link stays the same if you rename the business.</span>
            </label>
          </div>
        </Card>

        <Card title="Contact details customers see" description="Shown on all of your listings so customers can email, call or WhatsApp you directly.">
          <div className="grid gap-4">
            <label className="block">
              <span className="block text-[14px] font-semibold mb-1.5">Business email</span>
              <input type="email" inputMode="email" autoComplete="email" className={field(!!errors.businessEmail)} value={form.businessEmail}
                onChange={(e) => set('businessEmail', e.target.value)} placeholder="bookings@yourbusiness.co.ke" aria-invalid={!!errors.businessEmail} />
              {errors.businessEmail
                ? <span className="block mt-1.5 text-[13px] text-error">{errors.businessEmail}</span>
                : <span className="block mt-1.5 text-[13px] text-text-muted">Can differ from the email you sign in with.</span>}
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="block text-[14px] font-semibold mb-1.5">Phone number</span>
                <input type="tel" inputMode="tel" autoComplete="tel" className={field(!!errors.phoneNumber)} value={form.phoneNumber}
                  onChange={(e) => set('phoneNumber', e.target.value)} placeholder="0712 345 678" aria-invalid={!!errors.phoneNumber} />
                {errors.phoneNumber && <span className="block mt-1.5 text-[13px] text-error">{errors.phoneNumber}</span>}
              </label>
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <label htmlFor="whatsapp-number" className="text-[14px] font-semibold">WhatsApp number</label>
                  {form.phoneNumber.trim() && form.whatsappNumber.trim() !== form.phoneNumber.trim() && (
                    <button type="button" className="text-[13px] font-semibold text-primary hover:underline" onClick={() => set('whatsappNumber', form.phoneNumber)}>
                      Same as phone
                    </button>
                  )}
                </div>
                <input id="whatsapp-number" type="tel" inputMode="tel" className={field(!!errors.whatsappNumber)} value={form.whatsappNumber}
                  onChange={(e) => set('whatsappNumber', e.target.value)} placeholder="0712 345 678" aria-invalid={!!errors.whatsappNumber} />
                {errors.whatsappNumber && <span className="block mt-1.5 text-[13px] text-error">{errors.whatsappNumber}</span>}
              </div>
            </div>
            <p className="text-[13px] text-text-muted">Kenyan numbers can be written as 07…, 01… or +254…; numbers from other countries need their country code.</p>
          </div>
        </Card>

        {saveError && <Notice tone="error" title={saveError} />}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" disabled={!dirty || saving} onClick={() => fill(vendor)}>Discard changes</Button>
          <Button type="submit" size="lg" loading={saving} loadingText="Saving…" disabled={!dirty}>Save changes</Button>
        </div>
      </form>

      <PayoutSection vendor={vendor} onSaved={(v) => setVendor((cur) => (cur ? { ...cur, payoutDetails: v.payoutDetails } : cur))} />
    </div>
  );
}

/** Existing payout details, kept as before: private to the vendor, never shown to customers. */
function PayoutSection({ vendor, onSaved }: { vendor: Vendor; onSaved: (v: Vendor) => void }) {
  const p = vendor.payoutDetails;
  const [method, setMethod] = useState<'mpesa' | 'bank'>(p?.method ?? 'mpesa');
  const [mpesa, setMpesa] = useState(p?.mpesaNumber ?? '');
  const [bank, setBank] = useState({ bankName: p?.bankName ?? '', bankAccountName: p?.bankAccountName ?? '', bankAccountNumber: p?.bankAccountNumber ?? '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    let payload: PayoutDetailsInput;
    if (method === 'mpesa') {
      const n = mpesa.trim().replace(/[\s-]/g, '');
      if (!/^(\+254|0)[17]\d{8}$/.test(n)) { setError('Enter a Safaricom number, e.g. 0712 345 678.'); return; }
      payload = { payoutMethod: 'mpesa', mpesaNumber: n };
    } else {
      if (bank.bankName.trim().length < 2 || bank.bankAccountName.trim().length < 3 || bank.bankAccountNumber.trim().length < 5) {
        setError('Fill in the bank name, account name and account number.'); return;
      }
      payload = { payoutMethod: 'bank', bankName: bank.bankName.trim(), bankAccountName: bank.bankAccountName.trim(), bankAccountNumber: bank.bankAccountNumber.trim() };
    }
    setSaving(true);
    try {
      const res = await vendorsService.addPayoutDetails(payload);
      onSaved(res.data);
      toast.success('Payout details saved');
    } catch (err) {
      setError((err as ApiError).message || 'Could not save payout details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <details className="group bg-card border border-border rounded-2xl" open={!!p?.method}>
      <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-3">
        <span>
          <span className="block text-[16px] font-semibold text-text-primary">Payout details</span>
          <span className="block text-[13px] text-text-secondary">Optional and private. Customers never see these. LinkMart does not take or pay out booking money.</span>
        </span>
        <span className="text-[13px] font-semibold text-primary group-open:hidden">Show</span>
      </summary>
      <div className="px-5 pb-5 space-y-4">
        <div className="flex gap-2" role="radiogroup" aria-label="Payout method">
          {(['mpesa', 'bank'] as const).map((m) => (
            <label key={m} className={`flex items-center gap-2 h-10 px-4 rounded-lg border cursor-pointer text-[14px] font-semibold ${method === m ? 'border-primary bg-primary-subtle text-primary' : 'border-border-strong text-text-secondary'}`}>
              <input type="radio" name="payout" className="sr-only" checked={method === m} onChange={() => setMethod(m)} />
              {m === 'mpesa' ? 'M-Pesa' : 'Bank'}
            </label>
          ))}
        </div>
        {method === 'mpesa' ? (
          <label className="block"><span className="block text-[14px] font-semibold mb-1.5">M-Pesa number</span>
            <input type="tel" className={field(false)} value={mpesa} onChange={(e) => setMpesa(e.target.value)} placeholder="0712 345 678" /></label>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {([['bankName', 'Bank'], ['bankAccountName', 'Account name'], ['bankAccountNumber', 'Account number']] as const).map(([k, l]) => (
              <label key={k} className="block"><span className="block text-[14px] font-semibold mb-1.5">{l}</span>
                <input className={field(false)} value={bank[k]} onChange={(e) => setBank((b) => ({ ...b, [k]: e.target.value }))} /></label>
            ))}
          </div>
        )}
        {error && <p role="alert" className="text-[13px] text-error">{error}</p>}
        <div className="flex justify-end"><Button variant="secondary" onClick={() => void save()} loading={saving} loadingText="Saving…">Save payout details</Button></div>
      </div>
    </details>
  );
}
