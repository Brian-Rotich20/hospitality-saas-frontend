'use client';

// Vendor onboarding in three steps: business details, logo, ready. Becoming a vendor is
// instant (POST /vendors/become, which needs a verified email and starts the one-month free
// trial); the steps then fill in the profile (PUT /vendors/me) and point to the first listing.

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Check, ImagePlus } from 'lucide-react';
import { subscriptionService, uploadService, vendorsService } from '../../../lib/api/endpoints';
import type { ApiError } from '../../../lib/api/client';
import type { Vendor } from '../../../lib/types/vendor';
import { verifyEmailPath } from '../../../lib/auth/auth.context';
import { formatDay, normaliseKenyanPhone } from '../../../lib/subscriptions/subscription-ui';
import { Button, ButtonLink } from '../../../components/ui/Button';
import { Notice, Skeleton } from '../../../components/ui/Surface';

const STEPS = ['Your business', 'Logo', 'Ready'] as const;
const input = 'w-full h-12 rounded-[10px] border bg-card px-3.5 text-[15px] outline-none focus:ring-2 focus:ring-primary/20';

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2 mb-8" aria-label="Setup progress">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex items-center gap-2 flex-1 last:flex-none" aria-current={active ? 'step' : undefined}>
            <span className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[14px] font-semibold
              ${done ? 'bg-primary text-white' : active ? 'bg-primary-subtle text-primary ring-2 ring-primary' : 'bg-surface-muted text-text-muted'}`}>
              {done ? <Check size={16} aria-hidden /> : i + 1}
            </span>
            <span className={`hidden sm:block text-[14px] font-semibold whitespace-nowrap ${active ? 'text-text-primary' : 'text-text-muted'}`}>
              {label}<span className="sr-only">{done ? ' (done)' : active ? ' (current step)' : ''}</span>
            </span>
            {i < STEPS.length - 1 && <span className={`h-0.5 flex-1 rounded ${done ? 'bg-primary' : 'bg-border'}`} aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

export default function VendorOnboardingPage() {
  const router = useRouter();
  const intent = useSearchParams().get('intent');
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ businessName?: string; phone?: string }>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [trialEnds, setTrialEnds] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const prefill = (v: Vendor) => {
      setVendor(v);
      setBusinessName(v.businessName ?? '');
      setPhone(v.phoneNumber ?? '');
      setLogoPreview(v.logo ?? null);
    };
    (async () => {
      try {
        const { data } = await vendorsService.getProfile();
        if (data) { prefill(data); return; }
      } catch { /* not a vendor yet */ }
      if (intent !== 'vendor') { router.replace('/store'); return; }
      try {
        const { data } = await vendorsService.become();
        if (data) prefill(data);
      } catch (err) {
        const e = err as ApiError;
        if (e.code === 'EMAIL_NOT_VERIFIED') { router.replace(verifyEmailPath({ asVendor: true })); return; }
        setLoadError(e.code === 'ADMIN_CANNOT_ONBOARD' ? 'Administrator accounts can’t become vendors.' : e.message || 'Could not set up your vendor account.');
      }
    })();
  }, [intent, router]);

  useEffect(() => {
    if (step !== 2) return;
    subscriptionService.overview()
      .then((res) => setTrialEnds(res.data.subscription?.trialEndsAt ?? null))
      .catch(() => { /* the ready step works without the date */ });
  }, [step]);

  const saveDetails = async () => {
    const e: typeof errors = {};
    const name = businessName.trim();
    if (name.length < 3) e.businessName = 'Use at least 3 characters.';
    const normalised = phone.trim() ? normaliseKenyanPhone(phone) : null;
    if (phone.trim() && !normalised) e.phone = 'Enter a Kenyan number, for example 0712 345 678.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try {
      const { data } = await vendorsService.updateProfile({ businessName: name, ...(normalised ? { phoneNumber: normalised } : {}) });
      if (data) setVendor(data);
      setStep(1);
    } catch (err) {
      toast.error((err as ApiError).message || 'Could not save your details.');
    } finally {
      setSaving(false);
    }
  };

  const saveLogo = async () => {
    if (!logoFile) { setStep(2); return; }
    setSaving(true);
    try {
      const uploaded = await uploadService.uploadImage(logoFile, 'vendor_logo');
      await vendorsService.updateProfile({ logo: uploaded.data.url });
      setStep(2);
    } catch (err) {
      toast.error((err as ApiError).message || 'Upload failed. Use a JPEG, PNG or WebP under 5 MB.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-page">
      <header className="bg-primary h-16 px-4 sm:px-6 flex items-center">
        <Link href="/store" className="flex items-center gap-2 no-underline" aria-label="LinkMart home">
          <Image src="/images/mark.png" alt="" width={32} height={32} className="w-8 h-8 rounded-full" priority />
          <span className="text-[20px] font-bold tracking-[-0.02em] text-white">LinkMart</span>
        </Link>
      </header>

      <main className="max-w-[560px] mx-auto px-4 py-10 sm:py-14">
        {loadError ? (
          <Notice tone="error" title={loadError} action={<ButtonLink href="/store" size="sm">Back to store</ButtonLink>} />
        ) : !vendor ? (
          <div aria-busy="true"><Skeleton className="h-8 w-full mb-8" /><Skeleton className="h-80 w-full rounded-2xl" /></div>
        ) : (
          <>
            <Stepper current={step} />
            <section className="bg-card border border-border rounded-2xl p-6 sm:p-8" aria-labelledby="step-title">
              {step === 0 && (
                <form noValidate onSubmit={(e) => { e.preventDefault(); void saveDetails(); }}>
                  <h1 id="step-title" className="text-[26px] font-semibold tracking-[-0.02em] text-text-primary">Tell customers who you are</h1>
                  <p className="mt-1.5 mb-6 text-[15px] text-text-secondary">This is how your business appears on every listing.</p>
                  <label className="block mb-4"><span className="block text-[14px] font-semibold mb-1.5">Business name</span>
                    <input className={`${input} ${errors.businessName ? 'border-error' : 'border-border-strong focus:border-primary'}`}
                      value={businessName} maxLength={255} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Lakeside Venues" />
                    {errors.businessName && <span className="block mt-1.5 text-[13px] text-error">{errors.businessName}</span>}
                  </label>
                  <label className="block"><span className="block text-[14px] font-semibold mb-1.5">Business phone <span className="font-normal text-text-muted">(shared with customers after you accept)</span></span>
                    <input type="tel" inputMode="tel" className={`${input} ${errors.phone ? 'border-error' : 'border-border-strong focus:border-primary'}`}
                      value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712 345 678" />
                    {errors.phone && <span className="block mt-1.5 text-[13px] text-error">{errors.phone}</span>}
                  </label>
                  <Button type="submit" size="lg" block className="mt-7" loading={saving} loadingText="Saving…">Continue</Button>
                </form>
              )}

              {step === 1 && (
                <div>
                  <h1 id="step-title" className="text-[26px] font-semibold tracking-[-0.02em] text-text-primary">Add your logo</h1>
                  <p className="mt-1.5 mb-6 text-[15px] text-text-secondary">Optional. A logo helps customers recognise you. You can change it later.</p>
                  <div className="flex items-center gap-5">
                    <div className="w-24 h-24 rounded-full bg-surface-muted border border-border overflow-hidden flex items-center justify-center shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {logoPreview ? <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" /> : <ImagePlus size={26} className="text-text-muted" aria-hidden />}
                    </div>
                    <div>
                      <Button variant="secondary" onClick={() => fileRef.current?.click()}>{logoPreview ? 'Choose another image' : 'Choose an image'}</Button>
                      <p className="mt-2 text-[13px] text-text-muted">JPEG, PNG or WebP, up to 5 MB.</p>
                      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); } }} />
                    </div>
                  </div>
                  <div className="mt-8 flex flex-col-reverse sm:flex-row gap-2 sm:justify-between">
                    <Button variant="ghost" onClick={() => setStep(0)} disabled={saving}>Back</Button>
                    <div className="flex flex-col-reverse sm:flex-row gap-2">
                      {!logoFile && <Button variant="secondary" onClick={() => setStep(2)} disabled={saving}>Skip for now</Button>}
                      <Button onClick={() => void saveLogo()} loading={saving} loadingText="Uploading…" disabled={!logoFile}>Save and continue</Button>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h1 id="step-title" className="text-[26px] font-semibold tracking-[-0.02em] text-text-primary">You’re ready to list</h1>
                  <p className="mt-1.5 mb-6 text-[15px] text-text-secondary">
                    {trialEnds ? `Your free trial runs until ${formatDay(trialEnds)}.` : 'Your one-month free trial has started.'} Here’s how to get your first booking:
                  </p>
                  <ol className="space-y-3 mb-8">
                    {[
                      ['Create a listing', 'Add a title, description, location and at least 3 photos, then publish it.'],
                      ['Keep your calendar honest', 'Block the dates you can’t take so customers only request free days.'],
                      ['Reply within 24 hours', 'Accept or decline each request; unanswered requests expire.'],
                    ].map(([t, d], i) => (
                      <li key={t} className="flex gap-3">
                        <span className="w-7 h-7 shrink-0 rounded-full bg-primary-subtle text-primary text-[13px] font-semibold flex items-center justify-center">{i + 1}</span>
                        <div><p className="text-[15px] font-semibold text-text-primary">{t}</p><p className="text-[14px] text-text-secondary">{d}</p></div>
                      </li>
                    ))}
                  </ol>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <ButtonLink href="/vendor/listings/new" variant="brand" size="lg" className="flex-1">Create your first listing</ButtonLink>
                    <ButtonLink href="/vendor/dashboard" variant="secondary" size="lg">Go to dashboard</ButtonLink>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
