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
          className={`absolute -bottom-2 -right-2 px-3 py-1.5 rounded-full border-2 border-[var(--border)] bg-slate-900 ${special.bgColor} ${special.color} font-semibold text-xs shadow-lg shadow-black/50 backdrop-blur-sm flex items-center gap-1`}
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
        className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-3 py-1.5 rounded-full border-2 border-[var(--border)] shadow-lg shadow-blue-500/50 backdrop-blur-sm flex items-center gap-1.5"
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
      className="relative mb-8 border border-white/10 hover:border-white/15 rounded-2xl overflow-hidden shadow-2xl bg-slate-950/60 group transition-all duration-300"
    >
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.35, 0.2, 0.35],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Theme-aware glass background — dark panel in dark mode, light in light mode */}
      <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--color-panel)_78%,transparent)] backdrop-blur-xl pointer-events-none" />

      {/* Cover Photo */}
      <div
        className="relative h-36 sm:h-44 md:h-52 dashboard-bg border-b border-white/[0.08] overflow-hidden"
        style={{
          backgroundImage: user?.cover_photo ? `url(${getMediaUrl(user.cover_photo)})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Subtle cover photo gradient ramp overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent pointer-events-none" />
      </div>

      {/* Profile Info */}
      <div className="relative px-3 sm:px-6 md:px-8 pb-5 sm:pb-6">
        {/* Profile Picture */}
        <div className="relative -top-10 sm:-top-12 md:-top-14">
          <motion.div
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="relative w-24 h-24 sm:w-28 md:w-32 sm:h-28 md:h-32 rounded-full border-[3.5px] border-slate-950 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 shadow-[0_8px_30px_rgba(0,0,0,0.7)] group/picture overflow-visible"
          >
            {/* ✅ Use getAvatarUrl */}
            <img
              src={getAvatarUrl(user)}
              alt={user?.firstName}
              className="w-full h-full object-cover group-hover/picture:scale-105 rounded-full transition-transform duration-300"
              onError={(e) => {
                // Fallback to initials if image fails
                e.target.style.display = 'none';
                const parent = e.target.parentElement;
                const fallback = document.createElement('div');
                fallback.className = 'w-full h-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-white bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-full shadow-inner';
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
                className="absolute z-10 -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full border-2 border-slate-950 shadow-md flex items-center gap-0.5"
              >
                <Zap className="w-3 h-3 inline shrink-0" />
                Pro
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* User Info */}
        <div className="flex flex-wrap justify-between items-start -mt-6 sm:-mt-8">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm break-words max-w-full">
                {user?.firstName} {user?.lastName}
              </h1>
              {user?.profile?.socialLinks && Object.entries(user.profile.socialLinks).some(([_, url]) => url) && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 hover:bg-slate-800/80 rounded-xl backdrop-blur-md border border-white/10 hover:border-white/20 shadow-sm transition-all flex-wrap">
                  <LinkIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <div className="flex gap-2.5 flex-wrap">
                    {Object.entries(user.profile.socialLinks).map(([platform, url]) =>
                      url && (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-300 hover:text-cyan-400 capitalize text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400/50 rounded-sm"
                          title={platform}
                        >
                          {platform}
                        </a>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {user?.profile?.bio && (
              <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed mb-4 max-w-2xl font-normal break-words">
                {user.profile.bio}
              </p>
            )}

            {/* User Details */}
            <div className="flex flex-wrap gap-2 sm:gap-2.5 text-xs sm:text-sm">
              {/* Location */}
              <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-900/60 hover:bg-slate-800/70 rounded-xl backdrop-blur-md border border-white/10 hover:border-white/20 text-xs font-medium shadow-sm transition-all max-w-full">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                {user?.profile?.city ?
                  <span className="text-slate-200 truncate">{user?.profile?.city}, {user?.profile?.country}</span>
                  :
                  <span className="text-slate-400">Location not set</span>
                }
              </div>

              {/* Email */}
              {!isOtherUser && (
                <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-900/60 hover:bg-slate-800/70 rounded-xl backdrop-blur-md border border-white/10 hover:border-white/20 text-xs font-medium shadow-sm transition-all max-w-full">
                  <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="text-slate-200 truncate max-w-[200px] sm:max-w-xs">{user?.email}</span>
                </div>
              )}

              {/* Join Date */}
              {joinedOn && (
                <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-900/60 hover:bg-slate-800/70 rounded-xl backdrop-blur-md border border-white/10 hover:border-white/20 text-xs font-medium shadow-sm transition-all">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-slate-200">Joined {joinedOn}</span>
                </div>
              )}

              {/* Company */}
              {user?.profile?.company && (
                <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-900/60 hover:bg-slate-800/70 rounded-xl backdrop-blur-md border border-white/10 hover:border-white/20 text-xs font-medium shadow-sm transition-all max-w-full">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-slate-200 truncate">{user?.profile?.company}</span>
                </div>
              )}

              {/* Streak Days */}
              {profileData?.streak_days > 0 && (
                <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/15 rounded-xl backdrop-blur-md border border-amber-500/30 text-xs font-medium shadow-sm transition-all">
                  <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-amber-300">{profileData.streak_days} day streak</span>
                </div>
              )}

              {/* Satisfaction Score */}
              {profileData?.satisfaction_percentage && (
                <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-pink-500/10 hover:bg-pink-500/15 rounded-xl backdrop-blur-md border border-pink-500/30 text-xs font-medium shadow-sm transition-all">
                  <Heart className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span className="text-pink-300">{profileData.satisfaction_percentage}% satisfaction</span>
                </div>
              )}

              {/* Total Revenue */}
              {profileData?.total_revenue > 0 && (
                <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/15 rounded-xl backdrop-blur-md border border-emerald-500/30 text-xs font-medium shadow-sm transition-all">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-emerald-300">${(profileData.total_revenue || 0).toFixed(2)} revenue</span>
                </div>
              )}

              {/* Achievements Count */}
              {profileData?.achievements?.length > 0 && (
                <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/15 rounded-xl backdrop-blur-md border border-amber-500/30 text-xs font-medium shadow-sm transition-all">
                  <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-amber-300">{profileData.achievements.length} achievements</span>
                </div>
              )}

              {/* Display Active Plans */}
              {user?.builder_plan_id && (
                <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/15 rounded-xl backdrop-blur-md border border-emerald-500/30 text-xs font-medium shadow-sm transition-all">
                  <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-emerald-300">{formatPlanName(user?.builder_plan_id)}</span>
                </div>
              )}

              {user?.founder_plan_id && (
                <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/15 rounded-xl backdrop-blur-md border border-purple-500/30 text-xs font-medium shadow-sm transition-all">
                  <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="text-purple-300">{formatPlanName(user?.founder_plan_id)}</span>
                </div>
              )}

              {currentUser?.active_startups_count > 0 && currentUser?.id !== user?.id && (
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
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onSettingsClick}
                    className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl backdrop-blur-md border border-rose-500/30 cursor-pointer text-xs font-medium shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="text-rose-300">Complete your profile</span>
                  </motion.div>
                );
              })()}
            </div>
          </div>

          {/* Action Buttons */}
          {currentUser && currentUser.id === user?.id && (
            <div className="flex items-center mt-3 sm:mt-0 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onSettingsClick}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/50 backdrop-blur-sm transition-all text-xs font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 min-h-[40px] sm:min-h-0"
              >
                <Settings className="w-3.5 h-3.5" />
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