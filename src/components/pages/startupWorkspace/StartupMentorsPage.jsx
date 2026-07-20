import React, { useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

import MatchCard from '@/components/matchmaking/MatchCard';
import { MatchSectionSkeleton } from '@/components/matchmaking/MatchmakingSkeleton';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { useApiRequest } from '@/utils/hooks/useApiRequest';
import { startupWorkspaceAPI } from '@/utils/APIs/startupWorkspaceAPI';
import { mapBackendMatchToCard } from '@/utils/matchMapping';

export default function StartupMentorsPage() {
  const { startupId } = useOutletContext();
  const navigate = useNavigate();

  const fetchMentors = useCallback(
    () => startupWorkspaceAPI.getMentors(startupId),
    [startupId]
  );

  const { data, isLoading, isError, errorInfo, retry } = useApiRequest(
    fetchMentors,
    [fetchMentors]
  );

  const rawMentors = data?.data ?? [];
  const mentors = Array.isArray(rawMentors) ? rawMentors.map(mapBackendMatchToCard) : [];

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

  if (mentors.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <EmptyState
          icon={Sparkles}
          title="No mentors yet"
          description="We couldn't find any mentor recommendations for your startup at this time."
          buttonText="Back to Dashboard"
          onButtonClick={() => navigate(`/startup-workspace/${startupId}`)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader count={mentors.length} />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {mentors.map((mentor) => (
          <MatchCard key={mentor.id} match={mentor} />
        ))}
      </div>
    </div>
  );
}

function PageHeader({ count }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold text-white">Mentor Recommendations</h1>
        <p className="mt-1 text-sm text-slate-400">
          {count != null
            ? `${count} mentor${count !== 1 ? 's' : ''} matched to your startup`
            : 'Mentors matched by AI'}
        </p>
      </div>
    </div>
  );
}