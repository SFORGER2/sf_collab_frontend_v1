import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, Award, Zap } from 'lucide-react';
import { builderRewardsAPI } from '@/services/builderAPI';
import { CosmosButton, Eyebrow, PageShell, Panel, Tag } from '@/components/cosmos';

const Rewards = () => {
  const { user, access_token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [rewards, setRewards] = useState({
    total_earnings: 0,
    paid_earnings: 0,
    pending_payouts: 0,
    equity_promises: 0,
    reputation_points: 0,
  });

  const [earningsHistory, setEarningsHistory] = useState([]);
  
  // Responsive viewport detection
  const [viewport, setViewport] = useState({ width: typeof window !== 'undefined' ? window.innerWidth : 1024 });
  
  useEffect(() => {
    const handleResize = () => setViewport({ width: window.innerWidth });
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = viewport.width < 640;
  const isTablet = viewport.width >= 640 && viewport.width < 1024;

  // Fetch rewards from backend
  useEffect(() => {
    const fetchRewards = async () => {
      if (!user || !access_token) return;

      setLoading(true);
      setError(null);
      try {
        const response = await builderRewardsAPI.getRewardsSummary(access_token);
        if (response.success && response.data) {
          setRewards(response.data);
        } else {
          setError(response.error || 'Failed to fetch rewards');
        }
      } catch (err) {
        console.error('Failed to fetch rewards:', err);
        setError('Failed to load rewards');
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, [user, access_token]);

  // Fetch earnings history
  useEffect(() => {
    const fetchEarningsHistory = async () => {
      if (!user || !access_token) return;

      try {
        const response = await builderRewardsAPI.getEarningsHistory(access_token);
        if (response.success && response.data) {
          setEarningsHistory(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch earnings history:', err);
      }
    };

    fetchEarningsHistory();
  }, [user, access_token]);

  const stats = [
    { icon: DollarSign, label: 'Paid Earnings', value: `$${(rewards.paid_earnings || 0).toFixed(0)}`, accent: '#3ee6a0' },
    { icon: TrendingUp, label: 'Pending Payouts', value: `$${(rewards.pending_payouts || 0).toFixed(0)}`, accent: '#ffbf5e' },
    { icon: Award, label: 'Equity Promises', value: `${(rewards.equity_promises || 0).toFixed(2)}%`, accent: '#4fd8ff' },
    { icon: Zap, label: 'Reputation Points', value: rewards.reputation_points || 0, accent: '#8b6cff' },
  ];

  return (
    <PageShell
      eyebrow="Builder"
      title="Rewards & Earnings"
      description="What your contributions have earned — payouts, equity and reputation."
      width="wide"
      adPlacement="builder-rewards"
      actions={
        <CosmosButton variant="quiet" size="sm" asChild className="w-full sm:w-auto justify-center min-h-[40px] touch-manipulation">
          <Link to="/wallet">Open wallet</Link>
        </CosmosButton>
      }
    >
      {error && (
        <Panel className="p-3.5 sm:p-4 lg:p-5 mb-4 sm:mb-5 border-red-500/25">
          <p className="text-red-400 text-[0.85rem] sm:text-[0.92rem] leading-relaxed">{error}</p>
        </Panel>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-2 border-gold border-t-transparent" />
          <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.16em] sm:tracking-[0.18em] uppercase text-dim">
            Loading your rewards
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6 min-w-0 w-full">
          {/* Headline numbers — 2x2 on mobile, 4 columns on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-3.5 w-full">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={stat.label} 
                  className="cosmos-card p-3 xs:p-3.5 sm:p-4 lg:p-5 min-w-0 flex flex-col" 
                  style={{ '--cosmos-accent': stat.accent }}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2 min-w-0">
                    <span className="cosmos-stat-label text-[9px] sm:text-[10px] lg:text-[10.5px] leading-tight flex-1 min-w-0 break-words">
                      {stat.label}
                    </span>
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" style={{ color: stat.accent }} aria-hidden="true" />
                  </div>
                  <span 
                    className="cosmos-stat-value text-[1.35rem] xs:text-[1.5rem] sm:text-2xl lg:text-[2.1rem] break-all"
                    style={{ color: stat.accent }}
                    title={stat.value}
                  >
                    {stat.value}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Earnings History Table */}
          <Panel className="p-3.5 sm:p-5 lg:p-6 w-full min-w-0">
            <Eyebrow className="mb-3 sm:mb-4">Earnings history</Eyebrow>
            {earningsHistory.length === 0 ? (
              <p className="text-[0.85rem] sm:text-[0.9rem] text-dim py-6 sm:py-8 text-center leading-relaxed">
                No earnings yet. Complete tasks in a startup you've joined to start earning.
              </p>
            ) : (
              <div className="relative -mx-3.5 sm:mx-0">
                {/* Scroll container with visual indicators */}
                <div className="overflow-x-auto px-3.5 sm:px-0 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20">
                  <table className="w-full min-w-[420px] xs:min-w-[480px] sm:min-w-0 text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="py-2.5 sm:py-3 cosmos-stat-label font-normal text-left">Task</th>
                        <th className="py-2.5 sm:py-3 cosmos-stat-label font-normal text-right whitespace-nowrap">Amount</th>
                        <th className="py-2.5 sm:py-3 cosmos-stat-label font-normal text-right whitespace-nowrap hidden xs:table-cell">
                          Date
                        </th>
                        <th className="py-2.5 sm:py-3 cosmos-stat-label font-normal text-right whitespace-nowrap">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {earningsHistory.map((item) => (
                        <tr key={item.id} className="border-b border-white/[0.07] hover:bg-white/[0.02] transition-colors">
                          <td className="py-2.5 sm:py-3 lg:py-3.5 text-[0.82rem] sm:text-[0.92rem] text-star pr-3 break-words max-w-[180px] xs:max-w-[240px] sm:max-w-none">
                            {item.task}
                          </td>
                          <td className="py-2.5 sm:py-3 lg:py-3.5 text-right font-mono text-[0.82rem] sm:text-[0.9rem] text-emerald-400 tabular-nums whitespace-nowrap">
                            ${item.amount}
                          </td>
                          <td className="py-2.5 sm:py-3 lg:py-3.5 text-right font-mono text-[10px] sm:text-[11px] text-dim tabular-nums whitespace-nowrap hidden xs:table-cell">
                            {new Date(item.date).toLocaleDateString(undefined, { 
                              month: 'short', 
                              day: 'numeric',
                              year: isMobile ? '2-digit' : 'numeric'
                            })}
                          </td>
                          <td className="py-2.5 sm:py-3 lg:py-3.5 text-right whitespace-nowrap">
                            <Tag tone={item.status === 'paid' ? 'live' : 'planned'}>
                              {item.status === 'paid' ? 'Paid' : 'Pending'}
                            </Tag>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Mobile scroll indicator */}
                {isMobile && earningsHistory.length > 0 && (
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0d0a1a] via-[#0d0a1a]/90 to-transparent pointer-events-none sm:hidden" />
                )}
              </div>
            )}
          </Panel>

          {/* Payment Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5 lg:gap-4 w-full">
            <Panel className="p-3.5 sm:p-5 lg:p-6 flex flex-col" accent="#4fd8ff">
              <Eyebrow>Bank transfer</Eyebrow>
              <p className="text-[0.82rem] sm:text-[0.9rem] text-dim mt-1.5 sm:mt-2 mb-3.5 sm:mb-4 leading-relaxed flex-1">
                Direct deposit to your bank account.
              </p>
              <CosmosButton 
                variant="quiet" 
                size="sm" 
                className="w-full sm:w-auto justify-center min-h-[40px] touch-manipulation"
              >
                Manage
              </CosmosButton>
            </Panel>

            <Panel className="p-3.5 sm:p-5 lg:p-6 flex flex-col" accent="#8b6cff">
              <Eyebrow>Crypto wallet</Eyebrow>
              <p className="text-[0.82rem] sm:text-[0.9rem] text-dim mt-1.5 sm:mt-2 mb-3.5 sm:mb-4 leading-relaxed flex-1">
                Receive payments in cryptocurrency.
              </p>
              <CosmosButton 
                variant="quiet" 
                size="sm" 
                className="w-full sm:w-auto justify-center min-h-[40px] touch-manipulation"
              >
                Manage
              </CosmosButton>
            </Panel>
          </div>

          {/* Equity Panel */}
          <Panel className="p-3.5 sm:p-5 lg:p-6" accent="#ffbf5e">
            <Eyebrow>Equity promises</Eyebrow>
            <h2 className="font-display text-[1.05rem] sm:text-lg lg:text-[1.15rem] text-star mt-1.5 sm:mt-2 mb-2 sm:mb-2.5 leading-snug">
              {(rewards.equity_promises || 0).toFixed(2)}% across startups
            </h2>
            <p className="text-[0.82rem] sm:text-[0.9rem] text-dim mb-4 sm:mb-5 max-w-[64ch] leading-relaxed">
              Track your holdings and how their valuations move as each startup grows.
            </p>
            <CosmosButton 
              variant="primary" 
              size="sm" 
              className="w-full sm:w-auto justify-center min-h-[40px] touch-manipulation"
            >
              View equity holdings
            </CosmosButton>
          </Panel>
        </div>
      )}
    </PageShell>
  );
};

export default Rewards;