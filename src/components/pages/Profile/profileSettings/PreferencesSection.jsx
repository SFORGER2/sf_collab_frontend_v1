/* eslint-disable no-unused-vars */
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Users, Settings } from "lucide-react";
import { apply } from "@/services/theme/theme";

export default function PreferencesSection({ formData, onChange }) {
  const prefs = formData.preferences || {};

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

  const preferences = [
    // {
    //   key: 'showJobApplications', title: 'Show Job Applications', description: 'Receive job posting opportunities', icon: Briefcase, color: 'blue', onChange: () => {
    //     localStorage.setItem('showJobApplicationsPrompt', 'true');
    //     onChange({ ...prefs, showJobApplications: true }); // Update formData
    //   }
    // },
    // { key: 'showInfluencerApplications', title: 'Show Influencer Applications', description: 'Receive influencer collaboration requests', icon: Users, color: 'purple' }
  ];

  const handlePreferenceChange = (key, value) => {
    onChange({ ...prefs, [key]: value });
    if (key === 'showJobApplications' && value) {
      localStorage.setItem('showJobApplicationsPrompt', 'true');
    }
  };

  const handleLanguageChange = (lang) => {
    onChange({ ...prefs, language: lang });
  };

  const handleThemeChange = (theme) => {
    onChange({ ...prefs, theme: theme });
    // Keep the app-wide theme in sync with the user's preference
    if (theme === 'dark') apply('dark');
    else if (theme === 'light') apply('light');
    else apply(window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  };

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-blue-600/20 rounded-lg">
            <Settings className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Preferences</h2>
            <p className="text-sm text-gray-400 mt-1">Customize your experience and visibility settings</p>
          </div>
        </div>
      </motion.div>

      {/* Application Visibility Section */}
      {preferences.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
            <h3 className="text-lg font-semibold">Application Visibility</h3>
          </div>

          <div className="space-y-3">
            {preferences.map(({ key, title, description, icon: Icon, color }) => (
              <motion.div
                key={key}
                variants={itemVariants}
                whileHover={{ x: 4 }}
                className={`flex items-center justify-between p-4 bg-linear-to-r from-${color}-700/20 to-${color}-700/10 hover:from-${color}-700/30 hover:to-${color}-700 rounded-xl border border-${color}-700/50 transition-colors`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Icon className={`w-5 h-5 text-${color}-400`} />
                  <div className="flex flex-col">
                    <div className="font-medium text-gray-100">{title}</div>
                    <div className="text-xs text-gray-500 mt-1">{description}</div>
                  </div>
                </div>

                <motion.label
                  className="relative h-full inline-flex items-center cursor-pointer ml-4"
                  whileTap={{ scale: 0.95 }}
                >
                  <input
                    type="checkbox"
                    checked={!!prefs[key]}
                    onChange={(e) => handlePreferenceChange(key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div
                    className={`absolute -translate-x-10 w-11 h-6 bg-gray-600 peer-checked:bg-${color}-700 rounded-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-5`}
                  />
                </motion.label>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Localization Settings */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
          <h3 className="text-lg font-semibold">Localization</h3>
        </div>

        <motion.div variants={itemVariants} className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Language</label>
          <select
            value={prefs.language || 'en'}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:border-purple-500 focus:outline-none transition-colors hover:border-gray-500"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="it">Italiano</option>
          </select>
        </motion.div>
      </motion.div>

      {/* Display Settings */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-pink-500 rounded-full"></div>
          <h3 className="text-lg font-semibold">Display</h3>
        </div>

        <motion.div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Theme</label>
          <div className="grid grid-cols-3 gap-3">
            {['light', 'dark', 'auto'].map((theme) => (
              <motion.button
                key={theme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleThemeChange(theme)}
                className={`px-4 py-3 rounded-lg font-medium transition-all border ${
                  prefs.theme === theme
                    ? 'bg-pink-600 border-pink-500 text-white'
                    : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
              >
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Divider */}
      <motion.div
        className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      />
    </motion.div>
  );
}
