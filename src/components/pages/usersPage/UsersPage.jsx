// filepath: /src/components/pages/PublicProfile/PublicProfile.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User, MapPin, Globe, ExternalLink, 
  Zap, TrendingUp, Award, Users, ArrowLeft, MessageCircle
} from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { usersAPI } from '@/utils/APIs/userAPI';
import { useSelector } from 'react-redux';
import { getProfilePicture } from '@/utils/getProfilePicture';

const UserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { access_token } = useSelector((state) => state.auth);
  useEffect(() => {
    fetchUserProfile();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await usersAPI.getById(id, access_token);
      setUser(userData.user);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const calculateLevel = (xp) => Math.floor(xp / 1000) + 1;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white gap-4">
        <p className="text-xl">{error || 'User not found'}</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    );
  }

  const level = calculateLevel(user.xp_points || 0);
  const engagement = user.statistics?.engagement_score || 0;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'about', label: 'About' },
    { id: 'activity', label: 'Activity' }
  ];

  return (
    <div className="min-h-screen text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>

      <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 text-center"
            >
              <div className="relative inline-block mb-4">
                <img
                  src={getProfilePicture(user)}
                  alt={user.firstName}
                  className="w-24 h-24 rounded-full border-4 border-blue-500"
                />
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {level}
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-1">
                {user.firstName} {user.lastName}
              </h2>

              {user.profile?.company && (
                <p className="text-sm text-gray-400 mb-2">{user.profile.company}</p>
              )}

              {(user.profile?.city || user.profile?.country) && (
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-4">
                  <MapPin className="w-3 h-3" />
                  <span>
                    {user.profile?.city && user.profile?.country
                      ? `${user.profile.city}, ${user.profile.country}`
                      : user.profile?.country}
                  </span>
                </div>
              )}

              {user.profile?.bio && (
                <p className="text-sm text-gray-400 mb-4">{user.profile.bio}</p>
              )}

              <button className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Message
              </button>
            </motion.div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6"
            >
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Streak
                  </span>
                  <span className="font-bold">{user.streak_days} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    XP
                  </span>
                  <span className="font-bold">{user.xp_points}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    Engagement
                  </span>
                  <span className="font-bold">{Math.round(engagement)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    Startups
                  </span>
                  <span className="font-bold">{user.active_startups_count}</span>
                </div>
              </div>
            </motion.div>

            {/* Roles */}
            {user.roles && user.roles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6"
              >
                <h3 className="font-semibold mb-3">Roles</h3>
                <div className="flex flex-wrap gap-2">
                  {user.roles.map((role, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 capitalize"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Social Links */}
            {user.profile?.socialLinks &&
              Object.keys(user.profile.socialLinks).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6"
                >
                  <h3 className="font-semibold mb-4">Connect</h3>
                  <div className="space-y-2">
                    {user.profile.socialLinks.github && (
                      <a
                        href={`https://github.com/${user.profile.socialLinks.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        <FaGithub className="w-4 h-4" />
                        GitHub
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {user.profile.socialLinks.linkedin && (
                      <a
                        href={`https://linkedin.com/in/${user.profile.socialLinks.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <FaLinkedin className="w-4 h-4" />
                        LinkedIn
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {user.profile.socialLinks.portfolio && (
                      <a
                        href={`https://${user.profile.socialLinks.portfolio}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        Portfolio
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </motion.div>
              )}
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 px-4 font-semibold transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-blue-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Statistics Overview */}
                  <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold mb-6">Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <p className="text-sm text-gray-400">Total Ideas</p>
                        <p className="text-2xl font-bold text-blue-400">
                          {user.statistics?.total_ideas || 0}
                        </p>
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <p className="text-sm text-gray-400">Tasks Completed</p>
                        <p className="text-2xl font-bold text-green-400">
                          {user.statistics?.completed_tasks || 0}
                        </p>
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <p className="text-sm text-gray-400">Achievements</p>
                        <p className="text-2xl font-bold text-purple-400">
                          {user.statistics?.total_achievements || 0}
                        </p>
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <p className="text-sm text-gray-400">Total Startups</p>
                        <p className="text-2xl font-bold text-yellow-400">
                          {user.statistics?.total_startups || 0}
                        </p>
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <p className="text-sm text-gray-400">Likes Received</p>
                        <p className="text-2xl font-bold text-pink-400">
                          {user.statistics?.total_likes_received || 0}
                        </p>
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <p className="text-sm text-gray-400">Comments</p>
                        <p className="text-2xl font-bold text-cyan-400">
                          {user.statistics?.total_comments || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  {user.recentActivity && user.recentActivity.length > 0 && (
                    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6">
                      <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        {user.recentActivity.slice(0, 5).map((activity, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg"
                          >
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-semibold capitalize">
                                {activity.type.replace(/_/g, ' ')}
                              </p>
                              <p className="text-xs text-gray-400">
                                {activity.title}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'about' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold mb-4">About</h3>
                    {user.profile?.bio ? (
                      <p className="text-gray-300 leading-relaxed">
                        {user.profile.bio}
                      </p>
                    ) : (
                      <p className="text-gray-500">No bio provided</p>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Information</h3>
                    <div className="space-y-3">
                      {user.profile?.company && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Company</p>
                          <p className="text-gray-300">{user.profile.company}</p>
                        </div>
                      )}
                      {user.profile?.country && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Country</p>
                          <p className="text-gray-300">{user.profile.country}</p>
                        </div>
                      )}
                      {user.profile?.city && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase">City</p>
                          <p className="text-gray-300">{user.profile.city}</p>
                        </div>
                      )}
                      {user.profile?.timezone && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Timezone</p>
                          <p className="text-gray-300">{user.profile.timezone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'activity' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6"
                >
                  <h3 className="text-xl font-semibold mb-6">Activity Timeline</h3>
                  {user.recentActivity && user.recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {user.recentActivity.map((activity, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="relative flex flex-col items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                            {idx < user.recentActivity.length - 1 && (
                              <div className="w-1 h-12 bg-gray-700 mt-2"></div>
                            )}
                          </div>
                          <div className="pb-4">
                            <p className="font-semibold capitalize">
                              {activity.type.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm text-gray-400">
                              {activity.title}
                            </p>
                            {activity.timestamp && (
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(activity.timestamp).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      No activity yet
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;