import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { startupsAPI } from '@/utils/APIs/startupsAPI';
import MatchCard from '@/components/matchmaking/MatchCard';
import { MatchCardSkeleton } from '@/components/matchmaking/MatchmakingSkeleton';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';

export default function InvestorsSection({ startupId }) {
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvestors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await startupsAPI.getInvestorMatches(startupId);
      // Backend response might wrap the list in data or return directly
      const list = Array.isArray(data) ? data : data?.data || data?.investors || [];
      setInvestors(list);
    } catch (err) {
      console.error('Error fetching investor matches:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [startupId]);

  useEffect(() => {
    fetchInvestors();
  }, [fetchInvestors]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-7 w-56 animate-pulse rounded bg-slate-800" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MatchCardSkeleton />
          <MatchCardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to Load Investors"
        message="An error occurred while fetching matching investors for your startup. Please try again."
        onRetry={fetchInvestors}
        type="server"
        className="min-h-[180px] py-6"
      />
    );
  }

  if (investors.length === 0) {
    return (
      <EmptyState
        title="No Recommended Investors"
        description="We couldn't find any matching investors for your startup's profile right now."
        buttonText="Refresh Recommendations"
        onButtonClick={fetchInvestors}
        icon={Coins}
      />
    );
  }

  return (
    <motion.section
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <Card className="bg-gray-800 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-lg font-bold">
            <Coins className="w-5 h-5 text-blue-400" />
            Recommended Investors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {investors.map((investor, index) => (
              <MatchCard
                key={investor.id || investor.company || index}
                match={{
                  kind: 'investor',
                  name: investor.company || investor.name || 'Anonymous Investor',
                  role: investor.location || 'Remote',
                  matchScore: investor.matchScore !== undefined ? investor.matchScore : investor.score,
                  aiExplanation: investor.bio || investor.description || 'No explanation provided.',
                  reasons: Array.isArray(investor.reasons) ? investor.reasons : [],
                  meta: investor.meta || {}
                }}
                className="flex flex-col h-full [&_.relative]:flex-1 [&_.relative]:flex [&_.relative]:flex-col [&_div.border-t]:mt-auto [&_div.rounded-full]:!rounded-xl [&_.border-b_>_div]:w-full [&_.border-b_>_div]:min-w-0 [&_h3]:!whitespace-normal [&_h3]:!overflow-visible"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
}
