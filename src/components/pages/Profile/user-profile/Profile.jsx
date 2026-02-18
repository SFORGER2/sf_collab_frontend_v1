// Profile.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Award, BarChart3,
  Rocket, TrendingUp, Zap, Globe, Briefcase, ExternalLink
} from 'lucide-react';

import ProfileHeader from './ProfileHeader';
import ProfileStats from './ProfileStats';
import ProfileTabs from './ProfileTabs';
import AchievementSection from './AchievementSection';
import ActivityFeed from './ActivityFeed';
import ProfileSettings from '../profileSettings/ProfileSettings';
import { useSelector } from 'react-redux';
import { data, useNavigate, useSearchParams } from 'react-router-dom';
import { builderProfileAPI } from '@/services/builderAPI';
import { usersAPI } from '@/utils/APIs/userAPI';

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { user: authUser, access_token } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [queryParams] = useSearchParams();
  const [portfolio, setPortfolio] = useState([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);

  // Fetch portfolio when component loads
  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!authUser || !access_token) return;
      
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
  }, [authUser, access_token]);

  const viewedUserId = queryParams.get("userId");
  const page = queryParams.get("page");
  useEffect(() => {
    if (page) {
      setShowSettings(true);
    } else {
      setShowSettings(false);
    }
  }, [page]);
  const [viewedUser, setViewedUser] = useState(null);
  const [loadingViewedUser, setLoadingViewedUser] = useState(false);

  const isOtherUser =
    viewedUserId && authUser?.id && String(viewedUserId) !== String(authUser.id);

  const user = isOtherUser ? viewedUser : authUser;
  useEffect(() => {
    const loadOtherUser = async () => {
      if (!isOtherUser) {
        setViewedUser(null);
        return;
      }

      setLoadingViewedUser(true);
      try {
        const params = {
          include_stats: true,
        }
        const response = await usersAPI.getById(viewedUserId, params);
        const fetchedUser = response?.data?.user || response?.data || null;

        if (response?.success && fetchedUser) {
          setViewedUser(fetchedUser);
        } else {
          setViewedUser(null);
        }
      } catch (e) {
        console.error("Failed to load viewed user:", e);
        setViewedUser(null);
      } finally {
        setLoadingViewedUser(false);
      }
    };

    loadOtherUser();
  }, [isOtherUser, viewedUserId]);

  if (!user || loadingViewedUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Loading profile...</p>
      </div>
    );
  }

  // Only allow settings page for your own profile
  if (showSettings && !isOtherUser) {
    return <ProfileSettings user={authUser} back={() => window.history.back()} initialActiveSection={page} />;
  }

  const calculateLevel = (xp) => Math.floor(xp / 1000) + 1;
  const level = calculateLevel(user?.xpPoints || 0);
  const xpToNextLevel = level * 1000 - (user?.xpPoints || 0);
  const levelProgress = (((user?.xpPoints || 0) % 1000) / 1000) * 100;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'activity', label: 'Activity', icon: BarChart3 },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    // { id: 'settings', label: 'Settings', icon: Settings }
  ];
  return (
    <div className="min-h-screen text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>

      <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <ProfileStats
          user={user}
          streakDays={user.streak_days}
          activeStartups={user.active_startups_count}
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
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
                  {/* {
                    user &&
                    <div className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                      PRO
                    </div>
                  } */}
                </div>
                <h3 className="mt-4 text-lg font-semibold">Level {level}</h3>
                <p className="text-sm text-gray-400">{user.xpPoints} XP</p>

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
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Streak</span>
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Zap className="w-4 h-4" />
                    {user.streak_days} days
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Startups</span>
                  <span className="text-blue-400">{user?.active_startups_count} active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Tasks Done</span>
                  <span className="text-green-400">{user?.statistics?.completed_tasks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Engagement</span>
                  <span className="text-purple-400">{user?.statistics?.engagement_score}%</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6"
            >
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="space-y-2">
                {user.profile?.socialLinks?.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${user?.profile?.socialLinks?.linkedin}`}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    LinkedIn
                  </a>
                )}
                {user.profile?.socialLinks?.github && (
                  <a
                    href={`https://github.com/${user?.profile?.socialLinks?.github}`}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    GitHub
                  </a>
                )}
                {user.profile?.socialLinks?.portfolio && (
                  <a
                    href={`https://${user?.profile?.socialLinks?.portfolio}`}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Portfolio
                  </a>
                )}
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <ProfileTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="min-h-150">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <ActivityFeed activities={user?.recentActivity || []} />

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6"
                  >
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Rocket className="w-5 h-5" />
                      Active Projects
                    </h3>
                    {user.relationships?.assignedTasks?.length > 0 ? (
                      <div className="grid gap-4">
                        {user.relationships.assignedTasks.map((task, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl"
                          >
                            <div>
                              <h4 className="font-semibold">{task.title}</h4>
                              <p className="text-sm text-gray-400">In progress</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-400 py-8">No active projects</p>
                    )}
                  </motion.div>
                </div>
              )}

              {activeTab === "achievements" && (
                <AchievementSection achievements={user.relationships?.achievements || []} />
              )}

              {activeTab === "activity" && (
                <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-6">Detailed Activity</h3>
                  <div className="text-center text-gray-500 py-12">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Detailed activity timeline coming soon...</p>
                  </div>
                </div>
              )}

              {activeTab === "projects" && (
                <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-6">Portfolio & Projects</h3>
                  
                  {loadingPortfolio ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : portfolio && portfolio.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {portfolio.map((project) => (
                        <motion.div
                          key={project.id}
                          whileHover={{ scale: 1.02 }}
                          className="group relative bg-linear-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-300"
                        >
                          {/* Project Image */}
                          <div className="relative w-full h-48 rounded-t-2xl bg-linear-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center overflow-hidden">
                            {project.image_url ? (
                              <img loading="lazy" src={project.image_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                            ) : (
                              <div className="text-5xl">📦</div>
                            )}
                            {/* Link Overlay */}
                            {project.url && (
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <a
                                  href={project.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                                >
                                  <ExternalLink className="w-5 h-5 text-white" />
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Project Details */}
                          <div className="p-6 space-y-4">
                            <div>
                              <h4 className="text-lg font-bold mb-2 line-clamp-2">{project.title}</h4>
                              <p className="text-gray-400 text-sm line-clamp-3">{project.description}</p>
                            </div>

                            {/* Skills Tags */}
                            {project.skills_used && project.skills_used.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {project.skills_used.slice(0, 3).map((skill, idx) => (
                                  <span key={idx} className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    {skill}
                                  </span>
                                ))}
                                {project.skills_used.length > 3 && (
                                  <span className="px-2 py-1 text-xs text-gray-400">+{project.skills_used.length - 3}</span>
                                )}
                              </div>
                            )}

                            {/* Stats */}
                            <div className="flex gap-4 text-xs text-gray-400 pt-4 border-t border-white/10">
                              <span>👀 {project.views || 0}</span>
                              <span>❤️ {project.likes || 0}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-12">
                      <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No portfolio projects yet. Go to Skill Profile to add your first project!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
