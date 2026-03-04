'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/auth/auth.context';
import { vendorsService } from '../../../../lib/api/endpoints';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { AlertCircle, CheckCircle, Building2, Phone, MapPin, FileText, Save } from 'lucide-react';

interface VendorProfile {
  id: string;
  businessName: string;
  businessType: string;
  businessRegistration?: string;
  taxPin?: string;
  phoneNumber: string;
  location: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  payoutMethod?: string;
  mpesaNumber?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
}

const BUSINESS_TYPES = [
  { value: 'event_venue', label: 'Event Venue' },
  { value: 'catering', label: 'Catering Service' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'photography', label: 'Photography' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'other', label: 'Other' },
];

const STATUS_CONFIG = {
  pending:   { label: 'Pending Review', bg: '#FEF3C7', color: '#92400E' },
  approved:  { label: 'Approved',       bg: '#D1FAE5', color: '#065F46' },
  rejected:  { label: 'Rejected',       bg: '#FEE2E2', color: '#991B1B' },
  suspended: { label: 'Suspended',      bg: '#F3F4F6', color: '#6B7280' },
};

export default function VendorSettingsProfilePage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'payout'>('profile');

  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    phoneNumber: '',
    location: '',
    description: '',
    businessRegistration: '',
    taxPin: '',
  });

  const [payoutData, setPayoutData] = useState({
    payoutMethod: 'mpesa',
    mpesaNumber: '',
    bankName: '',
    bankAccountName: '',
    bankAccountNumber: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/auth/login');
    if (!authLoading && user?.role !== 'vendor') router.push('/dashboard');
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await vendorsService.getProfile();
        const data = (response.data as any)?.data ?? response.data;
        setProfile(data);
        setFormData({
          businessName: data.businessName ?? '',
          businessType: data.businessType ?? '',
          phoneNumber: data.phoneNumber ?? '',
          location: data.location ?? '',
          description: data.description ?? '',
          businessRegistration: data.businessRegistration ?? '',
          taxPin: data.taxPin ?? '',
        });
        setPayoutData({
          payoutMethod: data.payoutMethod ?? 'mpesa',
          mpesaNumber: data.mpesaNumber ?? '',
          bankName: data.bankName ?? '',
          bankAccountName: data.bankAccountName ?? '',
          bankAccountNumber: data.bankAccountNumber ?? '',
        });
      } catch (err: any) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading && isAuthenticated) fetchProfile();
  }, [authLoading, isAuthenticated]);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError(null);
      await vendorsService.updateProfile(formData);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePayout = async () => {
    try {
      setSaving(true);
      setError(null);
      await vendorsService.addPayoutDetails(payoutData);
      setSuccess('Payout details saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save payout details');
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

  if (authLoading || loading) return <LoadingSpinner fullPage text="Loading..." />;

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Settings
          </h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
            Manage your vendor profile and payout preferences
          </p>
        </div>

        {/* Status banner */}
        {profile?.status && (
          <div style={{
            background: STATUS_CONFIG[profile.status].bg,
            color: STATUS_CONFIG[profile.status].color,
            padding: '10px 16px', borderRadius: 10, fontSize: 12,
            fontWeight: 600, marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <AlertCircle size={14} />
            Account status: {STATUS_CONFIG[profile.status].label}
            {profile.status === 'pending' && ' — Your application is under review'}
          </div>
        )}

        {/* Alerts */}
        {success && (
          <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#065F46', fontWeight: 600 }}>
            <CheckCircle size={14} /> {success}
          </div>
        )}
        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#991B1B', fontWeight: 600 }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #E5E7EB' }}>
          {[
            { key: 'profile', label: 'Business Profile', icon: Building2 },
            { key: 'payout',  label: 'Payout Details',  icon: FileText },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '9px 16px', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 700,
                color: activeTab === tab.key ? '#111827' : '#9CA3AF',
                borderBottom: activeTab === tab.key ? '2px solid #111827' : '2px solid transparent',
                marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <tab.icon size={13} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Business Name *</label>
                <input style={inputStyle} value={formData.businessName}
                  onChange={e => setFormData(p => ({ ...p, businessName: e.target.value }))}
                  placeholder="e.g. Nairobi Grand Venues" />
              </div>
              <div>
                <label style={labelStyle}>Business Type *</label>
                <select style={inputStyle} value={formData.businessType}
                  onChange={e => setFormData(p => ({ ...p, businessType: e.target.value }))}>
                  <option value="">Select type</option>
                  {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Phone Number *</label>
                <input style={inputStyle} value={formData.phoneNumber}
                  onChange={e => setFormData(p => ({ ...p, phoneNumber: e.target.value }))}
                  placeholder="+254 7XX XXX XXX" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Location *</label>
                <input style={inputStyle} value={formData.location}
                  onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Westlands, Nairobi" />
              </div>
              <div>
                <label style={labelStyle}>Business Registration No.</label>
                <input style={inputStyle} value={formData.businessRegistration}
                  onChange={e => setFormData(p => ({ ...p, businessRegistration: e.target.value }))}
                  placeholder="Optional" />
              </div>
              <div>
                <label style={labelStyle}>KRA PIN</label>
                <input style={inputStyle} value={formData.taxPin}
                  onChange={e => setFormData(p => ({ ...p, taxPin: e.target.value }))}
                  placeholder="Optional" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Business Description</label>
                <textarea
                  style={{ ...inputStyle, resize: 'none' as const }} rows={4}
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe your business..." />
              </div>
            </div>
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                style={{
                  padding: '10px 22px', border: 'none', borderRadius: 9,
                  background: saving ? '#9CA3AF' : '#111827', color: '#fff',
                  fontSize: 13, fontWeight: 700, cursor: saving ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <Save size={13} /> {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        )}

        {/* Payout Tab */}
        {activeTab === 'payout' && (
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Payout Method</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {['mpesa', 'bank'].map(method => (
                  <button
                    key={method}
                    onClick={() => setPayoutData(p => ({ ...p, payoutMethod: method }))}
                    style={{
                      flex: 1, padding: '10px', border: `2px solid ${payoutData.payoutMethod === method ? '#111827' : '#E5E7EB'}`,
                      borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      background: payoutData.payoutMethod === method ? '#111827' : '#fff',
                      color: payoutData.payoutMethod === method ? '#fff' : '#374151',
                    }}
                  >
                    {method === 'mpesa' ? '📱 M-Pesa' : '🏦 Bank Transfer'}
                  </button>
                ))}
              </div>
            </div>

            {payoutData.payoutMethod === 'mpesa' && (
              <div>
                <label style={labelStyle}>M-Pesa Number *</label>
                <input style={inputStyle} value={payoutData.mpesaNumber}
                  onChange={e => setPayoutData(p => ({ ...p, mpesaNumber: e.target.value }))}
                  placeholder="+254 7XX XXX XXX" />
              </div>
            )}

            {payoutData.payoutMethod === 'bank' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Bank Name *</label>
                  <input style={inputStyle} value={payoutData.bankName}
                    onChange={e => setPayoutData(p => ({ ...p, bankName: e.target.value }))}
                    placeholder="e.g. Equity Bank" />
                </div>
                <div>
                  <label style={labelStyle}>Account Name *</label>
                  <input style={inputStyle} value={payoutData.bankAccountName}
                    onChange={e => setPayoutData(p => ({ ...p, bankAccountName: e.target.value }))}
                    placeholder="Account holder name" />
                </div>
                <div>
                  <label style={labelStyle}>Account Number *</label>
                  <input style={inputStyle} value={payoutData.bankAccountNumber}
                    onChange={e => setPayoutData(p => ({ ...p, bankAccountNumber: e.target.value }))}
                    placeholder="Account number" />
                </div>
              </div>
            )}

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleSavePayout}
                disabled={saving}
                style={{
                  padding: '10px 22px', border: 'none', borderRadius: 9,
                  background: saving ? '#9CA3AF' : '#111827', color: '#fff',
                  fontSize: 13, fontWeight: 700, cursor: saving ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <Save size={13} /> {saving ? 'Saving...' : 'Save Payout Details'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}