'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Listing } from '../../lib/types';
import { Booking } from '../../lib/types';
import { Edit, Trash2, Eye, MoreVertical, AlertCircle } from 'lucide-react';

interface VendorListingsTableProps {
  listings: Listing[];
  onDelete: (listingId: string) => Promise<void>;
  onToggleStatus: (listingId: string, status: 'published' | 'paused') => Promise<void>;
  loading?: boolean;
}

export function VendorListingsTable({
  listings,
  onDelete,
  onToggleStatus,
  loading = false,
}: VendorListingsTableProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const bookingCounts = bookings.reduce<Record<string, number>>((acc, b) => {
  acc[b.listingId] = (acc[b.listingId] || 0) + 1;
  return acc;
}, {});

  const handleDelete = async (listingId: string) => {
    setProcessingId(listingId);
    try {
      await onDelete(listingId);
      setDeleteConfirm(null);
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleStatus = async (
    listingId: string,
    currentStatus: string
  ) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    setProcessingId(listingId);
    try {
      await onToggleStatus(listingId, newStatus as 'published' | 'paused');
    } finally {
      setProcessingId(null);
    }
  };

  if (listings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">No Listings Yet</h3>
        <p className="text-gray-600 mb-6">
          Create your first listing to start accepting bookings
        </p>
        <Link
          href="/vendor/my-listings/create"
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold inline-block"
        >
          Create First Listing
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Listings</h2>
          <p className="text-sm text-gray-600 mt-1">
            {listings.length} listing{listings.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link
          href="/vendor/my-listings/create"
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
        >
          + New Listing
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-t border-gray-200">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Title
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Category
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Created
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Bookings
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Price
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => {
              const createdDate = new Date(listing.createdAt);
              const formattedDate = createdDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              const isActive = listing.status === 'published';

              return (
                <tr
                  key={listing.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  {/* Title */}
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 max-w-xs truncate">
                      {listing.title}
                    </p>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold capitalize">
                      {listing.category}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {isActive ? 'Active' : 'Paused'}
                    </span>
                  </td>

                  {/* Created */}
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {formattedDate}
                  </td>

                  {/* Bookings */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        {bookingCounts[listing.id] || 0}
                      </p>
                    </td>
                  {/* Price */}
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">
                      KSh {(listing.startingPrice || 0).toLocaleString()}
                    </p>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenu(openMenu === listing.id ? null : listing.id)
                        }
                        className="p-2 hover:bg-gray-200 rounded-lg transition"
                      >
                        <MoreVertical size={18} className="text-gray-600" />
                      </button>

                      {/* Dropdown Menu */}
                      {openMenu === listing.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <Link
                            href={`/my-listings/${listing.id}`}
                            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 border-b border-gray-200"
                          >
                            <Eye size={16} />
                            <span>View</span>
                          </Link>

                          <Link
                            href={`/my-listings/${listing.id}/edit`}
                            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 border-b border-gray-200"
                          >
                            <Edit size={16} />
                            <span>Edit</span>
                          </Link>

                          <button
                            onClick={() => {
                              handleToggleStatus(listing.id, listing.status);
                              setOpenMenu(null);
                            }}
                            disabled={processingId === listing.id}
                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 border-b border-gray-200 disabled:opacity-50"
                          >
                            {isActive ? '⏸ Pause' : '▶ Activate'}
                          </button>

                          <button
                            onClick={() => {
                              setDeleteConfirm(listing.id);
                              setOpenMenu(null);
                            }}
                            className="w-full text-left flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Listing?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this listing? This action cannot be
              undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={processingId === deleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}