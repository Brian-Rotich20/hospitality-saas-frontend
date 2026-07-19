'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../lib/auth/auth.context';
import { customerService, uploadService } from '../../../../lib/api/endpoints';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { User, Phone, Mail, Save, Loader2, Camera, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VendorAccountPage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    customerService.getProfile()
      .then(res => {
        const p = (res as any).data;
        setFullName(p.fullName ?? '');
        setPhone(p.phone ?? '');
        setAvatarUrl(p.avatarUrl ?? null);
        setVerified(!!p.verified);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }

    setUploadingAvatar(true);
    try {
      const uploadRes = await uploadService.uploadImage(file, 'profile_photo');
      const uploaded = (uploadRes as any).data;
      await customerService.updateProfile({ avatarUrl: uploaded.url });
      setAvatarUrl(uploaded.url);
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await customerService.updateProfile({ fullName, phone });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB',
    borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff',
    boxSizing: 'border-box' as const, fontFamily: 'inherit',
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 };

  if (loading) return <LoadingSpinner fullPage text="Loading..." />;

  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          Your account
        </h1>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
          Personal details tied to your login — separate from your business profile
        </p>
      </div>

      {/* Avatar card */}
      <div style={{
        background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14,
        padding: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: '#2D3B45',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          }}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: '#F5C842', fontSize: 20, fontWeight: 900 }}>
                {(fullName || user?.email || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            style={{
              position: 'absolute', bottom: -2, right: -2, width: 22, height: 22,
              borderRadius: '50%', background: '#111827', border: '2px solid #fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: uploadingAvatar ? 'wait' : 'pointer',
            }}
          >
            {uploadingAvatar
              ? <Loader2 size={10} color="#fff" className="animate-spin" />
              : <Camera size={10} color="#fff" />}
          </button>
          <input
            ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }} onChange={handleAvatarSelect}
          />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>
            {fullName || 'Your Name'}
          </p>
          <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>{user?.email}</p>
          {verified && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4,
              fontSize: 11, fontWeight: 700, color: '#059669',
            }}>
              <CheckCircle size={11} /> Verified
            </span>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} style={{
        background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: 20,
      }}>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Full name</label>
          <input style={inputStyle} value={fullName} onChange={e => setFullName(e.target.value)}
            placeholder="Your full name" />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Email</label>
          <input style={{ ...inputStyle, background: '#F9FAFB', color: '#9CA3AF', cursor: 'not-allowed' }}
            value={user?.email ?? ''} disabled />
          <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Email cannot be changed</p>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Phone</label>
          <input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="+254 7XX XXX XXX" />
        </div>

        <button type="submit" disabled={saving} style={{
          width: '100%', padding: '10px 22px', border: 'none', borderRadius: 9,
          background: saving ? '#9CA3AF' : '#111827', color: '#fff',
          fontSize: 13, fontWeight: 700, cursor: saving ? 'wait' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <Save size={13} /> {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}