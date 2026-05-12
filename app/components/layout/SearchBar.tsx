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
    <div style={{
      backgroundColor: 'var(--color-card)',
      borderBottom: '1px solid var(--color-border)',
      paddingBlock: '12px',
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-center">
        <div className="search-wrapper w-full max-w-2xl">

          {/* Input */}
          <div className="flex items-center gap-2 flex-1 px-4 py-2.5 min-w-0">
            <MapPin size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search by location or keyword…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="flex-1 text-sm bg-transparent outline-none min-w-0"
              style={{
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-sans)',
              }}
            />
          </div>

          <div className="search-divider" />

          {/* Date filter */}
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-2.5
            transition-colors whitespace-nowrap shrink-0 text-xs"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
            <Calendar size={13} style={{ color: 'var(--color-text-muted)' }} />
            Any Date
          </button>

          <div className="hidden sm:block search-divider" />

          {/* Search button */}
          <button onClick={handleSearch} className="search-btn">
            <Search size={14} />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>
    </div>
  );
}