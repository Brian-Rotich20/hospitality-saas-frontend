'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import { KENYA_COUNTIES } from './constants';
import { field, Label, Err } from './FormAtoms';

interface NominatimResult {
  place_id: number;
  display_name: string;
  address: {
    suburb?: string;
    neighbourhood?: string;
    quarter?: string;
    city_district?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
  };
  lat: string;
  lon: string;
}

function extractAreaLabel(r: NominatimResult): string {
  const a = r.address;
  return (
    a.suburb ?? a.neighbourhood ?? a.quarter ?? a.city_district ?? a.town ?? a.village ??
    r.display_name.split(',')[0].trim()
  );
}

/**
 * NOTE — scaling concern: this hits Nominatim's free endpoint directly from
 * the client. Their usage policy caps this at 1 req/sec and disallows heavy
 * commercial autocomplete. At vendor volume this should be proxied through
 * your own backend with a Redis/Postgres cache of common Kenyan areas, and
 * only fall through to Nominatim on a cache miss. Left as-is here since it's
 * a backend change, not a UI one — flagging it so it doesn't get lost.
 */
function useAreaSearch(county: string) {
  const [query, setQuery]             = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [loading, setLoading]         = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!query || query.length < 2 || !county) {
      setSuggestions([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: `${query}, ${county}, Kenya`,
          format: 'json',
          addressdetails: '1',
          limit: '6',
          countrycodes: 'ke',
          'accept-language': 'en',
        });

        const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
          headers: { 'User-Agent': 'LinkMart/1.0' },
        });
        const data: NominatimResult[] = await res.json();

        const seen = new Set<string>();
        const unique = data.filter(r => {
          const label = extractAreaLabel(r);
          if (seen.has(label)) return false;
          seen.add(label);
          return true;
        });

        setSuggestions(unique);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query, county]);

  return { query, setQuery, suggestions, setSuggestions, loading };
}

export function LocationPicker({
  county, area, onCounty, onArea, errors,
}: {
  county: string;
  area: string;
  onCounty: (v: string) => void;
  onArea: (v: string, lat?: number, lng?: number) => void;
  errors: { county?: { message?: string }; area?: { message?: string } };
}) {
  const { query, setQuery, suggestions, setSuggestions, loading } = useAreaSearch(county);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pickArea = (r: NominatimResult) => {
    const label = extractAreaLabel(r);
    onArea(label, parseFloat(r.lat), parseFloat(r.lon));
    setQuery(label);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div className="space-y-3">
      <div>
        <Label req>County</Label>
        <div className="relative">
          <MapPin size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
          <select
            value={county}
            onChange={e => { onCounty(e.target.value); onArea(''); setQuery(''); }}
            className={`${field(!!errors.county)} pl-8 cursor-pointer appearance-none`}
          >
            <option value="">Select county…</option>
            {KENYA_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <Err msg={errors.county?.message} />
      </div>

      {county && (
        <div ref={wrapRef} className="relative">
          <Label req>Area / Estate</Label>
          <div className="relative">
            <MapPin size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
            {loading && <Loader2 size={13} className="absolute right-3 top-3 text-gray-400 animate-spin" />}
            <input
              value={area || query}
              placeholder={`Search area in ${county}…`}
              onChange={e => { setQuery(e.target.value); onArea(e.target.value); setOpen(true); }}
              onFocus={() => suggestions.length > 0 && setOpen(true)}
              className={`${field(!!errors.area)} pl-8 pr-8`}
              autoComplete="off"
            />
          </div>
          <Err msg={errors.area?.message} />

          {open && suggestions.length > 0 && (
            <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200
              rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
              {suggestions.map(r => {
                const label = extractAreaLabel(r);
                return (
                  <li key={r.place_id}>
                    <button
                      type="button"
                      onMouseDown={() => pickArea(r)}
                      className="w-full flex items-start gap-2 px-3 py-2.5 hover:bg-gray-50
                        text-left transition-colors"
                    >
                      <MapPin size={12} className="text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{label}</p>
                        <p className="text-[10px] text-gray-400 truncate max-w-xs">{r.display_name}</p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {open && query.length >= 2 && suggestions.length === 0 && !loading && (
            <p className="text-[11px] text-gray-400 mt-1">
              No areas found — try a different spelling or type the name directly.
            </p>
          )}
        </div>
      )}
    </div>
  );
}