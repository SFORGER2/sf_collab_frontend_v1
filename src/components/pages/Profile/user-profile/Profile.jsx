import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  User, Award, BarChart3,
  Rocket, TrendingUp, Zap, Globe, Briefcase, ExternalLink,
  Badge, IdCard
} from 'lucide-react';

import ProfileHeader from './ProfileHeader';
import ProfileDetail from './ProfileDetail';
import ProfileStats from './ProfileStats';
import ProfileTabs from './ProfileTabs';
import AchievementSection from './AchievementSection';
import ActivityFeed from './ActivityFeed';
import ProfileSettings from '../profileSettings/ProfileSettings';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { builderProfileAPI } from '@/services/builderAPI';
import { usersAPI } from '@/utils/APIs/userAPI';
import { updateUser as updateUserSlice } from '@/services/auth/authSlice';
import { fieldPayload, toSchemaProfile } from '@/services/profile/profileAdapter';
import { toast } from 'react-toastify';
import { dashboardAPI } from '@/utils/APIs/dashboardAPI';
import { FaMoneyBill } from 'react-icons/fa6';
import { formatCurrency } from '@/lib/utils';
import { API_URL } from '@/utils/config';
import { RiBillFill } from 'react-icons/ri';
import UserRatingCard from "@/components/ui/UserRatingCard";

