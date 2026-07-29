import React, { useState, useEffect, useMemo } from 'react';
import { Globe, Moon, Search, Sun } from 'lucide-react';
import { useSelector } from 'react-redux';
import { TIME_ZONES } from './worldClockZones';
import { CosmosButton } from '@/components/cosmos';

const REGIONS = [
  { value: 'all', label: 'All' },
  { value: 'americas', label: 'Americas' },
  { value: 'europe', label: 'Europe' },
  { value: 'asia', label: 'Asia Pacific' },
  { value: 'africa', label: 'Africa & ME' },
];

const EUROPE = ['UK', 'France', 'Germany', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Switzerland', 'Austria', 'Belgium', 'Portugal', 'Ireland', 'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Bulgaria', 'Greece'];
const AFRICA_ME = ['Egypt', 'South Africa', 'Nigeria', 'Kenya', 'Morocco'];

/**
 * Team clock.
 *
 * Rebuilt as a dense readout rather than a page: one row per city, mono times,
 * and a 24-segment day bar that shows at a glance who is awake. The previous
 * version wrapped four cities in three nested cards with decorative background
 * images and a heading that repeated the widget title.
 */
export default function WorldClock() {
  const { user } = useSelector((state) => state.auth);
  const [now, setNow] = useState(new Date());
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('all');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeAt = (offset) => {
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utc + 3600000 * offset);
  };

  const filtered = useMemo(
    () =>
      TIME_ZONES.filter((zone) => {
        const q = query.toLowerCase();
        const matchesSearch =
          !q || zone.city.toLowerCase().includes(q) || zone.country.toLowerCase().includes(q);

        const matchesRegion =
          region === 'all' ||
          (region === 'americas' && (zone.offset <= 0 || ['Brazil', 'Argentina'].includes(zone.country))) ||
          (region === 'europe' && EUROPE.includes(zone.country)) ||
          (region === 'asia' && zone.offset >= 5 && zone.offset <= 12) ||
          (region === 'africa' && AFRICA_ME.includes(zone.country));

        return matchesSearch && matchesRegion;
      }),
    [query, region]
  );

  const shown = showAll ? filtered : filtered.slice(0, 6);

  return (
    <div className="flex flex-col gap-4">
      {/* Local time — the reference everything else is read against */}
      <div className="flex items-baseline justify-between gap-4 pb-3 border-b border-white/10">
        <div>
          <p className="cosmos-stat-label">Your time</p>
          <p className="font-display text-[1.6rem] text-gold tabular-nums leading-tight">
            {now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
        <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-dim flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" />
          {user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cities…"
            aria-label="Search cities"
            className="w-full pl-9 pr-3 py-2 rounded-full bg-white/[0.04] border border-white/10 text-sm text-star placeholder-dim transition-colors focus:outline-none focus:border-cyan"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {REGIONS.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRegion(r.value)}
              aria-pressed={region === r.value}
              className={`font-mono text-[10px] tracking-[0.14em] uppercase px-2.5 py-1.5 rounded-full border transition-colors ${
                region === r.value
                  ? 'border-cyan/50 text-cyan bg-cyan/10'
                  : 'border-white/10 text-dim hover:text-star hover:border-white/25'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="flex flex-col divide-y divide-white/[0.07]">
        {shown.map(({ city, country, offset, utc, flag }) => {
          const time = timeAt(offset);
          const hours = time.getHours();
          const isDay = hours >= 6 && hours < 18;

          return (
            <div key={`${city}-${utc}`} className="flex items-center gap-3 py-2.5">
              <span className="shrink-0 opacity-90">{flag}</span>

              <span className="min-w-0 flex-1">
                <span className="block text-[0.92rem] text-star truncate leading-tight">{city}</span>
                <span className="block font-mono text-[10px] tracking-[0.1em] uppercase text-dim truncate">
                  {country} · {utc}
                </span>
              </span>

              {/* 24-hour band — the lit segment is local hour there */}
              <span className="hidden sm:flex items-center gap-[2px]" aria-hidden="true">
                {Array.from({ length: 24 }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-[3px] rounded-full transition-colors ${
                      i === hours
                        ? 'h-3.5 bg-gold'
                        : i >= 6 && i < 18
                          ? 'h-2 bg-white/20'
                          : 'h-2 bg-white/[0.07]'
                    }`}
                  />
                ))}
              </span>

              <span className="font-mono text-[0.95rem] text-star tabular-nums shrink-0">
                {time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </span>

              <span
                className={`shrink-0 ${isDay ? 'text-gold' : 'text-violet'}`}
                title={isDay ? 'Daytime' : 'Night'}
              >
                {isDay ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </span>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-dim text-[0.9rem] py-6 text-center">No cities match that search.</p>
      )}

      {filtered.length > 6 && (
        <CosmosButton variant="quiet" size="sm" className="self-start" onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Show fewer' : `Show all ${filtered.length}`}
        </CosmosButton>
      )}
    </div>
  );
}
