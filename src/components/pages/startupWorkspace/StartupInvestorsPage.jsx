// components/pages/startupWorkspace/StartupInvestorsPage.jsx
import React, { useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Coins } from 'lucide-react';

import MatchCard from '@/components/matchmaking/MatchCard';
import { MatchSectionSkeleton } from '@/components/matchmaking/MatchmakingSkeleton';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { useApiRequest } from '@/utils/hooks/useApiRequest';
import { startupWorkspaceAPI } from '@/utils/APIs/startupWorkspaceAPI';
import { mapBackendMatchToCard } from '@/utils/matchMapping';

export default function StartupInvestorsPage() {
  const { startupId } = useOutletContext();
  const navigate = useNavigate();

  const fetchInvestors = useCallback(
    () => startupWorkspaceAPI.getInvestors(startupId),
    [startupId]
  );

  const { data, isLoading, isError, errorInfo, retry } = useApiRequest(
    fetchInvestors,
    [fetchInvestors]
  );

  const rawInvestors = data?.data ?? [];
  const investors = Array.isArray(rawInvestors) ? rawInvestors.map(mapBackendMatchToCard) : [];

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

  if (investors.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <EmptyState
          icon={Coins}
          title="No investors yet"
          description="We couldn't find any investor recommendations for your startup at this time."
          buttonText="Back to Dashboard"
          onButtonClick={() => navigate(`/startup-workspace/${startupId}`)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader count={investors.length} />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {investors.map((investor) => (
          <MatchCard key={investor.id} match={investor} />
        ))}
      </div>
    </div>
  );
}

function PageHeader({ count }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold text-white">Investor Recommendations</h1>
        <p className="mt-1 text-sm text-slate-400">
          {count != null
            ? `${count} investor${count !== 1 ? 's' : ''} matched to your startup`
            : 'Investors matched by AI'}
        </p>
      </div>
    </div>
  );
}