import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Building2 } from 'lucide-react';

import StartupCard from '@/components/pages/discoverStartups/StartupCard';
import StartupCardSkeleton from '@/components/pages/discoverStartups/StartupCardSkeleton';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { useApiRequest } from '@/utils/hooks/useApiRequest';
import { matchmakingAPI } from '@/utils/APIs/matchmakingAPI';

// ─── Normalise the backend response into the shape StartupCard expects ────────

function normaliseStartup(raw) {
  return {
    id: raw.id ?? raw._id ?? null,
    name: raw.name ?? raw.startupName ?? 'Unnamed Startup',
    sector: raw.sector ?? raw.industry ?? 'General',
    stage: raw.stage ?? 'Seed',
    openRoles: raw.openRoles ?? raw.open_roles ?? 0,
    memberCount: raw.memberCount ?? raw.member_count ?? 0,
    logo_url: raw.logo_url ?? raw.logoUrl ?? null,
    banner_url: raw.banner_url ?? raw.bannerUrl ?? null,
    description: raw.description ?? 'No description available.',
  };
}

function normaliseStartups(responseData) {
  const list =
    responseData?.startups ??
    responseData?.data?.startups ??
    responseData?.data ??
    (Array.isArray(responseData) ? responseData : []);
  return list.map(normaliseStartup);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BuilderMatchingStartupsPage() {
  const navigate = useNavigate();

  const fetchMatchingStartups = useCallback(
    () => matchmakingAPI.getMatchingStartups(),
    []
  );

  const { data, isLoading, isError, errorInfo, retry } = useApiRequest(
    fetchMatchingStartups,
    [fetchMatchingStartups]
  );

  const startups = data ? normaliseStartups(data) : [];

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <PageHeader />
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <StartupCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────

  if (isError) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
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

  if (startups.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <PageHeader />
        <EmptyState
          icon={Building2}
          title="No startup recommendations available"
          description="Try updating your profile skills and preferences so our matchmaking engine can recommend relevant startups."
          buttonText="Update Skills Profile"
          onButtonClick={() => navigate('/builder/profile-skills')}
        />
      </div>
    );
  }

  // ── Recommendation grid ─────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <PageHeader count={startups.length} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {startups.map((startup, index) => (
          <motion.div
            key={startup.id ?? index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -2, scale: 1.01 }}
          >
            <StartupCard
              startup={startup}
              index={index}
              showViewCta={true}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PageHeader({ count }) {
  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Matching Startups
          </h1>
          <p className="text-gray-400 text-sm md:text-base mt-1">
            {count != null
              ? `We found ${count} startup recommendation${count !== 1 ? 's' : ''} matching your builder skills.`
              : 'Discover early-stage startups that fit your technology stack and experience.'}
          </p>
        </div>
      </div>
    </div>
  );
}
