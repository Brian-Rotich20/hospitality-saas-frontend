'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth.context';
import {
  Building2, MapPin, FileText, CreditCard,
  CheckCircle, ChevronRight, ChevronLeft,
  Phone, Globe, Upload, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL ?? '/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface StepConfig {
  id:          number;
  title:       string;
  subtitle:    string;
  icon:        React.ReactNode;
}

const STEPS: StepConfig[] = [
  { id: 1, title: 'Business Basics',  subtitle: 'Name, description & contact',  icon: <Building2 size={16} /> },
  { id: 2, title: 'Location',         subtitle: 'Where are you based?',          icon: <MapPin size={16} /> },
  { id: 3, title: 'Documents',        subtitle: 'Verify your business',          icon: <FileText size={16} /> },
  { id: 4, title: 'Payout Details',   subtitle: 'How do you want to get paid?',  icon: <CreditCard size={16} /> },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const inp = (err?: string) =>
  `w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border bg-gray-50 text-gray-900
   placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F5C842]
   focus:border-transparent transition ${err ? 'border-red-400' : 'border-gray-200'}`;

const plainInp = (err?: string) =>
  `w-full px-3 py-2.5 text-xs rounded-xl border bg-gray-50 text-gray-900
   placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F5C842]
   focus:border-transparent transition ${err ? 'border-red-400' : 'border-gray-200'}`;

function Label({ text }: { text: string }) {
  return <label className="block text-xs font-semibold text-gray-600 mb-1">{text}</label>;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-red-500 text-[10px] mt-0.5">{msg}</p>;
}

// ── Step 1 — Business Basics ──────────────────────────────────────────────────

interface BasicsData {
  businessName: string;
  description:  string;
  phoneNumber:  string;
  whatsappNumber: string;
  website:      string;
}

function StepBasics({ onNext, saving }: { onNext: (d: BasicsData) => void; saving: boolean }) {
  const [data,   setData]   = useState<BasicsData>({ businessName: '', description: '', phoneNumber: '', whatsappNumber: '', website: '' });
  const [errors, setErrors] = useState<Partial<BasicsData>>({});

  const validate = () => {
    const e: Partial<BasicsData> = {};
    if (data.businessName.trim().length < 3)  e.businessName = 'At least 3 characters';
    if (data.description.trim().length < 20)  e.description  = 'At least 20 characters';
    if (!/^(\+254|0)[17]\d{8}$/.test(data.phoneNumber)) e.phoneNumber = 'Enter a valid Kenyan number';
    if (data.whatsappNumber && !/^(\+254|0)[17]\d{8}$/.test(data.whatsappNumber)) e.whatsappNumber = 'Enter a valid Kenyan number';
    if (data.website && !/^https?:\/\/.+/.test(data.website)) e.website = 'Must start with http:// or https://';
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext(data);
  };

  const set = (k: keyof BasicsData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setData(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      <div>
        <Label text="Business Name *" />
        <div className="relative">
          <Building2 className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
          <input className={inp(errors.businessName)} placeholder="Your Business Name"
            value={data.businessName} onChange={set('businessName')} />
        </div>
        <FieldError msg={errors.businessName} />
      </div>

      <div>
        <Label text="Description *" />
        <textarea
          className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-gray-50 text-gray-900
            placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F5C842]
            focus:border-transparent transition resize-none ${errors.description ? 'border-red-400' : 'border-gray-200'}`}
          placeholder="Describe your business and what you offer..."
          rows={4} value={data.description} onChange={set('description')}
        />
        <div className="flex justify-between">
          <FieldError msg={errors.description} />
          <span className="text-[10px] text-gray-300 mt-0.5 ml-auto">{data.description.length}/500</span>
        </div>
      </div>

      <div>
        <Label text="Phone Number *" />
        <div className="relative">
          <Phone className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
          <input className={inp(errors.phoneNumber)} placeholder="+254 712 345 678"
            value={data.phoneNumber} onChange={set('phoneNumber')} />
        </div>
        <FieldError msg={errors.phoneNumber} />
      </div>

      <div>
        <Label text="WhatsApp Number (optional)" />
        <div className="relative">
          <Phone className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
          <input className={inp(errors.whatsappNumber)} placeholder="+254 712 345 678"
            value={data.whatsappNumber} onChange={set('whatsappNumber')} />
        </div>
        <FieldError msg={errors.whatsappNumber} />
      </div>

      <div>
        <Label text="Website (optional)" />
        <div className="relative">
          <Globe className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
          <input className={inp(errors.website)} placeholder="https://yourbusiness.com"
            value={data.website} onChange={set('website')} />
        </div>
        <FieldError msg={errors.website} />
      </div>

      <NavButtons onNext={submit} saving={saving} isFirst />
    </div>
  );
}

// ── Step 2 — Location ─────────────────────────────────────────────────────────

interface LocationData { city: string; county: string; }

const KENYAN_COUNTIES = [
  'Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika','Malindi','Kitale',
  'Garissa','Kakamega','Machakos','Meru','Nyeri','Kisii','Kericho','Embu',
  'Kilifi','Bungoma','Uasin Gishu','Trans Nzoia','Kirinyaga','Murang\'a',
  'Kiambu','Kajiado','Makueni','Kitui','Tharaka Nithi','Isiolo','Marsabit',
  'Samburu','Turkana','West Pokot','Baringo','Laikipia','Nyandarua','Nyahururu',
  'Nandi','Elgeyo Marakwet','Bomet','Narok','Migori','Homa Bay','Siaya',
  'Busia','Vihiga','Lamu','Tana River','Kwale','Taita Taveta','Mandera','Wajir',
];

function StepLocation({ onNext, onBack, saving }: { onNext: (d: LocationData) => void; onBack: () => void; saving: boolean }) {
  const [data,   setData]   = useState<LocationData>({ city: '', county: '' });
  const [errors, setErrors] = useState<Partial<LocationData>>({});

  const validate = () => {
    const e: Partial<LocationData> = {};
    if (data.city.trim().length < 2)   e.city   = 'City is required';
    if (!data.county)                  e.county = 'Please select your county';
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext(data);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label text="City / Town *" />
        <input className={plainInp(errors.city)} placeholder="e.g. Nairobi, Mombasa, Kisumu"
          value={data.city} onChange={e => setData(p => ({ ...p, city: e.target.value }))} />
        <FieldError msg={errors.city} />
      </div>

      <div>
        <Label text="County *" />
        <select
          className={`w-full px-3 py-2.5 text-xs rounded-xl border bg-gray-50 text-gray-900
            focus:outline-none focus:ring-2 focus:ring-[#F5C842] focus:border-transparent transition
            ${errors.county ? 'border-red-400' : 'border-gray-200'}`}
          value={data.county} onChange={e => setData(p => ({ ...p, county: e.target.value }))}
        >
          <option value="">Select county...</option>
          {KENYAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <FieldError msg={errors.county} />
      </div>

      <NavButtons onNext={submit} onBack={onBack} saving={saving} />
    </div>
  );
}

// ── Step 3 — Documents ────────────────────────────────────────────────────────

interface DocFile { file: File | null; uploading: boolean; uploaded: boolean; url?: string; }
type DocsState = { business_registration: DocFile; national_id: DocFile; tax_pin: DocFile; };

const DOC_LABELS: Record<keyof DocsState, string> = {
  business_registration: 'Business Registration Certificate',
  national_id:           'National ID / Passport',
  tax_pin:               'KRA Tax PIN Certificate',
};

function StepDocuments({
  token, vendorCreated, onNext, onBack, saving,
}: {
  token: string; vendorCreated: boolean;
  onNext: () => void; onBack: () => void; saving: boolean;
}) {
  const [docs, setDocs] = useState<DocsState>({
    business_registration: { file: null, uploading: false, uploaded: false },
    national_id:           { file: null, uploading: false, uploaded: false },
    tax_pin:               { file: null, uploading: false, uploaded: false },
  });

  const uploadDoc = async (type: keyof DocsState, file: File) => {
    setDocs(p => ({ ...p, [type]: { ...p[type], file, uploading: true } }));
    try {
      const form = new FormData();
      form.append('file',         file);
      form.append('documentType', type);

      const res  = await fetch(`${API}/vendors/me/documents`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body:    form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');

      setDocs(p => ({ ...p, [type]: { file, uploading: false, uploaded: true, url: json.data?.documentUrl } }));
      toast.success(`${DOC_LABELS[type]} uploaded`);
    } catch (err: any) {
      setDocs(p => ({ ...p, [type]: { file: null, uploading: false, uploaded: false } }));
      toast.error(err.message || 'Upload failed');
    }
  };

  const allUploaded = Object.values(docs).every(d => d.uploaded);

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">
        Upload clear photos or scans. These are used for verification only and kept secure.
      </p>

      {(Object.keys(docs) as (keyof DocsState)[]).map(type => {
        const doc = docs[type];
        return (
          <div key={type}>
            <Label text={DOC_LABELS[type]} />
            <label className={`flex items-center gap-3 p-3 rounded-xl border-2 border-dashed cursor-pointer
              transition hover:border-[#F5C842] hover:bg-yellow-50
              ${doc.uploaded ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <input type="file" accept="image/*,.pdf" className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) uploadDoc(type, f);
                }} />
              <div className="flex-1 min-w-0">
                {doc.uploading ? (
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Loader2 size={12} className="animate-spin" /> Uploading...
                  </span>
                ) : doc.uploaded ? (
                  <span className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
                    <CheckCircle size={12} /> {doc.file?.name ?? 'Uploaded'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Upload size={12} /> Click to upload
                  </span>
                )}
              </div>
              {doc.uploaded && (
                <span className="text-[10px] text-gray-400 shrink-0">Change</span>
              )}
            </label>
          </div>
        );
      })}

      {!allUploaded && (
        <p className="text-[10px] text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
          All 3 documents are required before proceeding.
        </p>
      )}

      <NavButtons onNext={onNext} onBack={onBack} saving={saving} nextDisabled={!allUploaded} />
    </div>
  );
}

