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
import { useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { builderProfileAPI } from '@/services/builderAPI';
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
  console.log(user);
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

      <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Level Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6"
            >
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-gray-800">
                    {level}
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-semibold">Level {level}</h3>
                <p className="text-sm text-gray-400">{xp} XP</p>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Next: Level {level + 1}</span>
                    <span>{xpToNextLevel} XP needed</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-linear-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${levelProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6"
            >
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Quick Stats
              </h4>
              <div className="space-y-3">
                {
                  !isOtherUser &&

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">SF Coins</span>
                    <span className="text-yellow-400 font-semibold">{profileData?.credits || 0}</span>
                  </div>
                }
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Streak Days</span>
                  <span className="text-orange-400">{profileData?.streak_days || 0} 🔥</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Satisfaction</span>
                  <span className="text-green-400">{profileData?.satisfaction_percentage || 0}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total Revenue</span>
                  <span className="text-blue-400">${(profileData?.total_revenue || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Friends</span>
                  <span className="text-blue-400">{profileData?.friendsCount || 0}</span>
                </div>
                {/* ─── NEW FOLLOWING / FOLLOWERS ROWS (clickable) ─── */}
                <div
                  className="flex justify-between items-center cursor-pointer hover:text-blue-400 transition-colors"
                  onClick={() => setModalType('following')}
                >
                  <span className="text-sm text-gray-400">Following</span>
                  <span className="text-blue-400">{profileData?.followingCount || 0}</span>
                </div>
                <div
                  className="flex justify-between items-center cursor-pointer hover:text-blue-400 transition-colors"
                  onClick={() => setModalType('followers')}
                >
                  <span className="text-sm text-gray-400">Followers</span>
                  <span className="text-blue-400">{profileData?.followersCount || 0}</span>
                </div>
                {/* ─────────────────────────────────────────────── */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Founded Startups</span>
                  <span className="text-green-400">{profileData?.foundedStartups?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Startup Memberships</span>
                  <span className="text-purple-400">{profileData?.startupMemberships?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Ideas</span>
                  <span className="text-yellow-400">{profileData?.ideas?.length || 0}</span>
                </div>
              </div>
            </motion.div>

            {/* Social Links */}
            {
              profileData?.social && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6"
                >
                  <h4 className="font-semibold mb-4">Connect</h4>
                  <div className="space-y-2">
                    {profileData.social.linkedinUrl && (
                      <a href={profileData.social.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors">
                        LinkedIn
                      </a>
                    )}
                    {profileData.social.githubUrl && (
                      <a href={profileData.social.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors">
                        GitHub
                      </a>
                    )}
                    {profileData.social.websiteUrl && (
                      <a href={profileData.social.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition-colors">
                        <Globe className="w-4 h-4" />
                        Portfolio
                      </a>
                    )}
                  </div>
                </motion.div>
              )
            }

            {/* Ratings */}
            {
              user?.id && (
                <UserRatingCard
                  subjectId={user.id}
                  subjectName={[user.first_name, user.last_name].filter(Boolean).join(' ') || 'this user'}
                />
              )
            }
          </div >

          {/* Main Content */}
          < div className="lg:col-span-3 space-y-6" >
            <ProfileTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="min-h-150">
              {activeTab === "details" && (
                <ProfileDetail
                  /* Merge the flat user record with its nested profile so the
                     schema can read both shapes — the API splits fields across
                     `user` and `user.profile`. */
                  profile={{ ...(user || {}), ...(user?.profile || {}), ...(profileData || {}) }}
                  isOwner={!isOtherUser}
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
                    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        📚 Knowledge Posts
                      </h3>
                      <div className="space-y-3">
                        {profileData.knowledgePosts.map((post) => (
                          <div key={`k-${post.id}`} className="p-4 bg-gray-700/30 rounded-xl flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{post.title}</h4>
                              <p className="text-sm text-gray-400 mt-1">{post.titleDescription}</p>
                              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                <span>👀 {post.views}</span>
                                <span>❤️ {post.likes}</span>
                                <span>📥 {post.downloads}</span>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Posts */}
                  {profileData?.posts?.length > 0 && (
                    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        ✍️ Posts
                      </h3>
                      <div className="space-y-3">
                        {profileData.posts.map((post) => (
                          <div key={`p-${post.id}`} className="p-4 bg-gray-700/30 rounded-xl flex justify-between items-start">
                            <div>
                              <p className="text-sm text-gray-300">{post.content?.slice(0, 200)}{post.content?.length > 200 ? '…' : ''}</p>
                              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                <span>❤️ {post.likes}</span>
                                <span>💬 {post.commentsCount}</span>
                                <span>🔄 {post.shares}</span>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Transactions (own profile only) */}
                  {!isOtherUser && profileData?.transactions?.length > 0 && (
                    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        💰 Transactions
                      </h3>
                      <div className="space-y-3">
                        {profileData.transactions.map((tx) => (
                          <div key={`tx-${tx.id}`} className="p-4 bg-gray-700/30 rounded-xl flex justify-between items-center">
                            <div>
                              <p className="font-medium capitalize">{tx.type || 'Payment'}</p>
                              {tx.donation_message && <p className="text-sm text-gray-400">{tx.donation_message}</p>}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-400">${(tx.amount / 100).toFixed(2)} {tx.currency?.toUpperCase()}</p>
                              <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
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
                      className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6"
                    >
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Rocket className="w-5 h-5" />
                        Assigned Tasks
                      </h3>
                      <div className="space-y-2 text-sm text-gray-400">
                        <p>Total: {profileData.assignedTasks.total}</p>
                        <p>Completed: {profileData.assignedTasks.completed}</p>
                        <p>Pending: {profileData.assignedTasks.pending}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Ideas */}
                  {profileData?.ideas?.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6"
                    >
                      <h3 className="text-xl font-semibold mb-4">Ideas</h3>
                      <div className="grid gap-4">
                        {profileData.ideas.map((idea) => (
                          <div key={idea.id} className="p-4 bg-gray-700/30 rounded-xl">
                            <h4 className="font-semibold">{idea.title}</h4>
                            <p className="text-sm text-gray-400">{idea.description}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

              )}
              {console.log("profileData.startupMemberships:", profileData?.startupMemberships)}
              {activeTab === "startups" && (
                <div className="space-y-6">
                  {profileData?.startupMemberships?.filter(m => !profileData.foundedStartups.some(s => s.id === m.startup.id)).length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6"
                    >
                      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        Member in Startups
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        {profileData.startupMemberships.map((membership) => (
                          <motion.div
                            key={membership.startup.id}
                            whileHover={{ y: -4 }}
                            className="group relative p-5 bg-gradient-to-br from-gray-700/40 to-gray-800/40 border border-gray-600 rounded-xl hover:border-blue-500/50 transition-all cursor-pointer overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all" />

                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  {startup.logo_url ? (
                                    <img
                                      src={getMediaUrl(startup.logo_url)}
                                      alt={startup.name}
                                      className="w-10 h-10 rounded-lg object-cover border border-orange-600/30"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center border border-gray-600">
                                      <Briefcase className="w-6 h-6 text-gray-500" />
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-white">{membership.startup.name}</h4>
                                    <p className="text-xs text-gray-400">{membership.startup.industry}</p>
                                  </div>
                                </div>
                                <Badge className="text-xs bg-blue-500/20 text-blue-300">{membership.startup.stage}</Badge>
                              </div>

                              <p className="text-sm text-gray-300 mb-4 line-clamp-2">{membership.startup.description}</p>

                              <div className="flex flex-wrap gap-2 mb-4">
                                {membership.startup.roles && Object.keys(membership.startup.roles).slice(0, 2).map((role) => (
                                  <span key={role} className="text-xs px-2 py-1 bg-gray-700/60 text-gray-300 rounded-full">
                                    {role}
                                  </span>
                                ))}
                                {membership.startup.roles && Object.keys(membership.startup.roles).length > 2 && (
                                  <span className="text-xs px-2 py-1 bg-gray-700/60 text-gray-300 rounded-full">
                                    +{Object.keys(membership.startup.roles).length - 2}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
                                <div className="flex gap-3 text-xs text-gray-400">
                                  <span className="flex items-center gap-1">
                                    👥 {membership.startup.memberCount}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    💰 {formatCurrency(membership.startup.funding_amount) || "—"}
                                  </span>
                                </div>
                                <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
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
                      className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6"
                    >
                      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Rocket className="w-5 h-5" />
                        Founded Startups
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        {profileData.foundedStartups.map((startup) => (
                          <motion.div
                            key={startup.id}
                            whileHover={{ y: -4 }}
                            className="group relative p-5 bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-orange-600/30 rounded-xl hover:border-orange-500/50 transition-all cursor-pointer"
                          >
                            <div className="relative z-10">
                              <div className="flex items-start gap-3 mb-3">
                                {startup.logo_url ? (
                                  <img
                                    src={startup.logo_url.startsWith("http") ? startup.logo_url : `${API_URL}${startup.logo_url}`}
                                    alt={startup.name}
                                    className="w-10 h-10 rounded-lg object-cover border border-orange-600/30"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-orange-900/30 flex items-center justify-center border border-orange-600/30">
                                    <Rocket className="w-5 h-5 text-orange-400" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <h4 className="font-semibold text-white">{startup.name}</h4>
                                  <p className="text-xs text-gray-400">{startup.stage}</p>
                                </div>
                              </div>
                              <p className="text-sm text-gray-300 line-clamp-2">{startup.description}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {!profileData?.startupMemberships?.length && !profileData?.foundedStartups?.length && (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                      <Briefcase className="w-12 h-12 mb-4 opacity-50" />
                      <p>No startup involvement yet</p>
                    </div>
                  )}
                </div>
              )}
              {activeTab === "transactions" && (
                <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FaMoneyBill className="w-5 h-5" />
                    Transactions
                  </h3>
                  {profileData?.transactions?.length > 0 ? (
                    <div className="space-y-3">
                      {profileData.transactions.map((tx) => (
                        <div key={`tx-${tx.id}`} className="p-4 bg-gray-700/30 rounded-xl flex justify-between items-center">
                          <div>
                            <p className="font-medium capitalize">{tx.type || 'Payment'}</p>
                            {tx.donation_message && <p className="text-sm text-gray-400">{tx.donation_message}</p>}
                            <p className="text-xs text-gray-500 mt-1">Status: <span className="capitalize">{tx.status}</span></p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-400">${(tx.amount / 100).toFixed(2)} {tx.currency?.toUpperCase()}</p>
                            <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-12">
                      <p>No transactions yet</p>
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