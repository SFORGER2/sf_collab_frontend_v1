import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { DollarSign, TrendingUp, Award, Zap } from 'lucide-react';
import { builderRewardsAPI } from '@/services/builderAPI';

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
    {
      icon: DollarSign,
      label: 'Paid Earnings',
      value: `$${(rewards.paid_earnings || 0).toFixed(0)}`,
      color: 'green',
    },
    {
      icon: TrendingUp,
      label: 'Pending Payouts',
      value: `$${(rewards.pending_payouts || 0).toFixed(0)}`,
      color: 'yellow',
    },
    {
      icon: Award,
      label: 'Equity Promises',
      value: `${(rewards.equity_promises || 0).toFixed(2)}%`,
      color: 'blue',
    },
    {
      icon: Zap,
      label: 'Reputation Points',
      value: rewards.reputation_points || 0,
      color: 'purple',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white p-6">
      <div className="w-full mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl font-bold">Rewards & Earnings</h1>
          </div>
          <p className="text-gray-400">Track your earnings, payouts, and reputation</p>
        </div>

        {error && (
          <div className="text-center py-8 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const colorMap = {
              green: 'from-green-600 to-green-700',
              yellow: 'from-yellow-600 to-yellow-700',
              blue: 'from-blue-600 to-blue-700',
              purple: 'from-purple-600 to-purple-700',
            };

            return (
              <div
                key={index}
                className={`p-6 rounded-xl bg-gradient-to-br ${colorMap[stat.color]} hover:shadow-lg transition-all duration-300`}
              >
                <Icon className="w-6 h-6 mb-3 opacity-90" />
                <p className="text-sm opacity-90">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Earnings Breakdown */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Earnings History</h2>
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left px-6 py-4 font-semibold">Task</th>
                    <th className="text-right px-6 py-4 font-semibold">Amount</th>
                    <th className="text-right px-6 py-4 font-semibold">Date</th>
                    <th className="text-right px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {earningsHistory.map((item) => (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white">{item.task}</td>
                      <td className="px-6 py-4 text-right text-green-400 font-semibold">${item.amount}</td>
                      <td className="px-6 py-4 text-right text-gray-400">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.status === 'paid'
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                              : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          }`}
                        >
                          {item.status === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Payment Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="font-semibold mb-3">Bank Transfer</h3>
              <p className="text-gray-400 text-sm mb-4">Direct deposit to your bank account</p>
              <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
                Manage
              </button>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="font-semibold mb-3">Crypto Wallet</h3>
              <p className="text-gray-400 text-sm mb-4">Receive payments in cryptocurrency</p>
              <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
                Manage
              </button>
            </div>
          </div>
        </div>
        {/* Equity Information */}
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-3">Equity Promises</h2>
          <p className="text-gray-300 mb-4">
            You've earned {(rewards.equity_promises || 0).toFixed(2)}% equity across startups.
            View all your equity holdings and track their valuations.
          </p>
          <button className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors">
            View Equity Holdings
          </button>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Rewards;