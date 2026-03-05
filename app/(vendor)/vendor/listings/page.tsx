'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth/auth.context';
import { useRouter } from 'next/navigation';
import { listingsService } from '../../../lib/api/endpoints';
import { Listing } from '../../../lib/types';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Plus, Search, Eye, Edit2, Trash2, ToggleLeft, ToggleRight, Package, AlertCircle, CheckCircle } from 'lucide-react';

const STATUS_CFG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  active:  { label: 'Active',  bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
  draft:   { label: 'Draft',   bg: '#F3F4F6', color: '#6B7280', dot: '#9CA3AF' },
  paused:  { label: 'Paused',  bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
  deleted: { label: 'Deleted', bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
};

export default function VendorListingsPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();

  const [listings, setListings]     = useState<Listing[]>([]);
  const [filtered, setFiltered]     = useState<Listing[]>([]);
  const [loading, setLoading]       = useState(true);
  const [actionId, setActionId]     = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [toast, setToast]           = useState<{ msg: string; ok: boolean } | null>(null);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.push('/auth/login'); return; }
    if (!authLoading && user?.role !== 'vendor') { router.push('/dashboard'); }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await listingsService.getMyListings();
      const data: Listing[] = Array.isArray(res.data) ? res.data : (res.data as any)?.data ?? [];
      setListings(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (!authLoading && isAuthenticated) fetchListings(); }, [authLoading, isAuthenticated, fetchListings]);

  useEffect(() => {
    let f = listings;
    if (statusFilter !== 'all') f = f.filter(l => l.status === statusFilter);
    if (search) f = f.filter(l => l.title.toLowerCase().includes(search.toLowerCase()));
    setFiltered(f);
  }, [listings, statusFilter, search]);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggle = async (id: string, current: string) => {
    const next = current === 'active' ? 'paused' : 'active';
    try {
      setActionId(id);
      await listingsService.updateStatus(id, next as any);
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: next as any } : l));
      showToast(`Listing ${next === 'active' ? 'published' : 'paused'}`, true);
    } catch { showToast('Failed to update status', false); }
    finally { setActionId(null); }
  };

  const handleDelete = async (id: string) => {
    try {
      setActionId(id);
      await listingsService.delete(id);
      setListings(prev => prev.filter(l => l.id !== id));
      showToast('Listing deleted', true);
    } catch { showToast('Failed to delete listing', false); }
    finally { setActionId(null); setDeleteTarget(null); }
  };

  if (authLoading) return <LoadingSpinner fullPage text="Loading..." />;

  return (
    <div style={{ fontFamily: 'DM Sans, system-ui, sans-serif' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 100, background: toast.ok ? '#065F46' : '#991B1B', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          {toast.ok ? <CheckCircle size={14} /> : <AlertCircle size={14} />} {toast.msg}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 380, maxWidth: '90vw' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Delete Listing?</h3>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 20px' }}>This action cannot be undone. The listing will be permanently removed.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: 10, border: '1px solid #E5E7EB', borderRadius: 9, fontSize: 13, fontWeight: 600, color: '#374151', background: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteTarget)} disabled={actionId === deleteTarget} style={{ flex: 1, padding: 10, border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, color: '#fff', background: '#EF4444', cursor: 'pointer' }}>
                {actionId === deleteTarget ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.02em' }}>My Listings</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Manage your venues and services</p>
        </div>
        <Link href="/vendor/listings/new" style={{ padding: '9px 18px', background: '#111827', color: '#fff', borderRadius: 9, textDecoration: 'none', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <Plus size={14} /> New Listing
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings..."
            style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: '1px solid #E5E7EB', borderRadius: 9, fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
        </div>
        {/* Status filter */}
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: 9, fontSize: 13, outline: 'none', background: '#fff', color: '#374151', cursor: 'pointer' }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="paused">Paused</option>
        </select>
        <div style={{ padding: '9px 14px', background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 9, fontSize: 12, color: '#6B7280', fontWeight: 600 }}>
          {filtered.length} of {listings.length}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner text="Loading listings..." />
      ) : filtered.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '60px 20px', textAlign: 'center' }}>
          <Package size={36} color="#E5E7EB" style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>
            {listings.length === 0 ? 'No listings yet' : 'No results found'}
          </p>
          <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 20px' }}>
            {listings.length === 0 ? 'Create your first listing to start receiving bookings' : 'Try a different search or filter'}
          </p>
          {listings.length === 0 && (
            <Link href="/vendor/listings/new" style={{ padding: '9px 20px', background: '#111827', color: '#fff', borderRadius: 9, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
              Create First Listing
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(listing => {
            const cfg = STATUS_CFG[listing.status] ?? STATUS_CFG.draft;
            const img = listing.photos?.[0] ?? listing.coverPhoto;
            const isActive = listing.status === 'active';
            return (
              <div key={listing.id} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Thumbnail */}
                <div style={{ width: 56, height: 56, borderRadius: 9, background: '#F3F4F6', overflow: 'hidden', flexShrink: 0 }}>
                  {img
                    ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={20} color="#9CA3AF" /></div>
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
                      {listing.title}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
                      {cfg.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>{listing.city}</span>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>{listing.category.replace('_', ' ')}</span>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>KSh {Number(listing.basePrice).toLocaleString()}</span>
                    {listing.capacity && <span style={{ fontSize: 11, color: '#9CA3AF' }}>Up to {listing.capacity} guests</span>}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <Link href={`/vendor/listings/${listing.id}`} title="View public page" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: '#6B7280' }}>
                    <Eye size={14} />
                  </Link>
                  <Link href={`/vendor/listings/${listing.id}/edit`} title="Edit" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: '#6B7280' }}>
                    <Edit2 size={14} />
                  </Link>
                  <button
                    onClick={() => handleToggle(listing.id, listing.status)}
                    disabled={actionId === listing.id}
                    title={isActive ? 'Pause listing' : 'Publish listing'}
                    style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isActive ? '#F59E0B' : '#10B981' }}>
                    {isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(listing.id)}
                    disabled={actionId === listing.id}
                    title="Delete"
                    style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #FEE2E2', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#EF4444' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}