// ── Step 4 — Payout ───────────────────────────────────────────────────────────

type PayoutMethod = 'mpesa' | 'bank';

interface PayoutData {
  payoutMethod:      PayoutMethod;
  mpesaNumber?:      string;
  bankName?:         string;
  bankAccountName?:  string;
  bankAccountNumber?: string;
}

function StepPayout({ onNext, onBack, saving }: { onNext: (d: PayoutData) => void; onBack: () => void; saving: boolean }) {
  const [method, setMethod]       = useState<PayoutMethod>('mpesa');
  const [mpesa,  setMpesa]        = useState('');
  const [bank,   setBank]         = useState({ name: '', accountName: '', accountNumber: '' });
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (method === 'mpesa') {
      if (!/^(\+254|0)[17]\d{8}$/.test(mpesa)) e.mpesa = 'Enter a valid Kenyan number';
    } else {
      if (bank.name.trim().length < 2)          e.bankName = 'Bank name is required';
      if (bank.accountName.trim().length < 3)   e.accountName = 'Account name is required';
      if (bank.accountNumber.trim().length < 5) e.accountNumber = 'Account number is required';
    }
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext(method === 'mpesa'
      ? { payoutMethod: 'mpesa', mpesaNumber: mpesa }
      : { payoutMethod: 'bank', bankName: bank.name, bankAccountName: bank.accountName, bankAccountNumber: bank.accountNumber }
    );
  };

  return (
    <div className="space-y-4">
      {/* Method toggle */}
      <div className="grid grid-cols-2 gap-2">
        {(['mpesa', 'bank'] as PayoutMethod[]).map(m => (
          <button key={m} type="button" onClick={() => setMethod(m)}
            className={`py-2.5 rounded-xl text-xs font-semibold border transition
              ${method === m
                ? 'border-[#F5C842] bg-[#fffbe6] text-[#2D3B45]'
                : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
            {m === 'mpesa' ? '📱 M-Pesa' : '🏦 Bank Transfer'}
          </button>
        ))}
      </div>

      {method === 'mpesa' ? (
        <div>
          <Label text="M-Pesa Number *" />
          <div className="relative">
            <Phone className="absolute left-2.5 top-2.5 text-gray-300" size={14} />
            <input className={inp(errors.mpesa)} placeholder="+254 712 345 678"
              value={mpesa} onChange={e => setMpesa(e.target.value)} />
          </div>
          <FieldError msg={errors.mpesa} />
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <Label text="Bank Name *" />
            <input className={plainInp(errors.bankName)} placeholder="e.g. Equity Bank"
              value={bank.name} onChange={e => setBank(p => ({ ...p, name: e.target.value }))} />
            <FieldError msg={errors.bankName} />
          </div>
          <div>
            <Label text="Account Name *" />
            <input className={plainInp(errors.accountName)} placeholder="Name on the account"
              value={bank.accountName} onChange={e => setBank(p => ({ ...p, accountName: e.target.value }))} />
            <FieldError msg={errors.accountName} />
          </div>
          <div>
            <Label text="Account Number *" />
            <input className={plainInp(errors.accountNumber)} placeholder="Account number"
              value={bank.accountNumber} onChange={e => setBank(p => ({ ...p, accountNumber: e.target.value }))} />
            <FieldError msg={errors.accountNumber} />
          </div>
        </div>
      )}

      <NavButtons onNext={submit} onBack={onBack} saving={saving} nextLabel="Submit Application" />
    </div>
  );
}

// ── Nav Buttons ───────────────────────────────────────────────────────────────

function NavButtons({
  onNext, onBack, saving, isFirst, nextDisabled, nextLabel,
}: {
  onNext: () => void; onBack?: () => void;
  saving?: boolean; isFirst?: boolean;
  nextDisabled?: boolean; nextLabel?: string;
}) {
  return (
    <div className="flex gap-2 pt-2">
      {!isFirst && (
        <button type="button" onClick={onBack}
          className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-gray-200
            text-xs font-semibold text-gray-500 hover:border-gray-300 transition">
          <ChevronLeft size={13} /> Back
        </button>
      )}
      <button type="button" onClick={onNext} disabled={saving || nextDisabled}
        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
          bg-[#2D3B45] hover:bg-[#3a4d5a] text-white text-xs font-bold
          transition disabled:opacity-50 active:scale-[0.98]">
        {saving
          ? <><Loader2 size={12} className="animate-spin" /> Saving...</>
          : <>{nextLabel ?? 'Continue'} {!nextLabel && <ChevronRight size={13} />}</>}
      </button>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300
          ${i < current ? 'bg-[#F5C842]' : 'bg-gray-100'}`} />
      ))}
    </div>
  );
}

