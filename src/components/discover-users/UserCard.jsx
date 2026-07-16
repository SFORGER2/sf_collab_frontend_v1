import React from 'react';
import { motion } from 'framer-motion';
import { ConnectionButton } from '@/components/connection/ConnectionButton';
import { getProfilePicture } from '@/utils/getProfilePicture';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const UserCard = ({ user, onOpen }) => {
  const fullName = user.fullName || 
    `${user.first_name || ''} ${user.last_name || ''}`.trim() || 
    'Unknown';



  const initials = `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 
                 hover:border-blue-500/30 transition-all cursor-pointer group flex flex-col justify-between h-full"
    >
      {/* Click to open modal */}
      <div onClick={() => onOpen(user)} className="flex-1 flex flex-col justify-between">
        <div>
          {/* Avatar */}
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
              <img
                src={getProfilePicture(user)}
                alt={fullName}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </div>

          {/* Name */}
          <h3 className="text-white font-semibold text-center truncate group-hover:text-blue-400 transition-colors">
            {fullName}
          </h3>

          {/* Role */}
          {user.role && (
            <p className="text-gray-400 text-xs text-center capitalize mt-1">
              {user.role}
            </p>
          )}

          {/* Company */}
          {user.profile?.company && (
            <p className="text-gray-500 text-xs text-center truncate mt-1">
              {user.profile.company}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-700/30">
          <div className="text-center p-1.5 bg-slate-900/40 border border-slate-800/50 rounded-lg">
            <p className="text-xs font-bold text-blue-400">{user.xp_points || 0}</p>
            <p className="text-[9px] text-gray-500 uppercase font-medium tracking-wider">XP</p>
          </div>
          <div className="text-center p-1.5 bg-slate-900/40 border border-slate-800/50 rounded-lg">
            <p className="text-xs font-bold text-purple-400">{user.active_startups_count || 0}</p>
            <p className="text-[9px] text-gray-500 uppercase font-medium tracking-wider">Startups</p>
          </div>
        </div>
      </div>

      {/* Connection Button - Outside the click area for modal */}
      <div className="mt-3 pt-3 border-t border-gray-700/50" onClick={(e) => e.stopPropagation()}>
        <ConnectionButton 
          userId={user.id} 
          size="sm"
          className="w-full"
        />
      </div>
    </motion.div>
  );
};

export default UserCard;