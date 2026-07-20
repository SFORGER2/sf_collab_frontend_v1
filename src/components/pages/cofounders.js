import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRound } from 'lucide-react';

import MatchCard from '@/components/matchmaking/MatchCard';
import { MatchSectionSkeleton } from '@/components/matchmaking/MatchmakingSkeleton';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { useApiRequest } from '@/utils/hooks/useApiRequest';
import { matchmakingAPI } from '@/utils/APIs/matchmakingAPI';
import { mapBackendMatchToCard } from '@/utils/matchMapping';

export default function CoFoundersPage() {
  const navigate = useNavigate();

  const fetchCoFounders = useCallback(
    () => matchmakingAPI.getCoFounders({ explain: 0, limit: 20 }),
    []
  );

  const { data, isLoading, isError, errorInfo, retry } = useApiRequest(
    fetchCoFounders,
    [fetchCoFounders]
  );

  const rawCoFounders = data?.data ?? [];
  const cofounders = Array.isArray(rawCoFounders) ? rawCoFounders.map(mapBackendMatchToCard) : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <MatchSectionSkeleton count={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <ErrorState
          type={errorInfo?.type ?? 'unknown'}
          title={errorInfo?.title}
          message={errorInfo?.message}
          onRetry={retry}
        />
      </div>
    );
  }

  if (cofounders.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <EmptyState
          icon={UserRound}
          title="No co-founder suggestions"
          description="We couldn't find any potential co-founders for you. Complete your profile to improve your matches."
          buttonText="Complete Your Profile"
          onButtonClick={() => navigate('/profile/edit')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader count={cofounders.length} />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cofounders.map((cofounder) => (
          <MatchCard key={cofounder.id} match={cofounder} />
        ))}
      </div>
    </div>
  );
}

function PageHeader({ count }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold text-white">Co-Founder Suggestions</h1>
        <p className="mt-1 text-sm text-slate-400">
          {count != null
            ? `${count} potential co-founder${count !== 1 ? 's' : ''} matched to your profile`
            : 'People who could be your co-founder'}
        </p>
      </div>
    </div>
  );
}