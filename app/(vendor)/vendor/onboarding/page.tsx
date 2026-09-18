'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { vendorsService, uploadService } from '../../../lib/api/endpoints';
import type { Vendor } from '../../../lib/types/vendor';
import { useSearchParams } from 'next/navigation';

export default function VendorOnboardingPage() {
  const router = useRouter();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const searchParams = useSearchParams();
  const intent = searchParams.get('intent');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await vendorsService.getProfile();
        if (data) {
          setVendor(data);
          setBusinessName(data.businessName);
          setLogoPreview(data.logo ?? null);
          return;
        }
      } catch {
        // no vendor yet — fall through to create one if intent says so
      }

      if (intent === 'vendor') {
        const { data } = await vendorsService.become();
        if (data) {
          setVendor(data);
          setBusinessName(data.businessName);
          setLogoPreview(data.logo ?? null);
        }
      } else {
        toast.error('You need a vendor account to see this page');
        router.push('/store');
      }
    };

  load().catch(() => toast.error('Could not load your shop details'))
    .finally(() => setLoading(false));
}, [intent]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const goToDashboard = () => router.push('/vendor/dashboard');


  
  const handleSkip = async () => {
    setSaving(true);
    try {
      await vendorsService.updateProfile({});
      router.push('/vendor/dashboard');
    } catch (err: any) {
      toast.error(err.message ?? 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let logoUrl = vendor?.logo;

      if (logoFile) {
        const uploaded = await uploadService.uploadImage(logoFile, 'vendor_logo');
        logoUrl = uploaded.data.url;
      }

      await vendorsService.updateProfile({
        businessName: businessName.trim() || undefined,
        logo: logoUrl,
      });

      toast.success('Shop set up!');
      goToDashboard();
    } catch (err: any) {
      toast.error(err.message ?? 'Could not save your shop details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-500">Setting up your shop…</div>;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold mb-2">Set up your shop</h1>
      <p className="text-gray-500 mb-8">
        We've started your shop as <span className="font-medium">{vendor?.businessName}</span>.
        Customize it now, or skip and do this later in Settings.
      </p>

      <label className="block text-sm font-medium mb-1">Business name</label>
      <input
        type="text"
        value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 mb-6"
        placeholder="e.g. Amina's Fashion House"
      />

      <label className="block text-sm font-medium mb-1">Shop logo</label>
      <div className="flex items-center gap-4 mb-8">
        {logoPreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoPreview} alt="Logo preview" className="w-16 h-16 rounded-full object-cover border" />
        )}
        <input type="file" accept="image/*" onChange={handleLogoChange} />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-black text-white rounded-lg py-2.5 font-medium disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save and continue'}
        </button>
        <button
          onClick={handleSkip}
          disabled={saving}
          className="px-4 py-2.5 text-gray-600 font-medium"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}