// ── Main Onboarding Component ─────────────────────────────────────────────────

export function VendorOnboarding() {
  const router          = useRouter();
  const { user, token } = useAuth();
  const [step,          setStep]          = useState(1);
  const [saving,        setSaving]        = useState(false);
  const [vendorCreated, setVendorCreated] = useState(false);

  // Token can come from auth context (email flow) or sessionStorage (Google flow)
  const authToken = token ?? (typeof window !== 'undefined' ? sessionStorage.getItem('vendorToken') : null);

  useEffect(() => {
    if (!authToken) router.replace('/auth/register-vendor');
  }, [authToken, router]);

  // ── API helpers ─────────────────────────────────────────────────────────────

  const apiFetch = async (path: string, body: object) => {
    const res  = await fetch(`${API}${path}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body:    JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || json.message || 'Request failed');
    return json;
  };

  const apiPut = async (path: string, body: object) => {
    const res  = await fetch(`${API}${path}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body:    JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || json.message || 'Request failed');
    return json;
  };

  // ── Step handlers ───────────────────────────────────────────────────────────

  const handleBasics = async (data: BasicsData) => {
    setSaving(true);
    try {
      if (!vendorCreated) {
        // First time: create the vendor record
        await apiFetch('/vendors/apply', {
          businessName:   data.businessName,
          description:    data.description,
          phoneNumber:    data.phoneNumber,
          ...(data.whatsappNumber && { whatsappNumber: data.whatsappNumber }),
          ...(data.website        && { website: data.website }),
        });
        setVendorCreated(true);
      } else {
        // Resuming: update existing record
        await apiPut('/vendors/me', {
          businessName:   data.businessName,
          description:    data.description,
          phoneNumber:    data.phoneNumber,
          ...(data.whatsappNumber && { whatsappNumber: data.whatsappNumber }),
          ...(data.website        && { website: data.website }),
          onboardingStep: 1,
        });
      }
      setStep(2);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLocation = async (data: LocationData) => {
    setSaving(true);
    try {
      await apiPut('/vendors/me', { ...data, onboardingStep: 2 });
      setStep(3);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDocsDone = () => setStep(4);  // docs upload themselves, just advance

  const handlePayout = async (data: PayoutData) => {
    setSaving(true);
    try {
      await apiFetch('/vendors/me/payout-details', data);
      // Mark onboarding complete & status → pending review
      await apiPut('/vendors/me', { onboardingStep: 5 });
      // Clear Google token from sessionStorage if present
      sessionStorage.removeItem('vendorToken');
      toast.success('Application submitted! We\'ll review and be in touch.');
      router.push('/auth/login?message=application-submitted');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const currentStep = STEPS[step - 1];

  return (
    <div className="min-h-screen bg-[#2D3B45] flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-xs text-white/50 font-medium tracking-wide uppercase mb-1">
            Vendor Setup
          </p>
          <h1 className="text-white text-lg font-black">Set up your store</h1>
        </div>

        {/* Progress */}
        <ProgressBar current={step} total={STEPS.length} />

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#F5C842] text-[#2D3B45]">
            {currentStep.icon}
          </div>
          <div>
            <p className="text-white text-xs font-bold leading-tight">{currentStep.title}</p>
            <p className="text-white/50 text-[10px]">{currentStep.subtitle}</p>
          </div>
          <span className="ml-auto text-white/30 text-[10px] font-medium">
            Step {step} of {STEPS.length}
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          {step === 1 && <StepBasics    onNext={handleBasics}   saving={saving} />}
          {step === 2 && <StepLocation  onNext={handleLocation} onBack={() => setStep(1)} saving={saving} />}
          {step === 3 && (
            <StepDocuments
              token={authToken!}
              vendorCreated={vendorCreated}
              onNext={handleDocsDone}
              onBack={() => setStep(2)}
              saving={saving}
            />
          )}
          {step === 4 && <StepPayout    onNext={handlePayout}   onBack={() => setStep(3)} saving={saving} />}
        </div>

        {/* Skip documents note */}
        {step === 3 && (
          <p className="text-center text-[10px] text-white/30 mt-3">
            You can also upload documents later from your vendor profile.{' '}
            <button onClick={handleDocsDone} className="text-white/50 underline">
              Skip for now
            </button>
          </p>
        )}
      </div>
    </div>
  );
}