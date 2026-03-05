"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { listingsService } from '../../../../lib/api/endpoints';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  Edit, Trash2, Eye, Pause, Play, Calendar,
  MapPin, Users, DollarSign, Star, AlertCircle,
  ArrowLeft, CheckCircle, Tag, Wifi, ImageOff,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ListingData {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  category?: string;
  status: 'draft' | 'active' | 'paused' | 'deleted';
  // Flat fields — backend does NOT return a nested location object
  location?: string;
  address?: string;
  city?: string;
  county?: string;
  basePrice?: number;
  currency?: string;
  capacity?: number;
  rating?: number;
  reviewCount?: number;
  views?: number;
  bookingsCount?: number;
  amenities?: string[];
  photos?: string[];
  coverPhoto?: string;
  instantBooking?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

function DeleteModal({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <Trash2 size={16} className="text-red-500" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Delete listing?</h3>
        </div>
        <p className="text-xs text-gray-500 mb-5">
          This action cannot be undone. The listing will be permanently removed along with all its bookings history.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2 text-xs font-bold bg-red-500 hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Deleting...</>
            ) : (
              'Delete Listing'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string; dot: string }> = {
    active:  { label: 'Published', className: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
    paused:  { label: 'Paused',    className: 'bg-amber-50 text-amber-700',     dot: 'bg-amber-400'  },
    draft:   { label: 'Draft',     className: 'bg-gray-100 text-gray-500',      dot: 'bg-gray-400'   },
    deleted: { label: 'Deleted',   className: 'bg-red-50 text-red-400',         dot: 'bg-red-300'    },
  };
  const c = config[status] ?? config.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${c.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

// ─── Detail Item ──────────────────────────────────────────────────────────────

function DetailItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
      <div className="w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
        <Icon size={13} className="text-[#2D3B45]" />
      </div>
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-xs font-bold text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VendorListingDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const id      = params.id as string;

  const [listing,      setListing]      = useState<ListingData | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [deleting,     setDeleting]     = useState(false);
  const [toggling,     setToggling]     = useState(false);
  const [showDelete,   setShowDelete]   = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchListing = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listingsService.getById(id);
      // Handle both { data: {...} } and direct object
      const data = (response as any).data ?? response;
      setListing(data);
    } catch (err) {
      setError('Failed to load listing. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchListing(); }, [fetchListing]);

  // ── Toggle publish / pause ─────────────────────────────────────────────────

  const handleToggleStatus = async () => {
    if (!listing || toggling) return;
    const newStatus = listing.status === 'active' ? 'paused' : 'active';
    setToggling(true);
    try {
      await listingsService.updateStatus(id, newStatus);
      setListing(prev => prev ? { ...prev, status: newStatus } : prev);
      toast.success(newStatus === 'active' ? 'Listing published' : 'Listing paused');
    } catch (err) {
      toast.error('Failed to update listing status');
    } finally {
      setToggling(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await listingsService.delete(id);
      toast.success('Listing deleted');
      router.push('/vendor/listings');
    } catch (err) {
      toast.error('Failed to delete listing');
      setDeleting(false);
      setShowDelete(false);
    }
  };

  // ── Derived values ─────────────────────────────────────────────────────────

  const photos    = listing?.photos ?? [];
  const city      = listing?.city ?? listing?.location ?? '—';
  const address   = listing?.address;
  const amenities = listing?.amenities ?? [];

  // ── States ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Loading listing..." />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={22} className="text-red-400" />
          </div>
          <p className="text-sm font-bold text-gray-800 mb-1">Failed to load listing</p>
          <p className="text-xs text-gray-400 mb-5">{error ?? 'Listing not found'}</p>
          <div className="flex gap-2">
            <button onClick={fetchListing}
              className="flex-1 py-2 text-xs font-bold bg-[#2D3B45] text-white rounded-lg hover:bg-[#3a4d5a] transition">
              Retry
            </button>
            <Link href="/vendor/listings"
              className="flex-1 py-2 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition text-center">
              Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Delete confirm modal */}
      {showDelete && (
        <DeleteModal
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          loading={deleting}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5" style={{ fontFamily: 'DM Sans, system-ui, sans-serif' }}>

        {/* ── Back + breadcrumb ── */}
        <div className="flex items-center gap-2">
          <Link href="/vendor/listings"
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-700 transition">
            <ArrowLeft size={13} />
            My Listings
          </Link>
          <span className="text-gray-200">/</span>
          <span className="text-xs font-semibold text-gray-700 truncate max-w-[200px]">{listing.title}</span>
        </div>

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={listing.status} />
              {listing.category && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  <Tag size={9} />
                  {listing.category}
                </span>
              )}
            </div>
            <h1 className="text-lg font-black text-gray-900 leading-tight tracking-tight">
              {listing.title}
            </h1>
            {(address || city !== '—') && (
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <MapPin size={11} />
                {[address, city].filter(Boolean).join(', ')}
              </p>
            )}
          </div>

          {/* Desktop action buttons */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <Link href={`/vendor/listings/${id}/edit`}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-[#2D3B45] text-white rounded-lg hover:bg-[#3a4d5a] transition">
              <Edit size={12} />
              Edit
            </Link>
            <button
              onClick={handleToggleStatus}
              disabled={toggling}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
                listing.status === 'active'
                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                  : 'bg-[#F5C842] text-[#2D3B45] hover:bg-yellow-400'
              }`}
            >
              {toggling ? (
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : listing.status === 'active' ? (
                <><Pause size={12} /> Pause</>
              ) : (
                <><Play size={12} /> Publish</>
              )}
            </button>
            <Link href={`/store/${id}`} target="_blank"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">
              <Eye size={12} />
              Preview
            </Link>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left / main column */}
          <div className="lg:col-span-2 space-y-4">

            {/* Image placeholder — images disabled for now */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="h-48 bg-gray-50 flex flex-col items-center justify-center gap-2 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <ImageOff size={18} className="text-gray-300" />
                </div>
                <p className="text-xs text-gray-400 font-medium">Images coming soon</p>
                <p className="text-[10px] text-gray-300">{photos.length} photo{photos.length !== 1 ? 's' : ''} attached</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">About this listing</p>
              {listing.description ? (
                <p className="text-sm text-gray-600 leading-relaxed">{listing.description}</p>
              ) : (
                <p className="text-xs text-gray-300 italic">No description added yet.</p>
              )}
            </div>

            {/* Details grid */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Details</p>
              <div className="grid grid-cols-2 gap-2">
                <DetailItem icon={MapPin}       label="Location"  value={[city, address].filter(Boolean).join(', ') || '—'} />
                <DetailItem icon={Users}        label="Capacity"  value={listing.capacity ? `${listing.capacity} guests` : '—'} />
                <DetailItem icon={DollarSign}   label="Starting price" value={listing.basePrice ? `KSh ${listing.basePrice.toLocaleString()} ${listing.currency ?? 'KES'}` : '—'} />
                <DetailItem icon={Star}         label="Rating"    value={listing.rating ? `${listing.rating.toFixed(1)} / 5.0 (${listing.reviewCount ?? 0})` : 'No ratings yet'} />
              </div>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Amenities</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {amenities.map((a) => (
                    <div key={a} className="flex items-center gap-2 text-xs text-gray-700">
                      <CheckCircle size={12} className="text-emerald-500 flex-shrink-0" />
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right / sidebar */}
          <div className="space-y-4">

            {/* Action card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Actions</p>

              <Link href={`/vendor/listings/${id}/edit`}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold bg-[#2D3B45] text-white rounded-xl hover:bg-[#3a4d5a] transition">
                <Edit size={13} />
                Edit Listing
              </Link>

              <button
                onClick={handleToggleStatus}
                disabled={toggling}
                className={`w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed ${
                  listing.status === 'active'
                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                    : 'bg-[#F5C842] text-[#2D3B45] hover:bg-yellow-400'
                }`}
              >
                {toggling ? (
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : listing.status === 'active' ? (
                  <><Pause size={13} /> Pause Listing</>
                ) : (
                  <><Play size={13} /> Publish Listing</>
                )}
              </button>

              <Link href={`/vendor/listings/${id}/availability`}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition">
                <Calendar size={13} />
                Manage Availability
              </Link>

              <Link href={`/store/${id}`} target="_blank"
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition">
                <Eye size={13} />
                View Public Page
              </Link>

              <button
                onClick={() => setShowDelete(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-red-500 border border-red-100 hover:bg-red-50 rounded-xl transition"
              >
                <Trash2 size={13} />
                Delete Listing
              </button>
            </div>

            {/* Status tip */}
            <div className={`rounded-2xl p-4 text-xs leading-relaxed ${
              listing.status === 'active'
                ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                : listing.status === 'paused'
                ? 'bg-amber-50 border border-amber-100 text-amber-700'
                : 'bg-blue-50 border border-blue-100 text-blue-700'
            }`}>
              {listing.status === 'active' ? (
                <><strong>Live</strong> — your listing is visible to customers and accepting bookings.</>
              ) : listing.status === 'paused' ? (
                <><strong>Paused</strong> — your listing is hidden. Click Publish to make it visible again.</>
              ) : listing.status === 'deleted' ? (
                <><strong>Deleted</strong> — this listing has been removed.</>
              ) : (
                <><strong>Draft</strong> — publish your listing to start accepting bookings.</>
              )}
            </div>

            {/* Metadata */}
            {(listing.createdAt || listing.updatedAt) && (
              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Info</p>
                {listing.createdAt && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Created</span>
                    <span className="text-gray-700 font-semibold">
                      {new Date(listing.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )}
                {listing.updatedAt && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Last updated</span>
                    <span className="text-gray-700 font-semibold">
                      {new Date(listing.updatedAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile action bar (fixed bottom) ── */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 flex gap-2 z-40">
          <Link href={`/vendor/listings/${id}/edit`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold bg-[#2D3B45] text-white rounded-xl">
            <Edit size={13} /> Edit
          </Link>
          <button
            onClick={handleToggleStatus}
            disabled={toggling}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition ${
              listing.status === 'active'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-[#F5C842] text-[#2D3B45]'
            }`}
          >
            {toggling ? (
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : listing.status === 'active' ? (
              <><Pause size={13} /> Pause</>
            ) : (
              <><Play size={13} /> Publish</>
            )}
          </button>
          <button onClick={() => setShowDelete(true)}
            className="w-10 flex items-center justify-center border border-red-100 text-red-400 rounded-xl hover:bg-red-50 transition">
            <Trash2 size={14} />
          </button>
        </div>

        {/* Bottom padding on mobile so fixed bar doesn't overlap */}
        <div className="sm:hidden h-16" />
      </div>
    </>
  );
}