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
        <CosmosButton variant="quiet" size="sm" asChild>
          <Link to="/wallet">Open wallet</Link>
        </CosmosButton>
      }
    >
      {error && (
        <Panel className="p-5 mb-5 border-red-500/25">
          <p className="text-red-400 text-[0.92rem]">{error}</p>
        </Panel>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent" />
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-dim">
            Loading your rewards
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Headline numbers — cosmos stat treatment, one accent each */}
          <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="cosmos-card p-5" style={{ '--cosmos-accent': stat.accent }}>
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <span className="cosmos-stat-label">{stat.label}</span>
                    <Icon className="w-4 h-4 shrink-0" style={{ color: stat.accent }} />
                  </div>
                  <span className="cosmos-stat-value" style={{ color: stat.accent }}>
                    {stat.value}
                  </span>
                </div>
              );
            })}
          </div>

          <Panel className="p-6">
            <Eyebrow className="mb-4">Earnings history</Eyebrow>
            {earningsHistory.length === 0 ? (
              <p className="text-[0.9rem] text-dim py-6 text-center">
                No earnings yet. Complete tasks in a startup you've joined to start earning.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-2.5 cosmos-stat-label font-normal">Task</th>
                      <th className="py-2.5 cosmos-stat-label font-normal text-right">Amount</th>
                      <th className="py-2.5 cosmos-stat-label font-normal text-right">Date</th>
                      <th className="py-2.5 cosmos-stat-label font-normal text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earningsHistory.map((item) => (
                      <tr key={item.id} className="border-b border-white/[0.07]">
                        <td className="py-3 text-[0.92rem] text-star">{item.task}</td>
                        <td className="py-3 text-right font-mono text-[0.9rem] text-emerald-400 tabular-nums">
                          ${item.amount}
                        </td>
                        <td className="py-3 text-right font-mono text-[11px] text-dim tabular-nums">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right">
                          <Tag tone={item.status === 'paid' ? 'live' : 'planned'}>
                            {item.status === 'paid' ? 'Paid' : 'Pending'}
                          </Tag>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
            <Panel className="p-6" accent="#4fd8ff">
              <Eyebrow>Bank transfer</Eyebrow>
              <p className="text-[0.9rem] text-dim mt-2 mb-4">
                Direct deposit to your bank account.
              </p>
              <CosmosButton variant="quiet" size="sm">Manage</CosmosButton>
            </Panel>

            <Panel className="p-6" accent="#8b6cff">
              <Eyebrow>Crypto wallet</Eyebrow>
              <p className="text-[0.9rem] text-dim mt-2 mb-4">
                Receive payments in cryptocurrency.
              </p>
              <CosmosButton variant="quiet" size="sm">Manage</CosmosButton>
            </Panel>
          </div>

          <Panel className="p-6" accent="#ffbf5e">
            <Eyebrow>Equity promises</Eyebrow>
            <h2 className="font-display text-[1.15rem] text-star mt-2 mb-2">
              {(rewards.equity_promises || 0).toFixed(2)}% across startups
            </h2>
            <p className="text-[0.9rem] text-dim mb-4 max-w-[60ch]">
              Track your holdings and how their valuations move as each startup grows.
            </p>
            <CosmosButton variant="primary" size="sm">View equity holdings</CosmosButton>
          </Panel>
        </div>
      )}
    </PageShell>
  );
};

export default Rewards;