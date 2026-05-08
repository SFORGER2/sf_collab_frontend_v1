// sections/ProfileStats.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Target, Rocket, Users, Star, TrendingUp, BookOpen, MessageSquare, DollarSign } from 'lucide-react';

const ProfileStats = ({ profile }) => {
  const stats = [
    {
      icon: Zap,
      label: 'Current Streak',
      value: profile?.streak_days || 0,
      suffix: 'days',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10'
    },
    {
      icon: Target,
      label: 'Tasks Completed',
      value: profile?.assignedTasks?.completed || 0,
      suffix: 'tasks',
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      icon: Rocket,
      label: 'Active Startups',
      value: profile?.startupMemberships?.length || 0,
      suffix: 'projects',
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      icon: Users,
      label: 'Community Impact',
      value: profile?.statistics?.total_likes_received || 0,
      suffix: 'likes',
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10'
    },
    {
      icon: Star,
      label: 'Achievements',
      value: profile?.achievements?.length || 0,
      suffix: 'unlocked',
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10'
    },
    {
      icon: TrendingUp,
      label: 'Engagement Score',
      value: profile?.statistics?.engagement_score || 0,
      suffix: '%',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-400/10'
    },
    {
      icon: BookOpen,
      label: 'Knowledge Posts',
      value: profile?.knowledgePosts?.length || 0,
      suffix: 'posts',
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-400/10'
    },
    {
      icon: MessageSquare,
      label: 'Ideas Shared',
      value: profile?.ideas?.length || 0,
      suffix: 'ideas',
      color: 'text-pink-400',
      bgColor: 'bg-pink-400/10'
    },
    {
      icon: Users,
      label: 'Friends',
      value: profile?.friendsCount || 0,
      suffix: 'connections',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10'
    },
    {
      icon: DollarSign,
      label: 'Transactions',
      value: profile?.transactions?.length || 0,
      suffix: 'activity',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`${stat.bgColor} backdrop-blur-xl border border-gray-700 rounded-2xl p-4 text-center hover:border-gray-600 transition-colors`}
        >
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${stat.bgColor} mb-3`}>
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
          </div>
          <div className={`text-2xl font-bold ${stat.color} mb-1`}>
            {stat.value}
          </div>
          <div className="text-xs text-gray-400">
            {stat.label}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stat.suffix}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProfileStats;