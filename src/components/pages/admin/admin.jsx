// src/components/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { usersAPI } from "@/utils/APIs/userAPI";
import { waitlistAPI } from '@/utils/APIs/waitlistAPI';
import { toast } from 'react-toastify';
import { applicationAPI } from '@/utils/APIs/applicationAPI';
import AdminIdeasReviewSection from '../contribution/AdminIdeasReviewSection';
import UserPopUp from './userPopUp';
import { startupsAPI } from '@/utils/APIs/startupsAPI';
import usePaginatedFetch from '@/utils/hooks/usePaginated';
import InfiniteList from '@/components/InfiniteList';
import { feedbackAPI } from '@/utils/APIs/feedbackAPI';
import StartupAdminItems from './StartupAdminItems';
import UserAdminItems from './UserAdminItems';
import { paymentAPI } from '@/utils/APIs/paymentAPI';
import AdminSendAnnouncementSection from './SendAnnouncementsSection';
import AdminApplicationsSection from './ApplicationsAdminSection';
import AdminFeedbackSection from './FeedbackAdminSection';
import AdminRefreshNewsSection from './AdminRefreshNewsSection';
import { errorAPI } from '@/utils/APIs/errorAPI';
import { Trash2, Search, Users as UsersIcon, Rocket, AlertCircle, TrendingUp, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import NewsletterDashboard from './NewsletterDashboard';

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const { access_token } = useSelector((state) => state.auth);
  const [usersFilter, setUsersFilter] = useState('');
  const {
    items: users,
    total: totalUsers,
    loading: loadingUsers,
    targetRef: usersRef,
  } = usePaginatedFetch({
    fetchFn: ({ page, search }) =>
      usersAPI.getAll({
        page,
        search,
      }, access_token),
    search: usersFilter,
    objectKey: 'users',
    enabled: !!access_token,
  });
  const [startupsFilter, setStartupsFilter] = useState('');
  const {
    items: startups,
    total: totalStartups,
    loading: loadingStartups,
    targetRef: startupsRef,
  } = usePaginatedFetch({
    fetchFn: ({ page, search }) =>
      startupsAPI.getAll({
        page,
        search,
      }, access_token),
    search: startupsFilter,
    objectKey: 'startups',
    enabled: !!access_token,
  });
  const [feedbackFilter, setFeedbackFilter] = useState('');
  const {
    items: feedback,
    setItems: setFeedback,
    total: totalFeedback,
    loading: loadingFeedback,
    targetRef: feedbackRef,
  } = usePaginatedFetch({
    fetchFn: ({ page, search }) =>
      feedbackAPI.getAll({
        page,
        per_page: 10,
        search,
      }, access_token),
    search: feedbackFilter,
    objectKey: 'feedback',
    enabled: !!access_token,
  });
  const {
    items: donations,
    total: totalDonations,
    totalAmount: totalDonationsAmount,
    loading: loadingDonations,
    targetRef: donationsRef,
  } = usePaginatedFetch({
    fetchFn: ({ page }) =>
      paymentAPI.getTotalDonations({
        page,
        per_page: 10,
      }),
    totalAmountKey: 'total_donations',
    objectKey: 'donations',
    enabled: !!access_token,
  })

  const {
    items: crowdfunding,
    total: totalCrowdfunding,
    totalAmount: totalCrowdAmount,
    loading: loadingCrowdfunding,
    targetRef: crowdfundingRef,
  } = usePaginatedFetch({
    fetchFn: ({ page }) =>
      paymentAPI.getTotalCrowdfunding({
        page,
        per_page: 10,
      }),
    totalAmountKey: 'total_crowdfunding',
    objectKey: 'crowdfunding_transactions',
    enabled: !!access_token,
  })
  const {
    items: errors,
    setItems: setErrors,
    total: totalErrors,
    loading: loadingErrors,
    targetRef: errorsRef,
  } = usePaginatedFetch({
    fetchFn: ({ page }) =>
      errorAPI.getAllErrors({
        page,
        per_page: 10,
      }, access_token),
    objectKey: 'errors',
    enabled: !!access_token,
  })

  const totalRevenue = useMemo(() => {
    return (totalDonationsAmount + totalCrowdAmount) / 100;
  }, [totalCrowdAmount, totalDonationsAmount])

  const [activeUser, setActiveUser] = useState(null)
  const [selectedUser, setSelectedUser] = useState({});
  const [pointsCategory, setPointsCategory] = useState('small_contribution');
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [loadingPoints, setLoadingPoints] = useState(false);

  const handleGivePoints = async () => {
    if (!selectedUser) return;
    try {
      setLoadingPoints(true);

      const response = await waitlistAPI.givePoints(
        selectedUser.id,
        pointsCategory
      );
      if (response.points) {
        setShowPointsModal(false);
        await feedbackAPI.delete(selectedUser.id);
        setFeedback((prevFeedback) =>
          prevFeedback.filter((item) => item.userId !== selectedUser.id)
        );
        toast.success(`Points added to ${selectedUser.fullName}`);
      }

    } catch (err) {
      console.error(err);
      toast.error('Failed to add points');
    } finally {
      setLoadingPoints(false);
    }
  };

  // Chart data
  const barData = {
    labels: ['Users', 'Startups', 'Feedback'],
    datasets: [
      {
        label: 'Counts',
        data: [totalUsers, totalStartups, totalFeedback],
        backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899'],
        borderColor: ['#1e40af', '#6d28d9', '#be123c'],
        borderWidth: 2,
      },
    ],
  };

  const pieData = {
    labels: [`Revenue $${totalRevenue.toFixed(2)}`, `Goal $${(100000 - totalRevenue).toFixed(2)}`],
    datasets: [
      {
        label: 'Revenue',
        data: [totalRevenue, 100000 - totalRevenue],
        backgroundColor: ['#10b981', '#ef4444'],
        borderColor: ['#059669', '#dc2626'],
        borderWidth: 2,
      },
    ],
  };

  const handleGivePointsPopup = async (feedbackItem) => {
    let user = users.find(u => u.id === feedbackItem.userId);
    if (!user) {
      const response = await usersAPI.getById(feedbackItem.userId, access_token);
      if (!response.data) return;
      user = response.data.user;
    }
    setSelectedUser(user);
    setShowPointsModal(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <>
      {activeUser && <UserPopUp user={activeUser} onClose={() => setActiveUser(null)} />}
      <div className="min-h-screen bg-black text-white px-2 md:px-4 py-8">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
          <div className="absolute top-1/4 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" style={{ animationDelay: '2s' }} />
        </div>

        <div className="w-full mx-auto space-y-8 relative">
          {/* Header */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-400 text-lg mt-2">
                  Monitor and manage platform metrics
                </p>
              </div>
            </div>
          </motion.div>

          {/* KPI Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[
              { label: 'Total Users', value: totalUsers, icon: UsersIcon, color: 'from-blue-500 to-cyan-500', accent: 'blue' },
              { label: 'Total Startups', value: totalStartups, icon: Rocket, color: 'from-purple-500 to-pink-500', accent: 'purple' },
              { label: 'Total Feedback', value: totalFeedback, icon: AlertCircle, color: 'from-yellow-500 to-orange-500', accent: 'yellow' },
              { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: TrendingUp, color: 'from-green-500 to-emerald-500', accent: 'green' },
            ].map((stat, idx) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="group relative overflow-hidden rounded-2xl"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative bg-slate-900/90 backdrop-blur border border-white/10 group-hover:border-blue-500/50 rounded-2xl p-6 space-y-3 transition-all">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 bg-${stat.accent}-500/20 rounded-lg`}>
                        <IconComponent className={`w-5 h-5 text-${stat.accent}-400`} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold text-white mt-2">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Charts */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-slate-900/50 backdrop-blur border border-white/10 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold mb-4 text-white">Overview Chart</h2>
              <div className="bg-gray-900/30 p-4 rounded-lg">
                <Bar data={barData} options={{ maintainAspectRatio: true, plugins: { legend: { labels: { color: 'var(--color-star)' } } } }} />
              </div>
            </div>
            <div className="bg-slate-900/50 backdrop-blur border border-white/10 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold mb-4 text-white">Revenue Distribution</h2>
              <div className="bg-gray-900/30 p-4 rounded-lg">
                <Pie data={pieData} options={{ maintainAspectRatio: true, plugins: { legend: { labels: { color: 'var(--color-star)' } } } }} />
              </div>
            </div>
          </motion.div>

          {/* Donations & Crowdfunding */}
          <div className="bg-slate-900/50 backdrop-blur border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-6 text-white">Donations & Crowdfunding</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-green-300">Donations</h3>
                  <span className="text-sm text-gray-400">Total: {totalDonations} • ${(totalDonationsAmount / 100).toFixed(2)}</span>
                </div>
                <div className="max-h-80 space-y-2 overflow-y-auto pr-2">
                  <InfiniteList
                    items={donations}
                    renderItem={(item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 bg-white/5 border border-white/10 hover:border-green-500/30 rounded-lg transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-green-300">
                            ${(item.amount / 100).toFixed(2)} {item.currency}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {item.user && (
                          <div className="text-xs text-gray-400">
                            <p className="text-gray-300">{item.user.firstName} {item.user.lastName}</p>
                            <p className="text-gray-500">{item.user.email}</p>
                          </div>
                        )}
                        {item.message && (
                          <p className="text-xs text-gray-400 italic mt-2">
                            "{item.message}"
                          </p>
                        )}
                      </motion.div>
                    )}
                    sentinelRef={donationsRef}
                    loading={loadingDonations}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-purple-300">Crowdfunding</h3>
                  <span className="text-sm text-gray-400">Total: {totalCrowdfunding} • ${(totalCrowdAmount / 100).toFixed(2)}</span>
                </div>
                <div className="max-h-80 space-y-2 overflow-y-auto pr-2">
                  <InfiniteList
                    items={crowdfunding}
                    renderItem={(item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 bg-white/5 border border-white/10 hover:border-purple-500/30 rounded-lg transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-purple-300">
                            ${(item.amount / 100).toFixed(2)} {item.currency}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {item.user && (
                          <div className="text-xs text-gray-400">
                            <p className="text-gray-300">{item.user.firstName} {item.user.lastName}</p>
                            <p className="text-gray-500">{item.user.email}</p>
                          </div>
                        )}
                        {item.planId && (
                          <p className="text-xs text-gray-400 italic mt-2">
                            Plan ID: {item.planId}
                          </p>
                        )}
                      </motion.div>
                    )}
                    sentinelRef={crowdfundingRef}
                    loading={loadingCrowdfunding}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Admin Sections */}
          <AdminApplicationsSection />
          <AdminFeedbackSection
            feedback={feedback}
            feedbackFilter={feedbackFilter}
            setFeedbackFilter={setFeedbackFilter}
            feedbackRef={feedbackRef}
            loadingFeedback={loadingFeedback}
            users={users}
            handleGivePointsPopup={handleGivePointsPopup}
          />
          <AdminIdeasReviewSection />
          <AdminSendAnnouncementSection />
          <AdminRefreshNewsSection />

          {/* Newsletter Subscribers & Management Dashboard */}
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-700/20 p-6 rounded-xl shadow-xl border border-gray-700/50 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-100 flex items-center gap-2">
              <Mail className="w-6 h-6 text-purple-400" />
              Newsletter & Subscriber Management
            </h2>
            <NewsletterDashboard />
          </div>

          {/* Users & Startups List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/50 backdrop-blur border border-white/10 rounded-2xl p-6 shadow-xl"
            >
              <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-blue-400" />
                Users List
              </h2>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={usersFilter}
                  onChange={(e) => setUsersFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-white/20"
                />
              </div>
              <ul className="max-h-80 overflow-y-auto space-y-2 pr-2">
                <InfiniteList
                  items={users}
                  renderItem={(u) => <UserAdminItems user={u} setActiveUser={setActiveUser} />}
                  sentinelRef={usersRef}
                  loading={loadingUsers}
                />
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-900/50 backdrop-blur border border-white/10 rounded-2xl p-6 shadow-xl"
            >
              <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                <Rocket className="w-5 h-5 text-purple-400" />
                Startups List
              </h2>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search startups..."
                  value={startupsFilter}
                  onChange={(e) => setStartupsFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-white/20"
                />
              </div>
              <ul className="max-h-80 overflow-y-auto space-y-2 pr-2">
                <InfiniteList
                  items={startups}
                  renderItem={(s) => <StartupAdminItems startup={s} />}
                  loading={loadingStartups}
                  sentinelRef={startupsRef}
                />
              </ul>
            </motion.div>
          </div>

          {/* Error Logs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-900/50 backdrop-blur border border-white/10 rounded-2xl p-6 shadow-xl"
          >
            <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Error Logs ({totalErrors})
            </h2>
            <div className="max-h-96 space-y-3 overflow-y-auto pr-2">
              <InfiniteList
                items={errors}
                renderItem={(error) => (
                  <motion.div
                    key={error.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-red-500/10 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-all"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-red-300 text-sm mb-2">
                          {error.errorFromBackend || error.errorMessage}
                        </p>
                        {error.stack && (
                          <p className="text-xs text-gray-400 bg-gray-900/40 p-2 rounded mb-2 font-mono overflow-x-auto">
                            {error.stack}
                          </p>
                        )}
                        <div className="flex gap-4 text-xs text-gray-500">
                          {error.page && <span>Page: {error.page}</span>}
                          {error.component && <span>Component: {error.component}</span>}
                          <span>{new Date(error.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          errorAPI.deleteError(error.id)
                            .then(() => setErrors((prev) => prev.filter((e) => e.id !== error.id)))
                        }}
                        className="text-gray-400 hover:text-red-400 transition flex-shrink-0"
                        title="Delete error"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                )}
                sentinelRef={errorsRef}
                loading={loadingErrors}
              />
            </div>
          </motion.div>

          {/* Points Modal */}
          {showPointsModal && selectedUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl w-full max-w-md border border-white/10 shadow-2xl"
              >
                <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  ⭐ Give Contribution Points
                </h2>
                <p className="text-sm text-gray-400 mb-6">
                  User: <span className="text-green-300 font-medium">{selectedUser.fullName}</span>
                </p>

                <select
                  value={pointsCategory}
                  onChange={(e) => setPointsCategory(e.target.value)}
                  className="w-full mb-6 p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="small_contribution">Small Contribution</option>
                  <option value="medium_contribution">Medium Contribution</option>
                  <option value="large_contribution">Large Contribution</option>
                </select>

                <div className="flex justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPointsModal(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition font-medium text-gray-300"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGivePoints}
                    disabled={loadingPoints}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-lg disabled:opacity-50 transition font-medium text-white"
                  >
                    {loadingPoints ? 'Adding...' : 'Confirm'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
