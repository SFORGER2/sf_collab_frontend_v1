import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import MatchCard from '@/components/matchmaking/MatchCard';
import { ConnectionButton } from '../connection/ConnectionButton';
import { matchmakingAPI } from '@/utils/APIs/matchmakingAPI';

const asArray = (value) => (Array.isArray(value) ? value : []);

const pickFirst = (...values) => values.find((value) => value != null && value !== '');

const normalizeSuggestions = (payload) => {
  const root = payload?.data ?? payload ?? {};
  const candidates = [
    root.cofounders,
    root.suggestions,
    root.builders,
    root.results,
    root.items,
    root.data,
    payload?.cofounders,
    payload?.suggestions,
    payload?.results,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
};

const buildMatch = (item, index) => {
  const bio = pickFirst(item?.aiExplanation, item?.bio, item?.description, item?.summary);
  const skills = pickFirst(item?.skills, item?.expertise, item?.skillSet, item?.topSkills);

  return {
    id: pickFirst(item?.id, item?._id, item?.userId, item?.user_id, `cofounder-${index}`),
    kind: 'builder',
    name: pickFirst(item?.name, item?.fullName, item?.displayName, item?.username, 'Unnamed builder'),
    role: pickFirst(item?.role, item?.title, item?.headline, 'Co-founder candidate'),
    matchScore: typeof item?.matchScore === 'number' ? item.matchScore : typeof item?.score === 'number' ? item.score : null,
    aiExplanation: bio,
    avatarUrl: pickFirst(item?.avatarUrl, item?.avatar, item?.profileImage, item?.imageUrl),
    reasons: asArray(item?.reasons),
    meta: {
      ...(skills != null ? { skills } : {}),
      ...(item?.meta && typeof item.meta === 'object' ? item.meta : {}),
    },
  };
};

export default function CofounderSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const loadSuggestions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const payload = await matchmakingAPI.getCofounderSuggestions();
        const items = normalizeSuggestions(payload);

        if (!active) return;
        setSuggestions(items.map(buildMatch));
      } catch (err) {
        if (!active) return;
        setError(err?.response?.data?.message || err?.message || 'Failed to load cofounder suggestions.');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadSuggestions();

    return () => {
      active = false;
    };
  }, []);

  const emptyState = useMemo(() => {
    if (isLoading) return null;
    if (error) return null;
    if (suggestions.length > 0) return null;
    return 'No co-founder suggestions found.';
  }, [error, isLoading, suggestions.length]);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Matchmaking</p>
          <h1 className="text-2xl font-semibold sm:text-3xl">Co-Founder Suggestions</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-400">
            Local-only suggestion view for reviewing builder matches, bios, skills, scores, and reasons.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-slate-300">
            <Loader2 className="size-4 animate-spin text-cyan-300" />
            Loading co-founder suggestions...
          </div>
        )}

        {error && (
          <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-5 text-sm text-red-200">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Unable to load suggestions</p>
            <p className="mt-1 text-red-100/80">{error}</p>
          </div>
        </div>
          </div>
        )}

        {!isLoading && !error && emptyState && (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-slate-300">
            {emptyState}
          </div>
        )}

        {!isLoading && !error && suggestions.length > 0 && (
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {suggestions.map((match) => (
              <div key={String(match.id)} className="space-y-3">
                <MatchCard match={match} />
                {match.id != null && (
                  <div className="flex justify-end">
                    <ConnectionButton userId={match.id} size="sm" className="!text-white !bg-slate-800 !border-slate-600 disabled:!opacity-100" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
