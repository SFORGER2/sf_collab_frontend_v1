import axios from 'axios';
import { toast } from 'react-toastify';
import { useCallback, useEffect, useState } from 'react';
import { API_BASE_URL } from '@/utils/config';
const useFetchAdminData = (headers) => {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
  users: [],
  startups: [],
  tasks: [],
  feedback: [],
  achievements: [],
  accessRequests: [],
  joinRequests: [],
  suggestions: [],
});
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStartups: 0,
    totalFeedback: 0,
    pendingAccessRequests: 0,
    pendingJoinRequests: 0,
    activeTasks: 0,
    totalAchievements: 0, 
  });
  
  const fetchAdminData = useCallback(async () => {
    try {
      if (!headers) {
        throw new Error('Authorization headers are required to fetch admin data');
      }
      setLoading(true);
      const results = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/users`, { headers }),
        axios.get(`${API_BASE_URL}/startups`, { headers }),
        axios.get(`${API_BASE_URL}/feedback`, { headers }),
        axios.get(`${API_BASE_URL}/access-requests`, { headers }),
        axios.get(`${API_BASE_URL}/join-requests`, { headers }),
        axios.get(`${API_BASE_URL}/suggestions`, { headers }),
        axios.get(`${API_BASE_URL}/tasks`, { headers }),
        axios.get(`${API_BASE_URL}/notifications`, { headers }),
        axios.get(`${API_BASE_URL}/achievements`, { headers }),
        axios.get(`${API_BASE_URL}/permissions`, { headers }),
      ]);
      const getData = (result) => result.status === 'fulfilled' ? (result.value.data?.data || []) : [];
      console.log({
        users: getData(results[0]).users,
        startups: getData(results[1]).startups,
        feedback: getData(results[2]),
        accessRequests: getData(results[3]).access_requests,
        joinRequests: getData(results[4]).join_requests,
        suggestions: getData(results[5]).suggestions,
        tasks: getData(results[6]).tasks,
        notifications: getData(results[7]).notifications,
        achievements: getData(results[8]),
        permissions: getData(results[9]).permissions
      });
      setDashboardData({
        users: getData(results[0]).users,
        startups: getData(results[1]).startups,
        feedback: getData(results[2]),
        accessRequests: getData(results[3]).access_requests,
        joinRequests: getData(results[4]).join_requests,
        suggestions: getData(results[5]).suggestions,
        tasks: getData(results[6]).tasks,
        notifications: getData(results[7]).notifications,
        achievements: getData(results[8]),
        permissions: getData(results[9]).permissions,
      });

      const users = getData(results[0]);
      const startups = getData(results[1]);
      const feedback = getData(results[2]);
      const accessRequests = getData(results[3]);
      const joinRequests = getData(results[4]);
      const tasks = getData(results[6]);
      const achievements = getData(results[8]);

      setStats({
        totalUsers: users.length,
        totalStartups: startups.length,
        totalFeedback: feedback.length,
        pendingAccessRequests: Array.isArray(accessRequests) ? accessRequests.filter((r) => r.status === 'pending').length : 0,
        pendingJoinRequests: Array.isArray(joinRequests) ? joinRequests.filter((r) => r.status === 'pending').length : 0,
        activeTasks: Array.isArray(tasks) ? tasks.filter((t) => t.status !== 'completed').length : 0,
        totalAchievements: achievements.length,
      });
    } catch (err) {
      console.error('Error fetching admin data:', err);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [headers]);
  useEffect(() => {
    if (headers) {
      fetchAdminData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headers]);
  return { loading, setLoading, dashboardData, stats };
};

export default useFetchAdminData;
  