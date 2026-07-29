import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';
import { matchmakingAPI } from '@/utils/APIs/matchmakingAPI';
import DynamicMatchCategories from '@/components/matchmaking/DynamicMatchCategories';
import { MatchSectionSkeleton } from '@/components/matchmaking/MatchmakingSkeleton';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';

// Helper: returns true when the response contains at least one non-empty category.
function hasVisibleCategories(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
  return Object.values(data).some(
    (arr) => Array.isArray(arr) && arr.length > 0
  );
}

export default function AIMatchmakingPage() {
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await matchmakingAPI.getForMe({ explain: 0, limit: 10 });
      if (response?.success) {
        setMatchData(response.data);
      } else if (response?.data) {
        setMatchData(response.data);
      } else {
        setError(new Error(response?.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('AIMatchmakingPage: failed to fetch recommendations', err);
      // Redirect to login on 401 Unauthorized
      if (err?.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 sm:space-y-8">

      {/* Page header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          <BrainCircuit className="w-8 h-8 text-blue-500" />
          AI Matchmaking
        </h1>
        <p className="mt-1 text-sm text-slate-400 sm:text-base">
          Personalised recommendations curated by our AI model.
        </p>
      </div>

      {/* Content area */}
      {loading ? (
        <div className="space-y-8">
          <MatchSectionSkeleton count={2} />
          <MatchSectionSkeleton count={1} />
        </div>
      ) : error ? (
        <ErrorState
          title="Failed to Load Recommendations"
          message="Unable to load recommendations. Please try again later."
          onRetry={fetchRecommendations}
          type="server"
        />
      ) : !hasVisibleCategories(matchData) ? (
        <EmptyState
          title="No Recommendations Yet"
          description="No suitable collaborators found. Try updating your Required Roles, Industry, or Technology Stack."
          icon={BrainCircuit}
        />
      ) : (
        <DynamicMatchCategories matchData={matchData} />
      )}
    </div>
  );
}