// ✅ NEW IMPORTS
import { FollowButton } from '@/components/FollowButton';
import { FollowersModal } from '@/components/FollowersModal';
import { getMediaUrl } from '@/utils/getMediaUrl';

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('overview');
  const { user: authUser, access_token } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [queryParams] = useSearchParams();

  const [portfolio, setPortfolio] = useState([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // ✅ NEW STATE for modal
  const [modalType, setModalType] = useState(null); // 'followers' or 'following'

  const viewedUserId = queryParams.get("userId");
  const page = queryParams.get("page");

  useEffect(() => {
    setShowSettings(!!page);
  }, [page]);

  const isOtherUser = viewedUserId && authUser?.id && String(viewedUserId) !== String(authUser.id);

  // Fetch profile data from dashboard endpoint
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!viewedUserId && !authUser?.id) return;

      const userId = viewedUserId || authUser.id;
      setLoadingProfile(true);

      try {
        const response = await dashboardAPI.getUserProfile(userId);
        if (response.success) {
          console.log("Profile data:", response.data);
          setProfileData(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, [viewedUserId, authUser?.id]);

  // Fetch portfolio
  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!authUser || !access_token || isOtherUser) return;

      setLoadingPortfolio(true);
      try {
        const response = await builderProfileAPI.getProfile(access_token);
        if (response.success && response.data) {
          setPortfolio(response.data.portfolio_items || []);
        }
      } catch (err) {
        console.error('Failed to fetch portfolio:', err);
      } finally {
        setLoadingPortfolio(false);
      }
    };

    fetchPortfolio();
  }, [authUser, access_token, isOtherUser]);

  const tabs = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: User },
    // The full schema-driven profile — every field the assistant can fill.
    { id: 'details', label: 'Full Profile', icon: IdCard },
    { id: 'achievements', label: 'Achievements', icon: Award },
    !isOtherUser && { id: 'activity', label: 'Activity', icon: BarChart3 },
    { id: 'startups', label: 'Startups', icon: Briefcase },
    authUser && !isOtherUser && { id: 'transactions', label: 'Transactions', icon: RiBillFill },
  ].filter(Boolean), [authUser, isOtherUser]);

  if (showSettings && !isOtherUser && authUser) {
    return <ProfileSettings user={authUser} back={() => window.history.back()} activeSection={page} initialActiveSection={page} />;
  }

  // ✅ OPTIMISTIC FOLLOW COUNT UPDATE
  const handleFollowChange = (newStatus) => {
    setProfileData(prev => ({
      ...prev,
      followersCount: newStatus ? (prev?.followersCount || 0) + 1 : Math.max(0, (prev?.followersCount || 0) - 1)
    }));
  };

  const user = profileData || authUser;

  /**
   * Persist one field from the inline pencil editor.
   *
   * Throws on failure so InlineField can re-open with the draft intact —
   * silently swallowing here would lose whatever the person just typed.
   */
  const handleFieldSave = async (key, value) => {
    const payload = fieldPayload(key, value, authUser);
    if (!payload) return; // derived field — earned, not entered

    const response = await usersAPI.updateProfile(
      authUser.id, payload, access_token, 'application/json'
    );
    const result = response?.data || response;
    if (result?.error) throw new Error(result.error);
    if (result?.success === false) throw new Error(result.message || 'Update failed');

    const updated = result?.user || result?.data?.user || null;
    if (updated) {
      dispatch(updateUserSlice(updated));
      setProfileData((prev) => (prev ? { ...prev, ...updated } : prev));
    }
    toast.success('Saved');
  };

  if (!user || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Loading profile...</p>
      </div>
    );
  }

  const calculateLevel = (xp) => Math.floor(xp / 1000) + 1;
  const xp = user?.xp_points || 0;
  const level = calculateLevel(xp);
  const xpToNextLevel = level * 1000 - xp;
  const levelProgress = ((xp % 1000) / 1000) * 100;

  return (
    <div className="min-h-screen text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>

      <div className="relative w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* ───── WRAP HEADER WITH FOLLOW BUTTON ───── */}
        <div className="relative">
          <ProfileHeader
            user={user}
            level={level || 0}
            levelProgress={levelProgress}
            xpToNextLevel={xpToNextLevel}
            isEditing={isEditing}
            isOtherUser={isOtherUser}
            onEditToggle={() => setIsEditing(!isEditing)}
            onSettingsClick={() => navigate("/user-profile?page=settings")}
          />
          {isOtherUser && (
            <div className="absolute top-4 right-4 z-10">
              <FollowButton targetUserId={viewedUserId} onFollowChange={handleFollowChange} />
            </div>
          )}
        </div>
        <ProfileStats profile={profileData} />
        <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-5 sm:space-y-6">
            {/* Level Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-2xl p-5 sm:p-6 shadow-xl transition-all"
            >
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-extrabold border-4 border-slate-950 shadow-[0_0_20px_rgba(99,102,241,0.35)]">
                    {level}
                  </div>
                </div>
                <h3 className="mt-4 text-base sm:text-lg font-bold text-white">Level {level}</h3>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">{xp.toLocaleString()} XP</p>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
                    <span>Next: Level {level + 1}</span>
                    <span className="font-mono">{xpToNextLevel} XP needed</span>
                  </div>
                  <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-white/5">
                    <div
                      className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                      style={{ width: `${levelProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-2xl p-5 sm:p-6 shadow-xl transition-all"
            >
              <h4 className="font-bold text-white mb-4 flex items-center gap-2 text-sm sm:text-base">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                Quick Stats
              </h4>
              <div className="space-y-1">
                {!isOtherUser && (
                  <div className="flex justify-between items-center text-xs sm:text-sm py-2 px-1 border-b border-white/[0.04] last:border-0 rounded-lg hover:bg-white/[0.02] transition-colors">
                    <span className="text-slate-400 font-medium">SF Coins</span>
                    <span className="text-amber-400 font-bold">{profileData?.credits || 0}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs sm:text-sm py-2 px-1 border-b border-white/[0.04] last:border-0 rounded-lg hover:bg-white/[0.02] transition-colors">
                  <span className="text-slate-400 font-medium">Streak Days</span>
                  <span className="text-amber-400 font-semibold">{profileData?.streak_days || 0} 🔥</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm py-2 px-1 border-b border-white/[0.04] last:border-0 rounded-lg hover:bg-white/[0.02] transition-colors">
                  <span className="text-slate-400 font-medium">Satisfaction</span>
                  <span className="text-emerald-400 font-semibold">{profileData?.satisfaction_percentage || 0}%</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm py-2 px-1 border-b border-white/[0.04] last:border-0 rounded-lg hover:bg-white/[0.02] transition-colors">
                  <span className="text-slate-400 font-medium">Total Revenue</span>
                  <span className="text-blue-400 font-semibold">${(profileData?.total_revenue || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm py-2 px-1 border-b border-white/[0.04] last:border-0 rounded-lg hover:bg-white/[0.02] transition-colors">
                  <span className="text-slate-400 font-medium">Friends</span>
                  <span className="text-cyan-400 font-semibold">{profileData?.friendsCount || 0}</span>
                </div>
                {/* ─── FOLLOWING / FOLLOWERS ROWS ─── */}
                <div
                  className="flex justify-between items-center text-xs sm:text-sm py-2 px-1 border-b border-white/[0.04] last:border-0 rounded-lg cursor-pointer hover:bg-white/[0.04] hover:text-cyan-400 transition-all"
                  onClick={() => setModalType('following')}
                >
                  <span className="text-slate-400 font-medium">Following</span>
                  <span className="text-cyan-400 font-semibold">{profileData?.followingCount || 0}</span>
                </div>
                <div
                  className="flex justify-between items-center text-xs sm:text-sm py-2 px-1 border-b border-white/[0.04] last:border-0 rounded-lg cursor-pointer hover:bg-white/[0.04] hover:text-cyan-400 transition-all"
                  onClick={() => setModalType('followers')}
                >
                  <span className="text-slate-400 font-medium">Followers</span>
                  <span className="text-cyan-400 font-semibold">{profileData?.followersCount || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm py-2 px-1 border-b border-white/[0.04] last:border-0 rounded-lg hover:bg-white/[0.02] transition-colors">
                  <span className="text-slate-400 font-medium">Founded Startups</span>
                  <span className="text-emerald-400 font-semibold">{profileData?.foundedStartups?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm py-2 px-1 border-b border-white/[0.04] last:border-0 rounded-lg hover:bg-white/[0.02] transition-colors">
                  <span className="text-slate-400 font-medium">Startup Memberships</span>
                  <span className="text-purple-400 font-semibold">{profileData?.startupMemberships?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm py-2 px-1 border-b border-white/[0.04] last:border-0 rounded-lg hover:bg-white/[0.02] transition-colors">
                  <span className="text-slate-400 font-medium">Ideas</span>
                  <span className="text-amber-400 font-semibold">{profileData?.ideas?.length || 0}</span>
                </div>
              </div>
            </motion.div>

            {/* Social Links */}
            {profileData?.social && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-2xl p-5 sm:p-6 shadow-xl transition-all"
              >
                <h4 className="font-bold text-white mb-4 text-sm sm:text-base">Connect</h4>
                <div className="space-y-2">
                  {profileData.social.linkedinUrl && (
                    <a href={profileData.social.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-cyan-400 font-medium transition-colors p-1 rounded-lg hover:bg-white/[0.02]">
                      LinkedIn
                    </a>
                  )}
                  {profileData.social.githubUrl && (
                    <a href={profileData.social.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-white font-medium transition-colors p-1 rounded-lg hover:bg-white/[0.02]">
                      GitHub
                    </a>
                  )}
                  {profileData.social.websiteUrl && (
                    <a href={profileData.social.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-purple-400 font-medium transition-colors p-1 rounded-lg hover:bg-white/[0.02]">
                      <Globe className="w-4 h-4" />
                      Portfolio
                    </a>
                  )}
                </div>
              </motion.div>
            )}

            {/* Ratings */}
            {user?.id && (
              <UserRatingCard
                subjectId={user.id}
                subjectName={[user.first_name, user.last_name].filter(Boolean).join(' ') || 'this user'}
              />
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-5 sm:space-y-6">
            <ProfileTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="min-h-[400px] sm:min-h-[500px]">
              {activeTab === "details" && (
                <ProfileDetail
                  /* The adapter flattens `user`, `user.profile` and
                     `profile.socialLinks` onto the schema's field keys —
                     the API splits a person across all three. */
                  profile={toSchemaProfile(authUser, profileData)}
                  isOwner={!isOtherUser}
                  onFieldSave={!isOtherUser ? handleFieldSave : undefined}
                />
              )}

              {activeTab === "overview" && (
                <div className="space-y-6">
                  <ActivityFeed
                    activities={[
                      ...(profileData?.ideas || []).map(i => ({
                        type: 'idea_created', title: `Created idea: ${i.title}`, timestamp: i.createdAt,
                      })),
                      ...(profileData?.knowledgePosts || []).map(k => ({
                        type: 'knowledge_posted', title: `Published: ${k.title}`, timestamp: k.createdAt,
                      })),
                      ...(profileData?.posts || []).map(p => ({
                        type: 'post_created', title: `New post`, timestamp: p.createdAt,
                      })),
                      ...(profileData?.achievements || []).map(a => ({
                        type: 'achievement_unlocked', title: `Unlocked: ${a.achievement?.title || 'Achievement'}`, timestamp: a.unlocked_at || a.created_at,
                      })),
                    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 15)}
                  />

                </div>
              )}

              {activeTab === "achievements" && (
                <AchievementSection achievements={profileData?.achievements || []} />
              )}
              {activeTab === "activity" && !isOtherUser && (
                <div className="space-y-6">
                  {/* Knowledge Posts */}
                  {profileData?.knowledgePosts?.length > 0 && (
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                        📚 Knowledge Posts
                      </h3>
                      <div className="space-y-3">
                        {profileData.knowledgePosts.map((post) => (
                          <div key={`k-${post.id}`} className="p-4 bg-slate-800/40 border border-white/5 rounded-xl flex justify-between items-start hover:border-white/15 transition-colors">
                            <div>
                              <h4 className="font-semibold text-white text-sm sm:text-base">{post.title}</h4>
                              <p className="text-xs sm:text-sm text-slate-300 mt-1">{post.titleDescription}</p>
                              <div className="flex gap-4 mt-2.5 text-xs text-slate-400 font-medium">
                                <span>👀 {post.views}</span>
                                <span>❤️ {post.likes}</span>
                                <span>📥 {post.downloads}</span>
                              </div>
                            </div>
                            <span className="text-xs text-slate-400 shrink-0 font-medium">{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Posts */}
                  {profileData?.posts?.length > 0 && (
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                        ✍️ Posts
                      </h3>
                      <div className="space-y-3">
                        {profileData.posts.map((post) => (
                          <div key={`p-${post.id}`} className="p-4 bg-slate-800/40 border border-white/5 rounded-xl flex justify-between items-start hover:border-white/15 transition-colors">
                            <div>
                              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{post.content?.slice(0, 200)}{post.content?.length > 200 ? '…' : ''}</p>
                              <div className="flex gap-4 mt-2.5 text-xs text-slate-400 font-medium">
                                <span>❤️ {post.likes}</span>
                                <span>💬 {post.commentsCount}</span>
                                <span>🔄 {post.shares}</span>
                              </div>
                            </div>
                            <span className="text-xs text-slate-400 shrink-0 font-medium">{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Transactions (own profile only) */}
                  {!isOtherUser && profileData?.transactions?.length > 0 && (
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                        💰 Transactions
                      </h3>
                      <div className="space-y-3">
                        {profileData.transactions.map((tx) => (
                          <div key={`tx-${tx.id}`} className="p-4 bg-slate-800/40 border border-white/5 rounded-xl flex justify-between items-center hover:border-white/15 transition-colors">
                            <div>
                              <p className="font-semibold text-white text-xs sm:text-sm capitalize">{tx.type || 'Payment'}</p>
                              {tx.donation_message && <p className="text-xs sm:text-sm text-slate-300 mt-0.5">{tx.donation_message}</p>}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-emerald-400 text-sm sm:text-base">${(tx.amount / 100).toFixed(2)} {tx.currency?.toUpperCase()}</p>
                              <p className="text-xs text-slate-400 mt-0.5 font-medium">{new Date(tx.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assigned Tasks */}
                  {!isOtherUser && profileData?.assignedTasks && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl"
                    >
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Rocket className="w-5 h-5 text-blue-400" />
                        Assigned Tasks
                      </h3>
                      <div className="space-y-2 text-xs sm:text-sm text-slate-300 font-medium">
                        <p>Total: <span className="text-white font-bold">{profileData.assignedTasks.total}</span></p>
                        <p>Completed: <span className="text-emerald-400 font-bold">{profileData.assignedTasks.completed}</span></p>
                        <p>Pending: <span className="text-amber-400 font-bold">{profileData.assignedTasks.pending}</span></p>
                      </div>
                    </motion.div>
                  )}

                  {/* Ideas */}
                  {profileData?.ideas?.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl"
                    >
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Ideas</h3>
                      <div className="grid gap-3">
                        {profileData.ideas.map((idea) => (
                          <div key={idea.id} className="p-4 bg-slate-800/40 border border-white/5 rounded-xl hover:border-white/15 transition-colors">
                            <h4 className="font-semibold text-white text-sm sm:text-base">{idea.title}</h4>
                            <p className="text-xs sm:text-sm text-slate-300 mt-1">{idea.description}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

              )}
              {activeTab === "startups" && (
                <div className="space-y-6">
                  {(profileData?.startupMemberships || []).filter(m => !(profileData?.foundedStartups || []).some(s => s.id === m?.startup?.id)).length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl"
                    >
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-purple-400" />
                        Member in Startups
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        {profileData.startupMemberships.map((membership) => (
                          <motion.div
                            key={membership.startup.id}
                            whileHover={{ y: -3 }}
                            className="group relative p-5 bg-slate-800/40 border border-white/10 rounded-xl hover:border-blue-500/50 transition-all cursor-pointer overflow-hidden shadow-md"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all pointer-events-none" />

                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  {membership.startup.logo_url ? (
                                    <img
                                      src={getMediaUrl(membership.startup.logo_url)}
                                      alt={membership.startup.name}
                                      className="w-10 h-10 rounded-lg object-cover border border-amber-600/30 shadow-sm"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-white/10">
                                      <Briefcase className="w-5 h-5 text-slate-400" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-white text-sm sm:text-base truncate">{membership.startup.name}</h4>
                                    <p className="text-xs text-slate-400 font-medium">{membership.startup.industry}</p>
                                  </div>
                                </div>
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 font-semibold">{membership.startup.stage}</span>
                              </div>

                              <p className="text-xs sm:text-sm text-slate-300 mb-4 line-clamp-2 leading-relaxed">{membership.startup.description}</p>

                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {membership.startup.roles && Object.keys(membership.startup.roles).slice(0, 2).map((role) => (
                                  <span key={role} className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 border border-white/5 rounded-full font-medium">
                                    {role}
                                  </span>
                                ))}
                                {membership.startup.roles && Object.keys(membership.startup.roles).length > 2 && (
                                  <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 border border-white/5 rounded-full font-medium">
                                    +{Object.keys(membership.startup.roles).length - 2}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                <div className="flex gap-3 text-xs text-slate-400 font-medium">
                                  <span className="flex items-center gap-1">
                                    👥 {membership.startup.memberCount}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    💰 {formatCurrency(membership.startup.funding_amount) || "—"}
                                  </span>
                                </div>
                                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {profileData?.foundedStartups?.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl"
                    >
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Rocket className="w-5 h-5 text-amber-400" />
                        Founded Startups
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        {profileData.foundedStartups.map((startup) => (
                          <motion.div
                            key={startup.id}
                            whileHover={{ y: -3 }}
                            className="group relative p-5 bg-gradient-to-br from-amber-950/20 to-orange-950/20 border border-amber-500/30 rounded-xl hover:border-amber-500/60 transition-all cursor-pointer shadow-md"
                          >
                            <div className="relative z-10">
                              <div className="flex items-start gap-3 mb-3">
                                {startup.logo_url ? (
                                  <img
                                    src={startup.logo_url.startsWith("http") ? startup.logo_url : `${API_URL}${startup.logo_url}`}
                                    alt={startup.name}
                                    className="w-10 h-10 rounded-lg object-cover border border-amber-500/30 shadow-sm"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/30">
                                    <Rocket className="w-5 h-5 text-amber-400" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-white text-sm sm:text-base truncate">{startup.name}</h4>
                                  <p className="text-xs text-amber-300/80 font-medium">{startup.stage}</p>
                                </div>
                              </div>
                              <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">{startup.description}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {!profileData?.startupMemberships?.length && !profileData?.foundedStartups?.length && (
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center py-16 text-slate-400 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-white/5 flex items-center justify-center mb-3">
                        <Briefcase className="w-6 h-6 text-purple-400/50" />
                      </div>
                      <p className="text-sm font-semibold text-white">No startup involvement yet</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">Startups you found or join as a member will be highlighted here.</p>
                    </div>
                  )}
                </div>
              )}
              {activeTab === "transactions" && (
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FaMoneyBill className="w-5 h-5 text-emerald-400" />
                    Transactions
                  </h3>
                  {profileData?.transactions?.length > 0 ? (
                    <div className="space-y-3">
                      {profileData.transactions.map((tx) => (
                        <div key={`tx-${tx.id}`} className="p-4 bg-slate-800/40 border border-white/5 rounded-xl flex justify-between items-center hover:border-white/15 transition-colors">
                          <div>
                            <p className="font-semibold text-white text-xs sm:text-sm capitalize">{tx.type || 'Payment'}</p>
                            {tx.donation_message && <p className="text-xs sm:text-sm text-slate-300 mt-0.5">{tx.donation_message}</p>}
                            <p className="text-xs text-slate-400 mt-1 font-medium">Status: <span className="capitalize text-slate-200">{tx.status}</span></p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-400 text-sm sm:text-base">${(tx.amount / 100).toFixed(2)} {tx.currency?.toUpperCase()}</p>
                            <p className="text-xs text-slate-400 mt-0.5 font-medium">{new Date(tx.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-14 text-slate-400 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-white/5 flex items-center justify-center mb-3">
                        <FaMoneyBill className="w-6 h-6 text-emerald-400/50" />
                      </div>
                      <p className="text-sm font-semibold text-white">No transactions yet</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">Your payment history and credit purchases will be listed here.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div >
        </div >
      </div >

      {/* ───── FOLLOWERS / FOLLOWING MODAL ───── */}
      < FollowersModal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        userId={viewedUserId || user?.id}
        type={modalType}
      />
    </div >
  );
};

export default Profile;