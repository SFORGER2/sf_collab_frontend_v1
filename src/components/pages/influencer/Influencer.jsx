import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Share2, Target, Award, Link2, ArrowRight, MessageCircle, Copy, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import SpotlightCard from '../../ui/SpotlightCard';
import { toast } from 'react-toastify';


export default function Influencer() {
  const user = useSelector(state => state.auth.user);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    // Fetch influencer data - replace with actual API call
    const fetchuser = async () => {
      try {
        // const response = await fetch(`/api/influencers/${username}`);
        // const data = await response.json();
        if (!user) return;
        // Mock data
        if (user.role !== 'influencer') {
          toast.error('You are not an influencer.');
          navigate('/dashboard');
        }
        console.log(user);
      } catch (error) {
        console.error('Failed to fetch influencer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchuser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(`https://sforger.io/ref/${user.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Influencer not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-950">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
        
        <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 mb-12">
            <div className="flex-shrink-0">
              <img
                src={user.profile?.picture || '/default-user.jpeg'}
                alt={user.fullName}
                className="w-32 h-32 rounded-2xl border-2 border-purple-500/50 shadow-lg shadow-purple-500/20"
              />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-white">{user.fullName}</h1>
                {user.isEmailVerified && (
                  <Award className="w-6 h-6 text-yellow-400" />
                )}
              </div>
              <p className="text-white/70 text-base max-w-2xl mb-4">{user.profile?.bio || 'No bio yet'}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {user.role && (
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/50 rounded-full text-sm text-purple-200 capitalize">
                    {user.role}
                  </span>
                )}
                <span className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/50 rounded-full text-sm text-blue-200">
                  {user.statistics?.engagement_score || 0}% Engagement
                </span>
              </div>

              {/* Social Links */}
              <div className="flex gap-3">
                {user.profile?.socialLinks && Object.entries(user.profile.socialLinks).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <span className="text-sm text-white capitalize">{platform}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Referral CTA */}
            <div className="w-full sm:w-auto bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-purple-400/50 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-sm text-white/70 mb-3">Your Referral Link</p>
              <div className="flex gap-2">
                <code className="text-xs text-purple-300 bg-white/5 px-3 py-2 rounded border border-white/10 flex-1 truncate">
                  sforger.io/ref/{user.id}
                </code>
                <button
                  onClick={copyReferralLink}
                  className="p-2 bg-purple-500/80 hover:bg-purple-600 rounded-lg transition-colors text-white"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Impact Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Impact Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Active Startups', value: user.activeStartupsCount, color: 'from-blue-500 to-blue-600' },
              { label: 'Tasks Completed', value: user.statistics?.completed_tasks || 0, color: 'from-purple-500 to-purple-600' },
              { label: 'Engagement Score', value: user.statistics?.engagement_score || 0 + '%', color: 'from-pink-500 to-pink-600' },
              { label: 'Notifications', value: user.notificationsCount, color: 'from-orange-500 to-orange-600' }
            ].map((stat, i) => (
              <SpotlightCard key={i} className="p-6">
                <p className="text-white/70 text-sm mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </SpotlightCard>
            ))}
          </div>
        </motion.div>

        {/* Statistics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Your Stats</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'XP Points', value: user.xpPoints, icon: TrendingUp },
              { label: 'Streak Days', value: user.streakDays, icon: Target },
              { label: 'Satisfaction', value: user.satisfactionPercentage + '%', icon: Award },
              { label: 'Total Revenue', value: '$' + (user.totalRevenue || 0), icon: Share2 }
            ].map((stat, i) => {
              const IconComponent = stat.icon;
              return (
                <SpotlightCard key={i} className="p-6 flex flex-col items-center text-center">
                  <IconComponent className="w-8 h-8 text-purple-400 mb-3" />
                  <p className="text-white/70 text-sm mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </SpotlightCard>
              );
            })}
          </div>
        </motion.div>

        {/* Community Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Community</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button className="p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-purple-400/50 rounded-xl hover:border-purple-300 transition-all hover:shadow-lg hover:shadow-purple-500/20 group">
              <MessageCircle className="w-6 h-6 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-semibold mb-2">Chat with {user.firstName}</h3>
              <p className="text-white/70 text-sm">Direct messaging & collaboration</p>
              <ArrowRight className="w-4 h-4 text-purple-400 mt-3 group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="p-6 bg-gradient-to-r from-pink-600/20 to-orange-600/20 border border-pink-400/50 rounded-xl hover:border-pink-300 transition-all hover:shadow-lg hover:shadow-pink-500/20 group">
              <Users className="w-6 h-6 text-pink-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-semibold mb-2">Join Community</h3>
              <p className="text-white/70 text-sm">Connect with {user.relationshipCounts?.followers || 0} followers</p>
              <ArrowRight className="w-4 h-4 text-pink-400 mt-3 group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="p-6 bg-gradient-to-r from-green-600/20 to-teal-600/20 border border-green-400/50 rounded-xl hover:border-green-300 transition-all hover:shadow-lg hover:shadow-green-500/20 group">
              <TrendingUp className="w-6 h-6 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-semibold mb-2">Follow Journey</h3>
              <p className="text-white/70 text-sm">Get updates on new startups</p>
              <ArrowRight className="w-4 h-4 text-green-400 mt-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}