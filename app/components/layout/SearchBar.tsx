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
    <div className="bg-card border-b border-border py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-center">
        <div className="search-wrapper w-full max-w-2xl">

          <div className="flex items-center gap-2 flex-1 px-4 py-2.5 min-w-0">
            <MapPin size={14} className="text-text-muted shrink-0" />
            <input
              type="text"
              placeholder="Search by location or keyword…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="flex-1 text-sm bg-transparent outline-none min-w-0 text-text-primary font-sans"
            />
          </div>

          <div className="search-divider" />

          <button className="hidden sm:flex items-center gap-1.5 px-3 py-2.5
            transition-colors whitespace-nowrap shrink-0 text-xs
            text-text-muted hover:text-text-secondary">
            <Calendar size={13} className="text-text-muted" />
            Any Date
          </button>

          <div className="hidden sm:block search-divider" />

          <button onClick={handleSearch} className="search-btn">
            <Search size={14} />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>
    </div>
  );
}