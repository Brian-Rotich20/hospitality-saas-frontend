// components/admin/VendorManagementClient.tsx
// ✅ Client Component — tabs, search, suspend action
// Vendor lifecycle is now just approved → suspended. There is no pending/
// rejected state and no application/OTP step — vendors are created instantly
// via POST /vendors/become. There is currently no unsuspend/reactivate
// endpoint, so suspension is one-way from this screen.
'use client';

import { useState, useMemo }  from 'react';
import { useRouter }          from 'next/navigation';
import { adminService }       from '../../lib/api/endpoints';
import type { Vendor, VendorStatus } from '../../lib/types/vendor';
import { Search, Building2, Ban } from 'lucide-react';
import toast from 'react-hot-toast';

// GET /admin/vendors joins user account info alongside the base Vendor
// shape — this is admin-list-specific, not part of the canonical Vendor
// type, so it's extended locally here rather than added to lib/types/vendor.ts.
interface AdminVendorRow extends Vendor {
  user?: { fullName?: string; email?: string };
}

const STATUS: Record<VendorStatus, { badge: string; dot: string; label: string }> = {
  approved:  { badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', label: 'Approved'  },
  suspended: { badge: 'bg-gray-100 text-gray-600',      dot: 'bg-gray-400',    label: 'Suspended' },
};

const TABS: { key: string; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'approved',  label: 'Approved'  },
  { key: 'suspended', label: 'Suspended' },
];

// ── Suspend modal ─────────────────────────────────────────────────────────────
// No reason field — adminService.suspendVendor() takes no reason argument
// since the backend no longer stores one. This is a plain confirmation now.
function SuspendModal({
  vendor, onConfirm, onCancel, loading,
}: {
  vendor:    AdminVendorRow;
  onConfirm: () => void;
  onCancel:  () => void;
  loading:   boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-base font-black text-gray-900 mb-1">Suspend Vendor</h3>
        <p className="text-xs text-gray-500 mb-5">
          Suspending <strong>{vendor.businessName}</strong> will hide all their listings.
          There's currently no way to reverse this from here.
        </p>
        <div className="flex gap-2">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600
              hover:border-gray-400 transition disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
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
export function VendorManagementClient({ initialVendors }: { initialVendors: AdminVendorRow[] }) {
  const router                    = useRouter();
  const [vendors,   setVendors]   = useState<AdminVendorRow[]>(initialVendors);
  const [tab,       setTab]       = useState('all');
  const [search,    setSearch]    = useState('');
  const [actionId,  setActionId]  = useState<string | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<AdminVendorRow | null>(null);

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
    approved:  vendors.filter(v => v.status === 'approved').length,
    suspended: vendors.filter(v => v.status === 'suspended').length,
  }), [vendors]);

  const updateVendor = (id: string, updates: Partial<AdminVendorRow>) =>
    setVendors(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));

  // ── Suspend ───────────────────────────────────────────────────────────────
  const handleSuspend = async () => {
    if (!suspendTarget) return;
    try {
      setActionId(suspendTarget.id);
      await adminService.suspendVendor(suspendTarget.id);
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

  return (
    <>
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
            const cfg     = STATUS[vendor.status] ?? STATUS.approved;
            const loading = actionId === vendor.id;

            return (
              <div key={vendor.id}
                className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-start gap-4 flex-wrap">

                  {/* Avatar — uses vendor.logo when present, matches the type now having it */}
                  <div className="w-10 h-10 rounded-xl bg-[#2D3B45] flex items-center justify-center shrink-0 overflow-hidden">
                    {vendor.logo
                      ? <img src={vendor.logo} alt={vendor.businessName} className="w-full h-full object-cover" />
                      : <span className="text-[#F5C842] text-sm font-black">
                          {vendor.businessName.charAt(0).toUpperCase()}
                        </span>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-black text-gray-900">{vendor.businessName}</span>
                      <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                      {vendor.verified && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-[11px] text-gray-400">
                      {vendor.user?.fullName && <span>{vendor.user.fullName}</span>}
                      {vendor.user?.email    && <span>{vendor.user.email}</span>}
                      {vendor.phoneNumber    && <span>{vendor.phoneNumber}</span>}
                      <span>Joined {new Date(vendor.createdAt).toLocaleDateString('en-KE', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}</span>
                    </div>
                  </div>

                  {/* Actions — suspend only, nothing to approve/reject anymore */}
                  <div className="flex gap-2 flex-wrap shrink-0">
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