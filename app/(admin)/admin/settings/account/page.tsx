// app/(vendor)/vendor/settings/account/page.tsx

'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

import { useAuth } from '../../../../lib/auth/auth.context';

import { customerService, uploadService } from '../../../../lib/api/endpoints';

import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';

import {
  Save,
  Loader2,
  Camera,
  CheckCircle,
} from 'lucide-react';

import toast from 'react-hot-toast';

export default function VendorAccountPage() {
  const { user } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // New avatar selected by the user but not yet saved
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [verified, setVerified] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Snapshot of last-saved values
  const [initial, setInitial] = useState({
    fullName: '',
    phone: '',
  });

  useEffect(() => {
    customerService
      .getProfile()
      .then((res) => {
        const p = (res as any).data;

        const loadedName = p.fullName ?? '';
        const loadedPhone = p.phone ?? '';

        setFullName(loadedName);
        setPhone(loadedPhone);
        setAvatarUrl(p.avatarUrl ?? null);
        setVerified(!!p.verified);

        setInitial({
          fullName: loadedName,
          phone: loadedPhone,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Clean up local preview URL when replaced/unmounted
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const isDirty = useMemo(
    () =>
      fullName !== initial.fullName ||
      phone !== initial.phone ||
      avatarFile !== null,
    [fullName, phone, avatarFile, initial]
  );

  const handleAvatarSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      return;
    }

    // Revoke previous preview before creating a new one
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setAvatarFile(file);
    setAvatarPreview(previewUrl);

    // Allow selecting the same file again later
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isDirty || saving) return;

    setSaving(true);

    const toastId = toast.loading(
      avatarFile ? 'Uploading profile photo…' : 'Saving changes…'
    );

    try {
      let uploadedAvatarUrl: string | undefined;

      // Upload the new avatar only when Save is clicked
      if (avatarFile) {
        setUploadingAvatar(true);

        const uploadRes = await uploadService.uploadImage(
          avatarFile,
          'profile_photo'
        );

        const uploaded = (uploadRes as any).data;

        uploadedAvatarUrl = uploaded.url;

        setUploadingAvatar(false);

        toast.loading('Saving profile changes…', {
          id: toastId,
        });
      }

      await customerService.updateProfile({
        fullName,
        phone,
        ...(uploadedAvatarUrl
          ? { avatarUrl: uploadedAvatarUrl }
          : {}),
      });

      // Update the saved avatar
      if (uploadedAvatarUrl) {
        setAvatarUrl(uploadedAvatarUrl);
      }

      // Reset the dirty state
      setInitial({
        fullName,
        phone,
      });

      setAvatarFile(null);

      // Remove local preview because the saved image is now the source
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }

      setAvatarPreview(null);

      toast.success('Profile updated successfully!', {
        id: toastId,
      });
    } catch (err) {
      setUploadingAvatar(false);

      toast.error(
        err instanceof Error
          ? err.message
          : 'Failed to update profile',
        {
          id: toastId,
        }
      );
    } finally {
      setSaving(false);
      setUploadingAvatar(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    fontSize: 13,
    outline: 'none',
    background: '#fff',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
  };

  const labelStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: '#374151',
    display: 'block',
    marginBottom: 6,
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Loading..." />;
  }

  const displayedAvatar = avatarPreview || avatarUrl;

  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: '#111827',
            margin: '0 0 4px',
            letterSpacing: '-0.02em',
          }}
        >
          Your account
        </h1>

        <p
          style={{
            fontSize: 13,
            color: '#6B7280',
            margin: 0,
          }}
        >
          Personal details tied to your login — separate from your business
          profile
        </p>
      </div>

      {/* Avatar card */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #E5E7EB',
          borderRadius: 14,
          padding: 20,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#2D3B45',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              opacity: uploadingAvatar ? 0.5 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {displayedAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayedAvatar}
                alt="Profile"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <span
                style={{
                  color: '#F5C842',
                  fontSize: 20,
                  fontWeight: 900,
                }}
              >
                {(fullName || user?.email || 'U')
                  .charAt(0)
                  .toUpperCase()}
              </span>
            )}
          </div>

          {uploadingAvatar && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Loader2
                size={18}
                color="#fff"
                className="animate-spin"
              />
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={saving}
            aria-label="Change profile photo"
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: '#111827',
              border: '2px solid #fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: saving ? 'wait' : 'pointer',
            }}
          >
            {uploadingAvatar ? (
              <Loader2
                size={10}
                color="#fff"
                className="animate-spin"
              />
            ) : (
              <Camera size={10} color="#fff" />
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleAvatarSelect}
          />
        </div>

        <div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#111827',
              margin: 0,
            }}
          >
            {fullName || 'Your Name'}
          </p>

          <p
            style={{
              fontSize: 12,
              color: '#9CA3AF',
              margin: '2px 0 0',
            }}
          >
            {user?.email}
          </p>

          {avatarFile && (
            <p
              style={{
                fontSize: 11,
                color: '#6B7280',
                margin: '4px 0 0',
              }}
            >
              Photo selected — save changes to apply
            </p>
          )}

          {verified && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                marginTop: 4,
                fontSize: 11,
                fontWeight: 700,
                color: '#059669',
              }}
            >
              <CheckCircle size={11} /> Verified
            </span>
          )}
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSave}
        style={{
          background: '#fff',
          border: '1px solid #E5E7EB',
          borderRadius: 14,
          padding: 20,
        }}
      >
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Full name</label>

          <input
            style={inputStyle}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            disabled={saving}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Email</label>

          <input
            style={{
              ...inputStyle,
              background: '#F9FAFB',
              color: '#9CA3AF',
              cursor: 'not-allowed',
            }}
            value={user?.email ?? ''}
            disabled
          />

          <p
            style={{
              fontSize: 11,
              color: '#9CA3AF',
              marginTop: 4,
            }}
          >
            Email cannot be changed
          </p>
        </div>

        <div style={{ marginBottom: isDirty ? 18 : 0 }}>
          <label style={labelStyle}>Phone</label>

          <input
            style={inputStyle}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+254 7XX XXX XXX"
            disabled={saving}
          />
        </div>

        {/* Save button */}
        <div
          style={{
            maxHeight: isDirty ? 60 : 0,
            opacity: isDirty ? 1 : 0,
            overflow: 'hidden',
            transition: 'all 0.25s ease',
          }}
        >
          <button
            type="submit"
            disabled={saving || !isDirty}
            style={{
              width: '100%',
              padding: '10px 22px',
              border: 'none',
              borderRadius: 9,
              background: saving ? '#9CA3AF' : '#111827',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: saving ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                {uploadingAvatar
                  ? 'Uploading photo…'
                  : 'Saving changes…'}
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

