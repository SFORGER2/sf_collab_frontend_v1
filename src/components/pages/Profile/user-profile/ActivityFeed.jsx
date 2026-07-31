// sections/ActivityFeed.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Target, Rocket, MessageCircle, Activity } from 'lucide-react';

const ActivityFeed = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'task_completed':
        return Target;
      case 'achievement_unlocked':
        return Zap;
      case 'idea_created':
        return Rocket;
      case 'knowledge_posted':
        return MessageCircle;
      case 'post_created':
        return MessageCircle;
      default:
        return MessageCircle;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'task_completed':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'achievement_unlocked':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'idea_created':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'knowledge_posted':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
      case 'post_created':
        return 'text-pink-400 bg-pink-500/10 border-pink-500/30';
      default:
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl"
      >
        <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Recent Activity
        </h3>
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-white/5 flex items-center justify-center mb-3">
            <Activity className="w-6 h-6 text-slate-500 opacity-60" />
          </div>
          <p className="text-sm font-medium text-slate-400">No recent activity</p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">Actions, posts, and achievements will show up here as they happen.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl"
    >
      <h3 className="text-lg sm:text-xl font-bold text-white mb-5 flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-400" />
        Recent Activity
      </h3>
      
      <div className="space-y-3">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          const badgeClass = getActivityColor(activity.type);
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              className="flex items-center gap-3.5 p-3.5 sm:p-4 bg-slate-800/40 hover:bg-slate-800/60 border border-white/5 hover:border-white/15 rounded-xl transition-all shadow-sm"
            >
              <div className={`p-2.5 rounded-xl border shrink-0 ${badgeClass}`}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-xs sm:text-sm truncate">{activity.title}</p>
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">
                  {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
              </div>
              
              <div className="text-xs text-slate-400 font-medium shrink-0 font-mono text-[11px]">
                {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString() : ''}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ActivityFeed;