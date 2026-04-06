// components/vendor/listings/VendorListingsClient.tsx
// ✅ Client Component — search, filter, toggle status, delete
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { listingsService } from '../../lib/api/endpoints';
import { resolveListingPrice } from '../../lib/types/listing';
import type { Listing } from '../../lib/types/listing';
import {
  Search, Eye, Edit2, Trash2, ToggleLeft, ToggleRight, Package,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS: Record<string, { badge: string; dot: string }> = {
  active:  { badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  draft:   { badge: 'bg-gray-100   text-gray-600',    dot: 'bg-gray-400'    },
  paused:  { badge: 'bg-amber-50   text-amber-700',   dot: 'bg-amber-400'   },
  deleted: { badge: 'bg-red-50     text-red-700',     dot: 'bg-red-500'     },
};

export function VendorListingsClient({ initialListings }: { initialListings: Listing[] }) {
  const [listings,     setListings]  = useState<Listing[]>(initialListings);
  const [search,       setSearch]    = useState('');
  const [statusFilter, setFilter]    = useState('all');
  const [actionId,     setActionId]  = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = useMemo(() =>
    listings.filter(l =>
      (statusFilter === 'all' || l.status === statusFilter) &&
      (!search || l.title.toLowerCase().includes(search.toLowerCase()))
    ), [listings, search, statusFilter]);

  const handleToggle = async (id: string, current: string) => {
    const next = current === 'active' ? 'paused' : 'active';
    try {
      setActionId(id);
      await listingsService.updateStatus(id, next as 'active' | 'paused');
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: next as any } : l));
      toast.success(`Listing ${next === 'active' ? 'published' : 'paused'}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setActionId(id);
      await listingsService.delete(id);
      setListings(prev => prev.filter(l => l.id !== id));
      toast.success('Listing deleted');
    } catch {
      toast.error('Failed to delete listing');
    } finally {
      setActionId(null);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      {/* Delete modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-black text-gray-900 mb-1">Delete listing?</h3>
            <p className="text-xs text-gray-500 mb-5">This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:border-gray-400 transition">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteTarget)} disabled={actionId === deleteTarget}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition disabled:opacity-50">
                {actionId === deleteTarget ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings..."
            className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl bg-white outline-none
              focus:border-[#2D3B45] transition placeholder-gray-400" />
        </div>
        <select value={statusFilter} onChange={e => setFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white outline-none cursor-pointer text-gray-700">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="paused">Paused</option>
        </select>
        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 font-semibold">
          {filtered.length} of {listings.length}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
          <Package size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-700 mb-1">
            {listings.length === 0 ? 'No listings yet' : 'No results found'}
          </p>
          <p className="text-xs text-gray-400 mb-5">
            {listings.length === 0
              ? 'Create your first listing to start receiving bookings'
              : 'Try a different search or filter'}
          </p>
          {listings.length === 0 && (
            <Link href="/vendor/listings/new"
              className="px-4 py-2 bg-[#2D3B45] text-white text-xs font-bold rounded-xl hover:bg-[#3a4d5a] transition no-underline inline-block">
              Create First Listing
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map(listing => {
            const cfg   = STATUS[listing.status] ?? STATUS.draft;
            const img   = listing.photos?.[0] ?? listing.coverPhoto;
            const price = resolveListingPrice(listing);

            return (
              <div key={listing.id}
                className="bg-white border border-gray-100 rounded-2xl px-4 py-3.5 flex items-center gap-4">

                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                  {img
                    ? <img src={img} alt={listing.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <Package size={20} className="text-gray-300" />
                      </div>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-bold text-gray-900 truncate max-w-[220px]">
                      {listing.title}
                    </span>
                    <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${cfg.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {listing.status}
                    </span>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {listing.location?.city && (
                      <span className="text-[11px] text-gray-400">{listing.location.city}</span>
                    )}
                    {listing.category && (
                      <span className="text-[11px] text-gray-400">{listing.category.name}</span>
                    )}
                    <span className="text-[11px] text-gray-400">KSh {price.toLocaleString()}</span>
                    {listing.capacity && (
                      <span className="text-[11px] text-gray-400">Up to {listing.capacity} guests</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 shrink-0">
                  <Link href={`/store/${listing.slug ?? listing.id}`} title="View public page"
                   className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center
                      text-gray-400 hover:text-[#2D3B45] hover:border-[#2D3B45] transition
                      no-underline cursor-pointer">
                    <Eye size={13} />
                  </Link>
                  <Link href={`/vendor/listings/${listing.id}/edit`} title="Edit"
                    className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center
                      text-gray-400 hover:text-[#2D3B45] hover:border-[#2D3B45] transition no-underline">
                    <Edit2 size={13} />
                  </Link>
                  <button
                    onClick={() => handleToggle(listing.id, listing.status)}
                    disabled={actionId === listing.id}
                    title={listing.status === 'active' ? 'Pause' : 'Publish'}
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center transition disabled:opacity-40
                      ${listing.status === 'active'
                        ? 'border-amber-200 text-amber-500 hover:bg-amber-50'
                        : 'border-emerald-200 text-emerald-500 hover:bg-emerald-50'}`}>
                    {listing.status === 'active' ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(listing.id)}
                    disabled={actionId === listing.id}
                    title="Delete"
                    className="w-8 h-8 rounded-xl border border-red-100 bg-red-50 flex items-center justify-center
                      text-red-400 hover:bg-red-100 transition disabled:opacity-40">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}