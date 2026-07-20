// sections/ActivityFeed.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Target, Rocket, MessageCircle } from 'lucide-react';

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
        return 'text-green-400';
      case 'achievement_unlocked':
        return 'text-yellow-400';
      case 'idea_created':
        return 'text-blue-400';
      case 'knowledge_posted':
        return 'text-indigo-400';
      case 'post_created':
        return 'text-pink-400';
      default:
        return 'text-purple-400';
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6"
      >
        <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
        <p className="text-center text-gray-500 py-8">No recent activity</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6"
    >
      <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
      
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-xl"
            >
              <div className={`p-2 rounded-lg bg-gray-600 ${getActivityColor(activity.type)}`}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1">
                <p className="font-medium">{activity.title}</p>
                <p className="text-sm text-gray-400">
                  {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString() : ''}
                </p>
              </div>
              
              <div className="text-xs text-gray-500">
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