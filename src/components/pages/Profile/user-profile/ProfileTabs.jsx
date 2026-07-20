// sections/ProfileTabs.jsx
import React from 'react';
import { motion } from 'framer-motion';

const ProfileTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex-1 bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-2">
      <div className="flex flex-wrap justify-between w-full space-x-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-1 justify-center items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 z-10" />
              {/* {tab.label} */}
              {activeTab === tab?.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-blue-600 rounded-xl"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileTabs;