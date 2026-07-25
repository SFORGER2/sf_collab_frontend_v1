import { Bell, Clock, Mail } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export default function NotificationSection({ formData, onChange }) {
  const notificationSettings = formData.notificationSettings || {};

  const toggles = [
    { key: 'systemWarnings', title: 'Warning Alerts', description: 'Get critical system and workspace warnings' },
    { key: 'financialAlerts', title: 'Payout & Financial', description: 'Get notified about payouts and investments' },
    { key: 'taskReminders', title: 'Task Reminders', description: 'Receive upcoming deadline and task alerts' },
    { key: 'mentions', title: 'Mentions & Tags', description: 'Get notified when someone @mentions you' },
    { key: 'newComments', title: 'New Comments', description: 'Get notified when someone comments on your posts' },
    { key: 'newLikes', title: 'New Likes', description: 'Get notified when someone likes your content' },
    { key: 'newSuggestions', title: 'New Suggestions', description: 'Receive personalized suggestions' },
    { key: 'joinRequests', title: 'Join Requests', description: 'Get notified of new join requests' },
    { key: 'approvals', title: 'Approvals', description: 'Receive approval notifications' },
    { key: 'storyViews', title: 'Story Views', description: 'Get notified when your stories are viewed' },
    { key: 'postEngagement', title: 'Post Engagement', description: 'Receive updates on post engagement' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-600/20 rounded-lg">
            <Bell className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Notification Settings</h2>
            <p className="text-sm text-gray-400 mt-1">Manage how you receive updates</p>
          </div>
        </div>
      </motion.div>

      <motion.div className="space-y-4" variants={itemVariants}>
        <div className="text-sm font-semibold text-gray-300 uppercase tracking-wide px-4">Notification Types</div>
        
        {toggles.map(({ key, title, description }) => (
          <motion.div
            key={key}
            variants={itemVariants}
            whileHover={{ x: 4 }}
            className="flex items-center justify-between p-4 bg-linear-to-r from-gray-700/20 to-gray-700/10 hover:from-gray-700/30 hover:to-gray-700/20 rounded-xl border border-gray-700/50 transition-colors"
          >
            <div className="flex flex-col flex-1">
              <div className="font-medium text-gray-100">
                {title}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {description}
              </div>
            </div>

            <motion.label 
              className="relative inline-flex items-center cursor-pointer ml-4"
              whileTap={{ scale: 0.95 }}
            >
              <input 
                type="checkbox" 
                checked={!!notificationSettings[key]} 
                onChange={(e) => onChange({ ...notificationSettings, [key]: e.target.checked })} 
                className="sr-only peer" 
              />
              <div 
                className="w-11 h-6 bg-gray-600 peer-checked:bg-blue-600 rounded-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-5 transition-colors duration-200"
              />
            </motion.label>
          </motion.div>
        ))}
      </motion.div>

      {/* Email Digest */}
      <motion.div variants={itemVariants} className="p-6 bg-linear-to-r from-purple-600/10 to-pink-600/10 rounded-xl border border-purple-700/30">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-5 h-5 text-purple-400" />
          <label className="block text-sm font-semibold text-gray-200">Email Digest</label>
        </div>
        <select 
          value={notificationSettings.emailDigest} 
          onChange={(e) => onChange({ ...notificationSettings, emailDigest: e.target.value })} 
          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:border-purple-500 focus:outline-none transition-colors"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </motion.div>

      {/* Quiet Hours */}
      <motion.div 
        variants={itemVariants} 
        className="p-6 bg-linear-to-r from-orange-600/10 to-red-600/10 rounded-xl border border-orange-700/30"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-orange-400" />
            <div>
              <div className="font-semibold text-gray-200">Quiet Hours</div>
              <div className="text-xs text-gray-500 mt-1">Suppress notifications during this period</div>
            </div>
          </div>
          <motion.label 
            className="relative inline-flex items-center cursor-pointer"
            whileTap={{ scale: 0.95 }}
          >
            <input 
              type="checkbox" 
              checked={!!notificationSettings.quietHours?.enabled} 
              onChange={(e) => onChange({ ...notificationSettings, quietHours: { ...(notificationSettings.quietHours || {}), enabled: e.target.checked } })} 
              className="sr-only peer" 
            />
            <div 
              className="w-11 h-6 bg-gray-600 peer-checked:bg-orange-600 rounded-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-5 transition-colors duration-200"
            />
          </motion.label>
        </div>

        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={notificationSettings.quietHours?.enabled ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Start Time</label>
              <input 
                type="time" 
                value={notificationSettings.quietHours?.start || ''} 
                onChange={(e) => onChange({ ...notificationSettings, quietHours: { ...(notificationSettings.quietHours || {}), start: e.target.value } })} 
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">End Time</label>
              <input 
                type="time" 
                value={notificationSettings.quietHours?.end || ''} 
                onChange={(e) => onChange({ ...notificationSettings, quietHours: { ...(notificationSettings.quietHours || {}), end: e.target.value } })} 
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
