'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../../../lib/auth/auth.context';
import { customerService, uploadService } from '../../../../lib/api/endpoints';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { Save, Loader2, Camera, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VendorAccountPage() {
  const { user } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [initial, setInitial] = useState({ fullName: '', phone: '' });

  useEffect(() => {
    customerService.getProfile()
      .then((res) => {
        const p = (res as any).data;
        const loadedName = p.fullName ?? '';
        const loadedPhone = p.phone ?? '';
        setFullName(loadedName);
        setPhone(loadedPhone);
        setAvatarUrl(p.avatarUrl ?? null);
        setVerified(!!p.verified);
        setInitial({ fullName: loadedName, phone: loadedPhone });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    return () => { if (avatarPreview) URL.revokeObjectURL(avatarPreview); };
  }, [avatarPreview]);

  const isDirty = useMemo(
    () => fullName !== initial.fullName || phone !== initial.phone || avatarFile !== null,
    [fullName, phone, avatarFile, initial]
  );

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    const previewUrl = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreview(previewUrl);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty || saving) return;
    setSaving(true);
    const toastId = toast.loading(avatarFile ? 'Uploading profile photo…' : 'Saving changes…');

    try {
      let uploadedAvatarUrl: string | undefined;

      if (avatarFile) {
        setUploadingAvatar(true);
        const uploadRes = await uploadService.uploadImage(avatarFile, 'profile_photo');
        const uploaded = (uploadRes as any).data;
        uploadedAvatarUrl = uploaded.url;
        setUploadingAvatar(false);
        toast.loading('Saving profile changes…', { id: toastId });
      }

      await customerService.updateProfile({
        fullName, phone,
        ...(uploadedAvatarUrl ? { avatarUrl: uploadedAvatarUrl } : {}),
      });

      if (uploadedAvatarUrl) setAvatarUrl(uploadedAvatarUrl);
      setInitial({ fullName, phone });
      setAvatarFile(null);
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
      toast.success('Profile updated successfully!', { id: toastId });
    } catch (err) {
      setUploadingAvatar(false);
      toast.error(err instanceof Error ? err.message : 'Failed to update profile', { id: toastId });
    } finally {
      setSaving(false);
      setUploadingAvatar(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading..." />;

  const displayedAvatar = avatarPreview || avatarUrl;

  return (
    <div className="max-w-[520px]">
      <div className="mb-5">
        <h1 className="text-xl font-extrabold text-text-primary m-0 mb-1 tracking-tight">Your account</h1>
        <p className="text-[13px] text-text-muted m-0">
          Personal details tied to your login — separate from your business profile
        </p>
      </div>

      {/* Avatar card */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-4 flex items-center gap-4">
        <div className="relative shrink-0">
          <div className={`w-14 h-14 rounded-full bg-brand flex items-center justify-center overflow-hidden
            transition-opacity ${uploadingAvatar ? 'opacity-50' : 'opacity-100'}`}>
            {displayedAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayedAvatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-star text-xl font-black">
                {(fullName || user?.email || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {uploadingAvatar && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 size={18} className="text-white animate-spin" />
            </div>
          )}

          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={saving}
            aria-label="Change profile photo"
            className={`absolute -bottom-0.5 -right-0.5 w-[22px] h-[22px] rounded-full bg-text-primary
              border-2 border-card flex items-center justify-center ${saving ? 'cursor-wait' : 'cursor-pointer'}`}>
            {uploadingAvatar
              ? <Loader2 size={10} className="text-white animate-spin" />
              : <Camera size={10} className="text-white" />}
          </button>

          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
            className="hidden" onChange={handleAvatarSelect} />
        </div>

        <div>
          <p className="text-[13px] font-bold text-text-primary m-0">{fullName || 'Your Name'}</p>
          <p className="text-xs text-text-muted mt-0.5 mb-0">{user?.email}</p>

          {avatarFile && (
            <p className="text-[11px] text-text-secondary mt-1 mb-0">
              Photo selected — save changes to apply
            </p>
          )}

          {verified && (
            <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-success">
              <CheckCircle size={11} /> Verified
            </span>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="bg-card border border-border rounded-2xl p-5">
        <div className="mb-3.5">
          <label className="text-xs font-semibold text-text-secondary block mb-1.5">Full name</label>
          <input
            className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none
              bg-card box-border font-sans focus:border-brand transition-colors"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            disabled={saving}
          />
        </div>

        <div className="mb-3.5">
          <label className="text-xs font-semibold text-text-secondary block mb-1.5">Email</label>
          <input
            className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none
              bg-surface-muted text-text-muted cursor-not-allowed box-border font-sans"
            value={user?.email ?? ''}
            disabled
          />
          <p className="text-[11px] text-text-muted mt-1">Email cannot be changed</p>
        </div>

        <div className={isDirty ? 'mb-[18px]' : 'mb-0'}>
          <label className="text-xs font-semibold text-text-secondary block mb-1.5">Phone</label>
          <input
            className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none
              bg-card box-border font-sans focus:border-brand transition-colors"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+254 7XX XXX XXX"
            disabled={saving}
          />
        </div>

        <div className={`overflow-hidden transition-all duration-250 ease-in-out
          ${isDirty ? 'max-h-[60px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <button type="submit" disabled={saving || !isDirty}
            className={`w-full py-2.5 px-[22px] border-none rounded-lg text-white text-[13px] font-bold
              flex items-center justify-center gap-1.5
              ${saving ? 'bg-text-muted cursor-wait' : 'bg-text-primary cursor-pointer'}`}>
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                {uploadingAvatar ? 'Uploading photo…' : 'Saving changes…'}
              </>
            ) : (
              <>
                <Save size={13} />
                Save changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}