'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { listingsService } from '../../../../lib/api/endpoints';
import {availabilityService} from '../../../../lib/api/endpoints';
import { Listing } from '../../../../lib/types';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { Calendar, AlertCircle } from 'lucide-react';

export default function AvailabilityPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [blockedDates, setBlockedDates] = useState<string[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchListing();
    }, [id]);

    const fetchListing = async () => {
        try {
            const response = await availabilityService.getById(id);
            setListing(response.data);
        } catch (err) {
            console.error('Error fetching listing:', err);
            setError('Failed to load listing');
        } finally {
            setLoading(false);
        }
    };

    const handleBlockDates = async () => {
        if (!startDate || !endDate) {
            setError('Please select both start and end dates');
            return;
        }

        try {
            await listingsService.blockDates(id, {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            });

            setBlockedDates([...blockedDates, startDate, endDate]);
            setStartDate('');
            setEndDate('');
            setError(null);
        } catch (err) {
            setError('Failed to block dates');
        }
    };

    const handleUnblockDates = async (date: string) => {
        try {
            await listingsService.unblockDates(id, {
                date: new Date(date),
            });

            setBlockedDates(blockedDates.filter((d) => d !== date));
        } catch (err) {
            setError('Failed to unblock date');
        }
    };

if (loading) {
    return <div>Loading...</div>;
}

if (!listing) {
    return (
        <div className="p-6">
            <p>Listing not found</p>
        </div>
    );
}

return (
    <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
            <h1 className="text-3xl font-bold">Availability</h1>
            <p className="text-gray-600 mt-2">Manage when your listing is available for bookings</p>
        </div>

        {/* Error Alert */}
        {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded">
                <p className="text-red-700">{error}</p>
            </div>
        )}

        {/* Block Dates Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Block Dates</h2>
            <p className="text-gray-600 mb-4">Select dates when your listing should not be available for bookings</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium mb-2">From Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">To Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </div>

            <button
                onClick={handleBlockDates}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
                Block Dates
            </button>
        </div>

        {/* Calendar View */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Calendar View</h2>
            <p className="text-gray-600">Coming Soon: Interactive calendar will be added here for better visualization of blocked dates.</p>
        </div>

        {/* Blocked Dates List */}
        {blockedDates.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Blocked Dates</h2>
                <div className="space-y-2">
                    {blockedDates.map((date) => (
                        <div key={date} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span>{date}</span>
                            <button
                                onClick={() => handleUnblockDates(date)}
                                className="text-red-600 hover:text-red-700 font-semibold text-sm"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
);
}