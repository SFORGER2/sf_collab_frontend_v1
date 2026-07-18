// src/components/pages/startupWorkspace/StartupCandidatesPage.jsx
//
// "Startup Candidate View" module.
// Displays AI-recommended candidates for a startup owner to browse.
// Mounted inside StartupWorkspaceLayout — receives { startup, startupId }
// via useOutletContext.
//
// API: GET /matchmaking/startups/:startupId/candidates
// Access: startup owners only (backend enforces 403 for non-owners).

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
import { startupsAPI } from '@/utils/APIs/startupsAPI';
import { chatAPI } from '@/utils/APIs/chatApi';

// ─── Normalise the backend response into the shape MatchCard expects ──────────

function normaliseCandidate(raw) {
  return {
    kind: raw.kind ?? 'builder',
    name: raw.name ?? raw.display_name ?? raw.username ?? 'Unknown',
    role: raw.role ?? raw.headline ?? null,
    matchScore: typeof raw.match_score === 'number' ? raw.match_score : raw.matchScore ?? null,
    aiExplanation: raw.ai_explanation ?? raw.aiExplanation ?? raw.explanation ?? null,
    avatarUrl: raw.avatar_url ?? raw.avatarUrl ?? null,
    reasons: Array.isArray(raw.reasons) ? raw.reasons : [],
    meta: raw.meta ?? { skills: raw.skills ?? null },
    _userId: raw.user_id ?? raw.userId ?? raw.id ?? null,
  };
}

function normaliseCandidates(responseData) {
  const list =
    responseData?.candidates ??
    responseData?.matches ??
    responseData?.data?.candidates ??
    responseData?.data?.matches ??
    (Array.isArray(responseData?.data) ? responseData.data : null) ??
    (Array.isArray(responseData) ? responseData : []);

  return list.map(normaliseCandidate);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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

  const candidates = data ? normaliseCandidates(data) : [];

  // ── Action handlers ─────────────────────────────────────────────────────────

  const handleInvite = useCallback(
    async (candidate) => {
      if (!candidate._userId) {
        toast.error('Unable to send invite: user ID is missing.');
        return;
      }
      try {
        await startupsAPI.inviteMember(startupId, { user_id: candidate._userId });
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
      if (!candidate._userId) {
        toast.error('Unable to open chat: user ID is missing.');
        return;
      }
      try {
        const res = await chatAPI.createDirectConversation(candidate._userId);
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

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <MatchSectionSkeleton count={6} />
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────

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

  // ── Empty ───────────────────────────────────────────────────────────────────

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

  // ── Candidates grid ──────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader count={candidates.length} />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {candidates.map((candidate, index) => (
          <CandidateCard
            key={candidate._userId ?? index}
            candidate={candidate}
            onInvite={handleInvite}
            onMessage={handleMessage}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function CandidateCard({ candidate, onInvite, onMessage }) {
  const enriched = {
    ...candidate,
    ctaLabel: 'Send Invite',
    ctaOnClick: onInvite,
    secondaryCtaLabel: 'Message',
    secondaryCtaOnClick: onMessage,
  };

  return <MatchCard match={enriched} />;
}
