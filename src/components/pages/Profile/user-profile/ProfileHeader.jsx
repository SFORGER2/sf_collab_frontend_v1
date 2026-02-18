// sections/ProfileHeader.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Edit, Settings, MapPin, Calendar, Mail, Sparkles, Trophy } from 'lucide-react';
import './background.css';
import { Link } from 'react-router-dom';
import { getProfilePicture } from '@/utils/getProfilePicture';
import { useSelector } from 'react-redux';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';


const ProfileHeader = ({ 
  user, 
  level, 
  levelProgress, 
  xpToNextLevel, 
  isEditing, 
  onEditToggle, 
  isOtherUser,
  onSettingsClick 
}) => {
  const { user: currentUser } = useSelector((state) => state.auth);
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-8 border border-gray-700 rounded-2xl overflow-hidden group"
    >   
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Dark Glass Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-black/80 to-gray-900/80 backdrop-blur-xl" />


      {/* Cover Photo */}
      <div className="relative h-48 dashboard-bg">
        {/* <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20" />
        <button className="absolute top-4 left-4 p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors backdrop-blur-sm">
          <Camera className="w-4 h-4" />
        </button> */}
      </div>

      {/* Profile Info */}
      <div className="relative px-8 pb-6">
        {/* Profile Picture */}
        <div className="relative -top-12">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="relative w-32 h-32  rounded-full border-4 border-gray-800 bg-gradient-to-br from-blue-500/20 to-purple-500/20 group/picture"
          >
            <img loading="lazy" 
              src={getProfilePicture(user) }
              alt={user?.firstName}
              className="w-full h-full object-cover group-hover/picture:scale-110 rounded-full transition-transform duration-300"
            />
            {/* <motion.button 
              whileHover={{ scale: 1.1 }}
              className="absolute top-2 right-2 p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all backdrop-blur-sm"
            >
              <Camera className="w-3 h-3" />
            </motion.button> */}
            
            {/* Level Badge */}
            <div className="absolute z-1 -bottom-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full border-2 border-gray-800">
              <Trophy className="w-3 h-3 inline mr-1" />
              Lvl {level}
            </div>
          </motion.div>
        </div>

        {/* User Info */}
        <div className="flex flex-wrap justify-between items-start -mt-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {user?.firstName} {user?.lastName}
              </h1>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 rounded-full text-sm backdrop-blur-sm"
              >
                <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse"></div>
                Level {level} Explorer
              </motion.div>
            </div>
            
            <p className="text-gray-300 mb-4 max-w-2xl">
              {user?.profile?.bio}
            </p>

            {/* User Details */}
            <div className="flex flex-wrap gap-6 text-sm">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700"
              >
                <MapPin className="w-4 h-4 text-blue-400" />
                {user?.profile?.city ?
                  
                  < span className="text-gray-300">{user?.profile.city}, {user?.profile.country}</span>
                  :
                  <span className="text-gray-500">Location not set</span>
                }
              </motion.div>
              
              {
                !isOtherUser &&
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700"
                >
                  <Mail className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">{user?.email}</span>
                </motion.div>
              }
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700"
              >
                <Calendar className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
              </motion.div>
              
              {user?.profile.company && (
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700"
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">{user?.profile.company}</span>
                </motion.div>
              )}
              {(() => {
                const emptyFields = [
                  !user?.profile?.bio,
                  !user?.profile?.city,
                  !user?.profile?.country,
                  !user?.profile?.company,
                ].filter(Boolean).length;
                
                return emptyFields >= 3 && currentUser && currentUser.id === user?.id && (
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    onClick={onSettingsClick}
                    className="flex items-center gap-2 px-3 py-2 bg-orange-500/20 rounded-lg backdrop-blur-sm border border-orange-500/50"
                  >
                    <Sparkles className="w-4 h-4 text-red-400" />
                    <span className="text-red-300">Complete your profile</span>
                    </motion.div>

                );
              })()}
            </div>
          </div>

          {/* Action Buttons */}
          {currentUser && currentUser.id === user?.id && (
            <div className="flex flex-col gap-4">
              {/* <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEditToggle}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-lg transition-all"
            >
              <Edit className="w-4 h-4" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </motion.button> */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSettingsClick}
                className="flex items-center gap-2 my-4 mx-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 backdrop-blur-sm rounded-lg transition-all"
              >
                <Settings className="w-4 h-4" />
                Edit Profile
              </motion.button>
            </div>
)}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;