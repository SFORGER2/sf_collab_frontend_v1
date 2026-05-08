/**
 * LeaderboardPage - SF Collab Leaderboard
 * Displays top earners and user rankings
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Crown,
  Medal,
  TrendingUp,
  Coins,
  Users,
  RefreshCw,
  ChevronLeft,
  Flame,
  Star,
  Zap,
} from 'lucide-react';
import { walletAPI } from '@/utils/APIs/walletAPI';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LeaderboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('all'); // all, weekly, monthly
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      
      const response = await walletAPI.getLeaderboard({ 
        limit: 50, 
        period: period 
      });

      if (response.success) {
        setLeaderboard(response.leaderboard || []);
        
        // Find current user's rank
        const currentUserRank = response.leaderboard?.find(
          entry => String(entry.user_id) === String(user?.id)
        );
        setUserRank(currentUserRank);
      } else {
        console.error('Failed to load leaderboard:', response.error);
        toast.error(response.error || 'Failed to load leaderboard');
      }
      
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
    toast.success('Leaderboard refreshed!');
  };

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1:
        return {
          bg: 'bg-gradient-to-br from-amber-500/20 to-yellow-600/20',
          border: 'border-amber-500/50',
          text: 'text-amber-400',
          icon: Crown,
          iconColor: 'text-amber-400',
          glow: 'shadow-amber-500/20',
        };
      case 2:
        return {
          bg: 'bg-gradient-to-br from-gray-300/20 to-gray-400/20',
          border: 'border-gray-400/50',
          text: 'text-gray-300',
          icon: Medal,
          iconColor: 'text-gray-300',
          glow: 'shadow-gray-400/20',
        };
      case 3:
        return {
          bg: 'bg-gradient-to-br from-orange-600/20 to-orange-700/20',
          border: 'border-orange-500/50',
          text: 'text-orange-400',
          icon: Medal,
          iconColor: 'text-orange-400',
          glow: 'shadow-orange-500/20',
        };
      default:
        return {
          bg: 'bg-white/5',
          border: 'border-white/10',
          text: 'text-gray-400',
          icon: null,
          iconColor: 'text-gray-500',
          glow: '',
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 px-4 md:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-6"
      >
        {/* Back to Wallet */}
        <Link 
          to="/wallet" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Wallet
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border border-amber-500/30">
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>
              Leaderboard
            </h1>
            <p className="text-gray-400 mt-1">Top earners in SF Collab</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Period Filter */}
      <div className="flex items-center gap-2 mb-6 p-1 bg-white/5 rounded-xl w-fit">
        {[
          { value: 'all', label: 'All Time' },
          { value: 'monthly', label: 'This Month' },
          { value: 'weekly', label: 'This Week' },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setPeriod(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              period === option.value
                ? 'bg-amber-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Your Rank Card (if user is in leaderboard) */}
      {userRank && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                #{userRank.rank}
              </div>
              <div>
                <p className="text-white font-semibold">Your Ranking</p>
                <p className="text-gray-400 text-sm">
                  {userRank.total_earned?.toLocaleString() || 0} total coins earned
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-amber-400 font-bold text-xl">
                {userRank.current_balance?.toLocaleString() || 0}
              </p>
              <p className="text-gray-500 text-sm">Current Balance</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-3 gap-4 items-end">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <PodiumCard entry={leaderboard[1]} rank={2} currentUserId={user?.id} />
              <div className="w-full h-20 bg-gradient-to-t from-gray-400/20 to-gray-400/5 rounded-t-lg mt-2" />
            </div>
            
            {/* 1st Place */}
            <div className="flex flex-col items-center">
              <PodiumCard entry={leaderboard[0]} rank={1} currentUserId={user?.id} />
              <div className="w-full h-28 bg-gradient-to-t from-amber-500/20 to-amber-500/5 rounded-t-lg mt-2" />
            </div>
            
            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <PodiumCard entry={leaderboard[2]} rank={3} currentUserId={user?.id} />
              <div className="w-full h-14 bg-gradient-to-t from-orange-500/20 to-orange-500/5 rounded-t-lg mt-2" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Full Leaderboard List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          All Rankings
        </h2>

        {leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No leaderboard data yet</p>
            <p className="text-gray-500 text-sm mt-2">Start earning coins to appear on the leaderboard!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => {
              const isCurrentUser = String(entry.user_id) === String(user?.id);
              const rankStyle = getRankStyle(entry.rank);
              const RankIcon = rankStyle.icon;
              
              return (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:scale-[1.01] ${
                    isCurrentUser
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : `${rankStyle.bg} ${rankStyle.border}`
                  } ${rankStyle.glow ? `shadow-lg ${rankStyle.glow}` : ''}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${rankStyle.text}`}>
                      {RankIcon ? (
                        <RankIcon className={`w-6 h-6 ${rankStyle.iconColor}`} />
                      ) : (
                        <span className="text-sm">#{entry.rank}</span>
                      )}
                    </div>
                    
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                      {entry.profile_picture ? (
                        <img src={entry.profile_picture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-semibold">
                          {entry.username?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    
                    {/* Name */}
                    <div>
                      <p className="text-white font-medium flex items-center gap-2">
                        {entry.username || 'Unknown'}
                        {isCurrentUser && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">You</span>
                        )}
                        {entry.rank <= 3 && (
                          <Flame className="w-4 h-4 text-orange-400" />
                        )}
                      </p>
                      <p className="text-gray-500 text-sm">
                        Balance: {(entry.current_balance || 0).toLocaleString()} coins
                      </p>
                    </div>
                  </div>
                  
                  {/* Total Earned */}
                  <div className="text-right">
                    <p className="text-amber-400 font-bold text-lg flex items-center gap-1 justify-end">
                      <Coins className="w-4 h-4" />
                      {(entry.total_earned || 0).toLocaleString()}
                    </p>
                    <p className="text-gray-500 text-sm">Total Earned</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6"
      >
        <StatCard
          label="Total Participants"
          value={leaderboard.length}
          icon={Users}
          color="text-blue-400"
        />
        <StatCard
          label="Top Earner"
          value={(leaderboard[0]?.total_earned || 0).toLocaleString()}
          icon={Crown}
          color="text-amber-400"
        />
        <StatCard
          label="Your Rank"
          value={userRank ? `#${userRank.rank}` : 'N/A'}
          icon={TrendingUp}
          color="text-green-400"
        />
        <StatCard
          label="Period"
          value={period === 'all' ? 'All Time' : period === 'monthly' ? 'Monthly' : 'Weekly'}
          icon={Zap}
          color="text-purple-400"
        />
      </motion.div>
    </div>
  );
};


// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const PodiumCard = ({ entry, rank, currentUserId }) => {
  if (!entry) return null;
  
  const isCurrentUser = String(entry.user_id) === String(currentUserId);
  
  const rankColors = {
    1: { bg: 'from-amber-500 to-yellow-600', border: 'border-amber-400', text: 'text-amber-400' },
    2: { bg: 'from-gray-400 to-gray-500', border: 'border-gray-400', text: 'text-gray-300' },
    3: { bg: 'from-orange-500 to-orange-600', border: 'border-orange-400', text: 'text-orange-400' },
  };
  
  const colors = rankColors[rank];
  
  return (
    <div className={`flex flex-col items-center p-4 rounded-2xl bg-white/5 border ${colors.border} ${isCurrentUser ? 'ring-2 ring-blue-500' : ''}`}>
      {/* Crown/Medal Icon */}
      <div className={`p-2 rounded-full bg-gradient-to-br ${colors.bg} mb-2`}>
        {rank === 1 ? (
          <Crown className="w-6 h-6 text-white" />
        ) : (
          <Medal className="w-6 h-6 text-white" />
        )}
      </div>
      
      {/* Avatar */}
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden mb-2 border-2 border-white/20">
        {entry.profile_picture ? (
          <img src={entry.profile_picture} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-white font-bold text-xl">
            {entry.username?.charAt(0)?.toUpperCase() || '?'}
          </span>
        )}
      </div>
      
      {/* Name */}
      <p className="text-white font-semibold text-sm text-center truncate max-w-full">
        {entry.username || 'Unknown'}
        {isCurrentUser && <span className="text-blue-400 ml-1">(You)</span>}
      </p>
      
      {/* Total Earned */}
      <p className={`${colors.text} font-bold mt-1`}>
        {(entry.total_earned || 0).toLocaleString()}
      </p>
      <p className="text-gray-500 text-xs">coins</p>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-colors">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-gray-400 text-xs">{label}</p>
        <p className="text-white font-semibold">{value}</p>
      </div>
    </div>
  </div>
);

export default LeaderboardPage;