// components/admin/VendorManagementClient.tsx
// ✅ Client Component — tabs, search, approve/reject actions
'use client';

import { useState, useMemo }  from 'react';
import { useRouter }          from 'next/navigation';
import { adminService }       from '../../lib/api/endpoints';
import {
  Search, CheckCircle, XCircle, Eye, Building2,
  Clock, AlertCircle, Ban, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

type VendorStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

interface Vendor {
  id:              string;
  businessName:    string;
  description?:    string;
  phoneNumber?:    string;
  city?:           string;
  status:          VendorStatus;
  createdAt:       string;
  user?: {
    fullName?: string;
    email?:    string;
  };
}

const STATUS: Record<VendorStatus, { badge: string; dot: string; label: string }> = {
  pending:   { badge: 'bg-amber-50 text-amber-700',   dot: 'bg-amber-400',   label: 'Pending'   },
  approved:  { badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', label: 'Approved' },
  rejected:  { badge: 'bg-red-50 text-red-700',       dot: 'bg-red-500',     label: 'Rejected'  },
  suspended: { badge: 'bg-gray-100 text-gray-600',    dot: 'bg-gray-400',    label: 'Suspended' },
};

const TABS: { key: string; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'pending',   label: 'Pending'   },
  { key: 'approved',  label: 'Approved'  },
  { key: 'rejected',  label: 'Rejected'  },
  { key: 'suspended', label: 'Suspended' },
];

// ── Rejection modal ───────────────────────────────────────────────────────────
function RejectModal({
  vendor, onConfirm, onCancel, loading,
}: {
  vendor:    Vendor;
  onConfirm: (reason: string) => void;
  onCancel:  () => void;
  loading:   boolean;
}) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-base font-black text-gray-900 mb-1">Reject Vendor Application</h3>
        <p className="text-xs text-gray-500 mb-4">
          Rejecting <strong>{vendor.businessName}</strong>. Provide a reason so the vendor understands why.
        </p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Insufficient business documentation provided..."
          rows={3}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl resize-none
            focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent mb-4"
        />
        <div className="flex gap-2">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600
              hover:border-gray-400 transition disabled:opacity-50">
            Cancel
          </button>
          <button onClick={() => onConfirm(reason)} disabled={loading || !reason.trim()}
            className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-xs font-bold
              hover:bg-red-600 transition disabled:opacity-50">
            {loading ? 'Rejecting...' : 'Reject Vendor'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Suspend modal ─────────────────────────────────────────────────────────────
function SuspendModal({
  vendor, onConfirm, onCancel, loading,
}: {
  vendor:    Vendor;
  onConfirm: (reason: string) => void;
  onCancel:  () => void;
  loading:   boolean;
}) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-base font-black text-gray-900 mb-1">Suspend Vendor</h3>
        <p className="text-xs text-gray-500 mb-4">
          Suspending <strong>{vendor.businessName}</strong> will hide all their listings.
        </p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Multiple complaints received from customers..."
          rows={3}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl resize-none
            focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent mb-4"
        />
        <div className="flex gap-2">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600
              hover:border-gray-400 transition disabled:opacity-50">
            Cancel
          </button>
          <button onClick={() => onConfirm(reason)} disabled={loading || !reason.trim()}
            className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-bold
              hover:bg-amber-600 transition disabled:opacity-50">
            {loading ? 'Suspending...' : 'Suspend Vendor'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function VendorManagementClient({ initialVendors }: { initialVendors: Vendor[] }) {
  const router                    = useRouter();
  const [vendors,   setVendors]   = useState<Vendor[]>(initialVendors);
  const [tab,       setTab]       = useState('all');
  const [search,    setSearch]    = useState('');
  const [actionId,  setActionId]  = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Vendor | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<Vendor | null>(null);

  const filtered = useMemo(() => vendors.filter(v => {
    const matchTab    = tab === 'all' || v.status === tab;
    const matchSearch = !search ||
      v.businessName.toLowerCase().includes(search.toLowerCase()) ||
      v.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      v.user?.fullName?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  }), [vendors, tab, search]);

  const counts = useMemo(() => ({
    all:       vendors.length,
    pending:   vendors.filter(v => v.status === 'pending').length,
    approved:  vendors.filter(v => v.status === 'approved').length,
    rejected:  vendors.filter(v => v.status === 'rejected').length,
    suspended: vendors.filter(v => v.status === 'suspended').length,
  }), [vendors]);

  const updateVendor = (id: string, updates: Partial<Vendor>) =>
    setVendors(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));

  // ── Approve ───────────────────────────────────────────────────────────────
  const handleApprove = async (vendor: Vendor) => {
    try {
      setActionId(vendor.id);
      await adminService.reviewVendor(vendor.id, 'approved');
      updateVendor(vendor.id, { status: 'approved' });
      toast.success(`${vendor.businessName} approved`);
      router.refresh(); // refresh server data
    } catch {
      toast.error('Failed to approve vendor');
    } finally {
      setActionId(null);
    }
  };

  // ── Reject ────────────────────────────────────────────────────────────────
  const handleReject = async (reason: string) => {
    if (!rejectTarget) return;
    try {
      setActionId(rejectTarget.id);
      await adminService.reviewVendor(rejectTarget.id, 'rejected', reason);
      updateVendor(rejectTarget.id, { status: 'rejected' });
      toast.success(`${rejectTarget.businessName} rejected`);
      router.refresh();
    } catch {
      toast.error('Failed to reject vendor');
    } finally {
      setActionId(null);
      setRejectTarget(null);
    }
  };

  // ── Suspend ───────────────────────────────────────────────────────────────
  const handleSuspend = async (reason: string) => {
    if (!suspendTarget) return;
    try {
      setActionId(suspendTarget.id);
      await adminService.suspendVendor(suspendTarget.id, reason);
      updateVendor(suspendTarget.id, { status: 'suspended' });
      toast.success(`${suspendTarget.businessName} suspended`);
      router.refresh();
    } catch {
      toast.error('Failed to suspend vendor');
    } finally {
      setActionId(null);
      setSuspendTarget(null);
    }
  };

  // ── Re-approve suspended/rejected ─────────────────────────────────────────
  const handleReactivate = async (vendor: Vendor) => {
    try {
      setActionId(vendor.id);
      await adminService.reviewVendor(vendor.id, 'approved');
      updateVendor(vendor.id, { status: 'approved' });
      toast.success(`${vendor.businessName} reactivated`);
      router.refresh();
    } catch {
      toast.error('Failed to reactivate vendor');
    } finally {
      setActionId(null);
    }
  };

  return (
    <>
      {/* Modals */}
      {rejectTarget && (
        <RejectModal
          vendor={rejectTarget}
          onConfirm={handleReject}
          onCancel={() => setRejectTarget(null)}
          loading={actionId === rejectTarget.id}
        />
      )}
      {suspendTarget && (
        <SuspendModal
          vendor={suspendTarget}
          onConfirm={handleSuspend}
          onCancel={() => setSuspendTarget(null)}
          loading={actionId === suspendTarget.id}
        />
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 w-fit flex-wrap">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5
              ${tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black
              ${tab === key ? 'bg-[#2D3B45] text-white' : 'bg-gray-200 text-gray-500'}`}>
              {counts[key as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search vendors..."
          className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl bg-white
            outline-none focus:border-[#2D3B45] transition placeholder-gray-400" />
      </div>

      {/* Pending alert */}
      {tab === 'all' && counts.pending > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
          <AlertCircle size={14} className="text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700 font-semibold flex-1">
            {counts.pending} vendor{counts.pending > 1 ? 's' : ''} waiting for approval
          </p>
          <button onClick={() => setTab('pending')}
            className="text-xs font-bold text-amber-600 hover:text-amber-800 transition">
            View pending →
          </button>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
          <Building2 size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-700 mb-1">No vendors found</p>
          <p className="text-xs text-gray-400">
            {search ? 'Try a different search term' : `No ${tab === 'all' ? '' : tab} vendors yet`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(vendor => {
            const cfg     = STATUS[vendor.status] ?? STATUS.pending;
            const loading = actionId === vendor.id;

            return (
              <div key={vendor.id}
                className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-start gap-4 flex-wrap">

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-[#2D3B45] flex items-center justify-center shrink-0">
                    <span className="text-[#F5C842] text-sm font-black">
                      {vendor.businessName.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-black text-gray-900">{vendor.businessName}</span>
                      <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-[11px] text-gray-400 mb-2">
                      {vendor.user?.fullName && <span>{vendor.user.fullName}</span>}
                      {vendor.user?.email    && <span>{vendor.user.email}</span>}
                      {vendor.phoneNumber    && <span>{vendor.phoneNumber}</span>}
                      {vendor.city           && <span>{vendor.city}</span>}
                      <span>Applied {new Date(vendor.createdAt).toLocaleDateString('en-KE', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}</span>
                    </div>
                    {vendor.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{vendor.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap shrink-0">
                    {vendor.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(vendor)}
                          disabled={loading}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white
                            text-xs font-bold rounded-xl hover:bg-emerald-600 transition disabled:opacity-50">
                          <CheckCircle size={13} />
                          {loading ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => setRejectTarget(vendor)}
                          disabled={loading}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white
                            text-xs font-bold rounded-xl hover:bg-red-600 transition disabled:opacity-50">
                          <XCircle size={13} />
                          Reject
                        </button>
                      </>
                    )}
                    {vendor.status === 'approved' && (
                      <button
                        onClick={() => setSuspendTarget(vendor)}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-amber-200
                          bg-amber-50 text-amber-700 text-xs font-bold rounded-xl
                          hover:bg-amber-100 transition disabled:opacity-50">
                        <Ban size={13} />
                        Suspend
                      </button>
                    )}
                    {(vendor.status === 'rejected' || vendor.status === 'suspended') && (
                      <button
                        onClick={() => handleReactivate(vendor)}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-200
                          bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl
                          hover:bg-emerald-100 transition disabled:opacity-50">
                        <RefreshCw size={13} />
                        {loading ? 'Reactivating...' : 'Reactivate'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}