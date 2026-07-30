// sections/ProfileHeader.jsx
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Camera, Edit, Settings, MapPin, Calendar, Mail, Sparkles, Trophy, Zap, Heart, Flame, TrendingUp, LinkIcon } from 'lucide-react';
import './background.css';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import InviteToStartup from './InviteToStartup';
import AddFriend from './AddFriend';
// ✅ Import the new helpers
import { getAvatarUrl, getMediaUrl } from '@/utils/getMediaUrl';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function to format plan names
const formatPlanName = (planId) => {
  if (!planId) return null;
  return planId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const specialIds = [
  {
    id: 120,
    name: "SF Founder",
    icon: Zap,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20"
  },
  {
    id: 145,
    name: "SF CTO",
    icon: Zap,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20"
  }
];

const ProfileHeader = ({
  user,
  level,
  levelProgress,
  xpToNextLevel,
  isEditing,
  onEditToggle,
  isOtherUser,
  onSettingsClick,
  profileData
}) => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const hasActivePlan = user?.builder_plan_id || user?.founder_plan_id;

  // The API sends createdAt on some shapes and created_at on others, and
  // sometimes neither. Only show the chip when we actually have a date.
  const joinedOn = useMemo(() => {
    const raw = user?.createdAt || user?.created_at;
    if (!raw) return null;
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString();
  }, [user?.createdAt, user?.created_at]);

  // ✅ LevelBadge component – correctly defined inside
  const LevelBadge = ({ level }) => {
    const special = specialIds.find(s => s.id === user?.id);
    if (special) {
      const Icon = special.icon;
      return (
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`absolute -bottom-2 -right-2 px-3 py-1.5 rounded-full border-2 border-gray-800 bg-slate-900 ${special.bgColor} ${special.color} font-semibold text-xs shadow-lg shadow-black/50 backdrop-blur-sm flex items-center gap-1`}
        >
          <Icon className="w-3.5 h-3.5" />
          {special.name}
        </motion.div>
      );
    }

    return (
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-3 py-1.5 rounded-full border-2 border-gray-800 shadow-lg shadow-blue-500/50 backdrop-blur-sm flex items-center gap-1.5"
      >
        <Zap className="w-3.5 h-3.5" />
        Level {level}
      </motion.div>
    );
  };

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
      <div
        className="relative h-48 dashboard-bg"
        style={{
          backgroundImage: user?.cover_photo ? `url(${getMediaUrl(user.cover_photo)})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Profile Info */}
      <div className="relative px-8 pb-6">
        {/* Profile Picture */}
        <div className="relative -top-12">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative w-32 h-32 rounded-full border-4 border-gray-800 bg-gradient-to-br from-blue-500/20 to-purple-500/20 group/picture"
          >
            {/* ✅ Use getAvatarUrl */}
            <img
              src={getAvatarUrl(user)}
              alt={user?.firstName}
              className="w-full h-full object-cover group-hover/picture:scale-110 rounded-full transition-transform duration-300"
              onError={(e) => {
                // Fallback to initials if image fails
                e.target.style.display = 'none';
                const parent = e.target.parentElement;
                const fallback = document.createElement('div');
                fallback.className = 'w-full h-full flex items-center justify-center text-4xl font-bold text-white bg-gradient-to-br from-blue-500 to-purple-600';
                fallback.textContent = (user?.firstName?.[0] || 'U') + (user?.lastName?.[0] || '');
                parent.appendChild(fallback);
              }}
            />

            {/* Level Badge */}
            <LevelBadge level={level} />

            {/* Plan Badge (if active plan exists) */}
            {hasActivePlan && (
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute z-10 -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-gray-800"
              >
                <Zap className="w-3 h-3 inline mr-0.5" />
                Pro
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* User Info */}
        <div className="flex flex-wrap justify-between items-start -mt-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {user?.firstName} {user?.lastName}
              </h1>
              {user?.profile?.socialLinks && Object.entries(user.profile.socialLinks).some(([_, url]) => url) && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700"
                >
                  <LinkIcon className="w-4 h-4 text-cyan-400" />
                  <div className="flex gap-2">
                    {Object.entries(user.profile.socialLinks).map(([platform, url]) =>
                      url && (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-300 hover:text-cyan-400 capitalize text-xs transition-colors"
                          title={platform}
                        >
                          {platform}
                        </a>
                      )
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            <p className="text-gray-300 mb-4 max-w-2xl">
              {user?.profile?.bio}
            </p>

            {/* User Details */}
            <div className="flex flex-wrap gap-3 text-sm">
              {/* Location */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700"
              >
                <MapPin className="w-4 h-4 text-blue-400" />
                {user?.profile?.city ?
                  <span className="text-gray-300">{user?.profile?.city}, {user?.profile?.country}</span>
                  :
                  <span className="text-gray-500">Location not set</span>
                }
              </motion.div>

              {/* Email */}
              {!isOtherUser &&
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700"
                >
                  <Mail className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">{user?.email}</span>
                </motion.div>
              }

              {/* Join Date — hidden rather than rendering "Joined Invalid Date",
                  which is what an absent or malformed createdAt produced. */}
              {joinedOn && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700"
                >
                  <Calendar className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Joined {joinedOn}</span>
                </motion.div>
              )}

              {/* Company */}
              {user?.profile?.company && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700"
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">{user?.profile?.company}</span>
                </motion.div>
              )}

              {/* Streak Days */}
              {profileData?.streak_days > 0 && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3 py-2 bg-orange-500/20 rounded-lg backdrop-blur-sm border border-orange-500/50"
                >
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-300">{profileData.streak_days} day streak</span>
                </motion.div>
              )}

              {/* Satisfaction Score */}
              {profileData?.satisfaction_percentage && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3 py-2 bg-pink-500/20 rounded-lg backdrop-blur-sm border border-pink-500/50"
                >
                  <Heart className="w-4 h-4 text-pink-400" />
                  <span className="text-pink-300">{profileData.satisfaction_percentage}% satisfaction</span>
                </motion.div>
              )}

              {/* Total Revenue */}
              {profileData?.total_revenue > 0 && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500/20 rounded-lg backdrop-blur-sm border border-green-500/50"
                >
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-300">${(profileData.total_revenue || 0).toFixed(2)} revenue</span>
                </motion.div>
              )}

              {/* Achievements Count */}
              {profileData?.achievements?.length > 0 && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 rounded-lg backdrop-blur-sm border border-yellow-500/50"
                >
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-300">{profileData.achievements.length} achievements</span>
                </motion.div>
              )}

              {/* Display Active Plans */}
              {user?.builder_plan_id && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-500/20 rounded-lg backdrop-blur-sm border border-emerald-500/50"
                >
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">{formatPlanName(user?.builder_plan_id)}</span>
                </motion.div>
              )}

              {user?.founder_plan_id && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 rounded-lg backdrop-blur-sm border border-purple-500/50"
                >
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-300">{formatPlanName(user?.founder_plan_id)}</span>
                </motion.div>
              )}

              {
                /* `currentUser` is null until the auth profile resolves, and
                   the whole page threw here on first paint. */
                currentUser?.active_startups_count > 0 && currentUser?.id !== user?.id && (
                  <>
                    <InviteToStartup user={user} />
                    <AddFriend user={user} />
                  </>
              )}

              {/* Profile Completion Warning */}
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
                    className="flex items-center gap-2 px-3 py-2 bg-orange-500/20 rounded-lg backdrop-blur-sm border border-orange-500/50 cursor-pointer"
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSettingsClick}
                /* Was a blue→purple gradient that read as a stray shadcn button
                   against the cosmos palette. Now the gold accent used for
                   primary actions everywhere else. */
                className="flex items-center gap-2 my-4 mx-auto px-4 py-2 rounded-xl border border-gold/40 bg-gold/10 text-gold hover:bg-gold/20 hover:border-gold/60 backdrop-blur-sm transition-all"
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