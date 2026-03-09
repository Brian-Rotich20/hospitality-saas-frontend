'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar } from 'lucide-react';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (query.trim())
      router.push(`/store?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="bg-white border-b border-gray-100 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-center">
        <div className="flex items-center w-full max-w-2xl bg-white border border-gray-200
          rounded-2xl shadow-sm overflow-hidden hover:border-gray-300
          focus-within:border-[#2D3B45] focus-within:shadow-[0_0_0_3px_rgba(45,59,69,0.08)] transition-all">

          <div className="flex items-center gap-2 flex-1 px-4 py-2.5 min-w-0">
            <MapPin size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by location or keyword…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="flex-1 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none min-w-0"
            />
          </div>

          <div className="w-px h-6 bg-gray-200 shrink-0" />

          <button className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 text-xs text-gray-500
            hover:text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap shrink-0">
            <Calendar size={13} className="text-gray-400" />
            Any Date
          </button>

          <div className="hidden sm:block w-px h-6 bg-gray-200 shrink-0" />

          <button
            onClick={handleSearch}
            className="flex items-center gap-1.5 px-4 py-2.5 m-1 bg-[#2D3B45] text-white
              text-xs font-bold rounded-xl hover:bg-[#3a4d5a] transition-colors shrink-0 whitespace-nowrap">
            <Search size={14} />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>
    </div>
  );
}