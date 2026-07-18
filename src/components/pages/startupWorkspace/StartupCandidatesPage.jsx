import React, { useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Users } from 'lucide-react';

import MatchCard from '@/components/matchmaking/MatchCard';
import { MatchSectionSkeleton } from '@/components/matchmaking/MatchmakingSkeleton';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { useApiRequest } from '@/utils/hooks/useApiRequest';
import { startupWorkspaceAPI } from '@/utils/APIs/startupWorkspaceAPI';
import { chatAPI } from '@/utils/APIs/chatApi';
import { mapBackendMatchToCard } from '@/utils/matchMapping';
// Note: startupsAPI is needed for invite – import it if not already imported
import { startupsAPI } from '@/utils/APIs/startupsAPI';

export default function StartupCandidatesPage() {
  const { startupId } = useOutletContext();
  const navigate = useNavigate();

  const fetchCandidates = useCallback(
    () => startupWorkspaceAPI.getCandidates(startupId),
    [startupId]
  );

  const { data, isLoading, isError, errorInfo, retry } = useApiRequest(
    fetchCandidates,
    [fetchCandidates]
  );

  const rawCandidates = data?.data ?? [];
  const candidates = Array.isArray(rawCandidates) ? rawCandidates.map(mapBackendMatchToCard) : [];

  const handleInvite = useCallback(
    async (candidate) => {
      if (!candidate.id) {
        toast.error('Unable to send invite: user ID is missing.');
        return;
      }
      try {
        await startupsAPI.inviteMember(startupId, { user_id: candidate.id });
        toast.success(`Invite sent to ${candidate.name}.`);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 409) {
          toast.info(`${candidate.name} already has a pending invite.`);
        } else if (status === 403) {
          toast.error('Only startup owners can send invitations.');
        } else {
          toast.error(`Failed to invite ${candidate.name}. Please try again.`);
        }
      }
    },
    [startupId]
  );

  const handleMessage = useCallback(
    async (candidate) => {
      if (!candidate.id) {
        toast.error('Unable to open chat: user ID is missing.');
        return;
      }
      try {
        const res = await chatAPI.createDirectConversation(candidate.id);
        const conversationId =
          res?.data?.conversation?.id ?? res?.conversation?.id ?? res?.id ?? null;
        if (conversationId) {
          navigate(`/messages?conversation=${conversationId}`);
        } else {
          navigate('/messages');
        }
      } catch {
        toast.error(`Couldn't open chat with ${candidate.name}. Please try again.`);
      }
    },
    [navigate]
  );

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

  if (candidates.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <EmptyState
          icon={Users}
          title="No candidates yet"
          description="AI-recommended candidates will appear here once your startup profile is complete and the matching engine has run."
          buttonText="Complete Startup Profile"
          onButtonClick={() => navigate(`/startup-details/${startupId}`)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader count={candidates.length} />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {candidates.map((candidate) => (
          <MatchCard
            key={candidate.id}
            match={{
              ...candidate,
              ctaLabel: 'Send Invite',
              ctaOnClick: () => handleInvite(candidate),
              secondaryCtaLabel: 'Message',
              secondaryCtaOnClick: () => handleMessage(candidate),
            }}
          />
        ))}
      </div>
    </div>
  );
}

function PageHeader({ count }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold text-white">AI-Recommended Candidates</h1>
        <p className="mt-1 text-sm text-slate-400">
          {count != null
            ? `${count} candidate${count !== 1 ? 's' : ''} matched to your startup`
            : 'Candidates matched to your startup by AI'}
        </p>
      </div>
    </div>
  );
}