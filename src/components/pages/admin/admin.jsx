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
import { usersAPI } from '@/utils/APIs/userApi';
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
        pointsCategory,
        access_token
      );
      if (response.points) {
        setShowPointsModal(false);
        // Remove the feedback item from the list after giving points
        await feedbackAPI.delete(selectedUser.id, access_token);
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
        backgroundColor: ['#4ade80', '#60a5fa', '#facc15'],
      },
    ],
  };

  const pieData = {
    labels: [`Revenue $${totalRevenue}`, `Goal $${100000 - totalRevenue}`],
    datasets: [
      {
        label: 'Revenue',
        data: [totalRevenue, 100000 - totalRevenue],
        backgroundColor: ['green', 'red'],
      },
    ],
  };
  const [allApplications, setAllApplications] = useState([]);
  useEffect(() => {
    async function fetchApplications() {
      const response = await applicationAPI.getAll(access_token, { page: 1, per_page: 1000 });
      setAllApplications(response.data.applications || []);
    }
    fetchApplications();
  }, [access_token]);
  const handleGivePointsPopup = async (feedbackItem) => {
    let user = users.find(u => u.id === feedbackItem.userId);
    if (!user) {
      const response = await usersAPI.getById(feedbackItem.userId, access_token);
      if (!response.data) return;
      console.log("User response",response);
      user = response.data.user;
    }
    setSelectedUser(user);
    setShowPointsModal(true);
  };
  return (
    <>
      {activeUser && <UserPopUp user={activeUser} onClose={() => setActiveUser(null)} />}
      <div className="p-8 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 min-h-screen text-white">
        <div className="w-full mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Users', value: totalUsers, icon: '👥', color: 'from-green-500 to-green-600', accent: 'green' },
              { label: 'Total Startups', value: totalStartups, icon: '🚀', color: 'from-blue-500 to-blue-600', accent: 'blue' },
              { label: 'Total Feedback', value: totalFeedback, icon: '💬', color: 'from-yellow-500 to-yellow-600', accent: 'yellow' },
              { label: 'Revenue', value: `$${totalRevenue || 0}`, icon: '💰', color: 'from-purple-500 to-purple-600', accent: 'purple' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 p-6 rounded-xl shadow-xl border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-900/50 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-400 text-sm uppercase tracking-wide">{stat.label}</h2>
                    <p className={`text-4xl font-bold mt-3 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </p>
                  </div>
                  <span className="text-4xl opacity-20 group-hover:opacity-40 transition">{stat.icon}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-700/20 p-6 rounded-xl shadow-xl border border-gray-700/50">
              <h2 className="text-xl font-semibold mb-4 text-gray-100">Overview Chart</h2>
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <Bar data={barData} options={{ maintainAspectRatio: true }} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-700/20 p-6 rounded-xl shadow-xl border border-gray-700/50">
              <h2 className="text-xl font-semibold mb-4 text-gray-100">Revenue Distribution</h2>
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <Pie data={pieData} options={{ maintainAspectRatio: true }} />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-700/20 p-6 rounded-xl shadow-xl border border-gray-700/50 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">Donations & Crowdfunding</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex flex-col w-full">
                <h3 className="text-lg font-semibold mb-3 text-green-300">
                  Donations (Total: {totalDonations}, ${(totalDonationsAmount / 100).toFixed(2)})
                </h3>

                <div className="max-h-80 w-full overflow-y-auto">
                  <InfiniteList
                    items={donations}
                    renderItem={(item) => (
                      <div
                        key={item.id}
                        className="w-full my-2 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:border-gray-500/50 transition"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-medium text-green-300">
                            ${(item.amount / 100).toFixed(2)} {item.currency}
                          </p>
                        </div>

                        {item.user && (
                          <div className="text-xs text-gray-400 mb-1">
                            <p className="text-gray-300">
                              {item.user.firstName} {item.user.lastName}
                            </p>
                            <p className="text-gray-500">{item.user.email}</p>
                          </div>
                        )}

                        {item.message && (
                          <p className="text-xs text-gray-400 italic mb-1">
                            "{item.message}"
                          </p>
                        )}

                        <p className="text-xs text-gray-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    sentinelRef={donationsRef}
                    loading={loadingDonations}
                  />
                </div>
              </div>


              <div className="flex flex-col w-full">
                <h3 className="text-lg font-semibold mb-3 text-purple-300">
                  Crowdfunding (Total: {totalCrowdfunding}, ${(totalCrowdAmount / 100).toFixed(2)})
                </h3>

                <div className="max-h-80 w-full overflow-y-auto">
                  <InfiniteList
                    items={crowdfunding}
                    renderItem={(item) => (
                      <div
                        key={item.id}
                        className="w-full my-2 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:border-gray-500/50 transition"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-medium text-purple-300">
                            ${(item.amount / 100).toFixed(2)} {item.currency}
                          </p>
                        </div>

                        {item.user && (
                          <div className="text-xs text-gray-400 mb-1">
                            <p className="text-gray-300">
                              {item.user.firstName} {item.user.lastName}
                            </p>
                            <p className="text-gray-500">{item.user.email}</p>
                          </div>
                        )}

                        {item.planId && (
                          <p className="text-xs text-gray-400 italic mb-1">
                            Plan ID: {item.planId}
                          </p>
                        )}

                        <p className="text-xs text-gray-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    sentinelRef={crowdfundingRef}
                    loading={loadingCrowdfunding}
                  />
                </div>
              </div>

            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-700/20 p-6 rounded-xl shadow-xl border border-gray-700/50 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">📋 Applications</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Job Applications */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-300">💼 Job Applications</h3>
                <ul className="space-y-3 max-h-96 overflow-y-auto">
                  {allApplications
                    .filter(item => item.application_type === 'job')
                    .map((app) => (
                      <li key={app.id} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:border-gray-500/50 transition">
                        <div className="font-medium text-blue-300">{app.name}</div>
                        <p className="text-xs text-gray-400 mt-1">📧 {app.email}</p>
                        <p className="text-xs text-gray-400">🌍 {app.country}</p>
                        <div className="text-xs text-gray-300 mt-2">
                          <p><strong>Area:</strong> {app.data?.area}</p>
                          <p><strong>Skills:</strong> {app.data?.skills}</p>
                          <p><strong>Availability:</strong> {app.data?.availability} hours/week</p>
                          <p><strong>Early CoBuilder:</strong> {app.data?.earlyCoBuilder}</p>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">{new Date(app.created_at).toLocaleDateString()}</p>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Influencer Applications */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-purple-300">⭐ Influencer Applications</h3>
                <ul className="space-y-3 max-h-96 overflow-y-auto">
                  {allApplications
                    .filter(item => item.application_type === 'influencer')
                    .map((app) => (
                      <li key={app.id} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:border-gray-500/50 transition">
                        <div className="font-medium text-purple-300">{app.name}</div>
                        <p className="text-xs text-gray-400 mt-1">📧 {app.email}</p>
                        <p className="text-xs text-gray-400">🌍 {app.country}</p>
                        <div className="text-xs text-gray-300 mt-2">
                          <p><strong>Niche:</strong> {app.data?.niche}</p>
                          <p><strong>Followers:</strong> {app.data?.followers}</p>
                          <p><strong>Audience Fit:</strong> {app.data?.audienceFit}</p>
                          <p><strong>Early Partner:</strong> {app.data?.earlyPartner}</p>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">{new Date(app.created_at).toLocaleDateString()}</p>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-700/20 p-6 rounded-xl shadow-xl border border-gray-700/50 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">💬 Feedback</h2>
            <input
              type="text"
              placeholder="Filter feedback..."
              value={feedbackFilter}
              onChange={(e) => setFeedbackFilter(e.target.value)}
              className="w-full p-3 mb-4 rounded-lg bg-gray-700/50 text-white placeholder-gray-500 border border-gray-600/50 focus:border-blue-500 focus:outline-none transition"
            />
            <ul className="space-y-3 max-h-80 overflow-y-auto">
              <InfiniteList items={feedback} renderItem={(item) => (
                <li
                  key={item.id}
                  className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:border-gray-500/50 transition backdrop-blur"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-blue-300">
                      User ID: {item.userId}
                    </div>
                  
    
                    <button
                      onClick={() => {
                        handleGivePointsPopup(item);
                      }}
                      className="px-3 py-1 text-sm bg-green-600 hover:bg-green-500 rounded"
                    >
                      + Give Points 
                    </button>
                  </div>

                  <p className="text-gray-100">User: {users.find(u => u.id === item.userId)?.fullName}</p>
                  <p className="text-gray-100 whitespace-pre-wrap break-words">{item.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(item.createdAt).toLocaleDateString()} •{' '}
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </p>
                </li>

              )} sentinelRef={feedbackRef} loading={loadingFeedback} />
            </ul>
          </div>
          <AdminIdeasReviewSection />
          <AdminSendAnnouncementSection />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-700/20 p-6 rounded-xl shadow-xl border border-gray-700/50">
              <h2 className="text-xl font-semibold mb-4 text-gray-100">👥 Users List</h2>
              <input
                type="text"
                placeholder="Filter users by name or email..."
                value={usersFilter}
                onChange={(e) => setUsersFilter(e.target.value)}
                className="w-full p-3 mb-4 rounded-lg bg-gray-700/50 text-white placeholder-gray-500 border border-gray-600/50 focus:border-blue-500 focus:outline-none transition"
              />
              <ul className="max-h-80 overflow-y-auto space-y-2">
                <InfiniteList items={users} renderItem={(u) => <UserAdminItems user={u} setActiveUser={setActiveUser} />} sentinelRef={usersRef} loading={loadingUsers} />
              </ul>
              
            </div>
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-700/20 p-6 rounded-xl shadow-xl border border-gray-700/50">
              <h2 className="text-xl font-semibold mb-4 text-gray-100">🚀 Startups List</h2>
              <input
                type="text"
                placeholder="Filter startups by name..."
                value={startupsFilter}
                onChange={(e) => setStartupsFilter(e.target.value)}
                className="w-full p-3 mb-4 rounded-lg bg-gray-700/50 text-white placeholder-gray-500 border border-gray-600/50 focus:border-blue-500 focus:outline-none transition"
              />
              <ul className="max-h-80 overflow-y-auto space-y-2">
                <InfiniteList items={startups} renderItem={(s) => <StartupAdminItems startup={s} />} loading={loadingStartups} sentinelRef={startupsRef} />
              </ul>
            </div>
          </div>

          {showPointsModal && selectedUser && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl w-full max-w-md border border-gray-700/50 shadow-2xl">
                <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  ⭐ Give Contribution Points
                </h2>
                <p className="text-sm text-gray-400 mb-6">
                  User: <span className="text-green-300 font-medium">{selectedUser.fullName}</span>
                </p>

                <select
                  value={pointsCategory}
                  onChange={(e) => setPointsCategory(e.target.value)}
                  className="w-full mb-6 p-3 rounded-lg bg-gray-700/50 border border-gray-600/50 text-white focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="small_contribution">Small Contribution</option>
                  <option value="medium_contribution">Medium Contribution</option>
                  <option value="large_contribution">Large Contribution</option>
                </select>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowPointsModal(false)}
                    className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGivePoints}
                    disabled={loadingPoints}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 rounded-lg disabled:opacity-50 transition font-medium"
                  >
                    {loadingPoints ? 'Adding...' : 'Confirm'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* <div className="bg-gradient-to-br from-gray-800/40 to-gray-700/20 p-6 rounded-xl shadow-xl border border-gray-700/50 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">🔄 Reset Options</h2>
          <ul className="space-y-3">
            <li className="flex justify-between items-center">
              <span className="text-gray-300">Reset Users</span>
              <button
          onClick={() => setFeedback([])}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-500 rounded"
              >
          Reset
              </button>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-300">Reset Points</span>
              <button
          onClick={() => ([])}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-500 rounded"
              >
          Reset
              </button>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-300">Reset Crowdfunding</span>
              <button
          onClick={() => ([])}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-500 rounded"
              >
          Reset
              </button>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-300">Reset Applications</span>
              <button
          onClick={() => setAllApplications([])}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-500 rounded"
              >
          Reset
              </button>
            </li>
          </ul>
        </div> */}
      </div>
    </>
  );
};

export default AdminDashboard;
