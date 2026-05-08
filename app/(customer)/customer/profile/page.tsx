'use client';

import { useState, useEffect } from 'react';
import { useAuth }         from '../../../lib/auth/auth.context';
import { customerService } from '../.././../lib/api/endpoints';
import { LoadingSpinner }  from '../../../components/common/LoadingSpinner';
import { User, Phone, Mail, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone,    setPhone]    = useState('');
  const [saving,   setSaving]   = useState(false);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    customerService.getProfile()
      .then(res => {
        const p = (res as any).data;
        setFullName(p.fullName ?? '');
        setPhone(p.phone ?? '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-900 tracking-tight mb-0.5">My Profile</h1>
        <p className="text-sm text-gray-500">Update your personal information.</p>
      </div>

      {/* Avatar card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#2D3B45] flex items-center justify-center shrink-0">
          <span className="text-[#F5C842] text-xl font-black">
            {(fullName || user?.email || 'U').charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">{fullName || 'Your Name'}</p>
          <p className="text-xs text-gray-400">{user?.email}</p>
          <p className="text-[10px] font-bold text-emerald-600 mt-0.5 uppercase tracking-wide">
            Customer
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave}
        className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Personal Info
        </p>

        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User size={13} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
            <input value={fullName} onChange={e => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white
                text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2D3B45]
                focus:border-transparent transition" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail size={13} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
            <input value={user?.email ?? ''} disabled
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-100
                bg-gray-50 text-gray-400 cursor-not-allowed" />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed.</p>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
            Phone
          </label>
          <div className="relative">
            <Phone size={13} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
            <input value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="+254 7XX XXX XXX"
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white
                text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2D3B45]
                focus:border-transparent transition" />
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3
            bg-[#2D3B45] text-white text-sm font-black rounded-xl
            hover:bg-[#3a4d5a] transition disabled:opacity-50">
          {saving
            ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
            : <><Save size={13} /> Save Changes</>}
        </button>
      </form>
    </div>
  );
}