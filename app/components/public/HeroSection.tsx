'use client';

import React from 'react';
import Link from 'next/link';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function HeroSection() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({
    search: '',
    location: '',
    startDate: '',
    guests: '',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const query = new URLSearchParams();
    if (searchParams.search) query.append('search', searchParams.search);
    if (searchParams.location) query.append('city', searchParams.location);
    if (searchParams.guests) query.append('capacity', searchParams.guests);

    router.push(`/listings?${query.toString()}`);
  };

  return (
    <div className="relative bg-linear-to-r from-primary-600 to-primary-800 py-20 md:py-32">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-pattern"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Content */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Find Your Perfect Venue
          </h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Discover Kenya's finest event venues, catering services, and accommodations
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-2xl p-8 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What are you looking for?
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Venue, catering, accommodation..."
                  value={searchParams.search}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, search: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Location Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="City"
                  value={searchParams.location}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, location: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Date Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input
                  type="date"
                  value={searchParams.startDate}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, startDate: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Guests Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guests
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input
                  type="number"
                  placeholder="Number"
                  min="1"
                  value={searchParams.guests}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, guests: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
}