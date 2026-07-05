import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";
import { DollarSign, Award, TrendingUp, Users } from "lucide-react";

const revenueApi = axios.create({ baseURL: "/api/revenue-pool" });
revenueApi.interceptors.request.use(requestInterceptor);
revenueApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const startupsApi = axios.create({ baseURL: "/api/startups" });
startupsApi.interceptors.request.use(requestInterceptor);
startupsApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const tasksApi = axios.create({ baseURL: "/api/erp-tasks" });
tasksApi.interceptors.request.use(requestInterceptor);
tasksApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const userApi = axios.create({ baseURL: "/api/users" });
userApi.interceptors.request.use(requestInterceptor);
userApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

export default function WorkspaceDashboard() {
  const { user } = useSelector((s) => s.auth);
  // B8 FIX: founders can switch between their startups
  const [myStartups,       setMyStartups]       = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(user?.active_workspace_id || 1);
  const workspaceId = selectedWorkspace;
  const [latestPool, setLatestPool] = useState(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch founder's startups for the switcher
  useEffect(() => {
    if (!user?.id) return;
    startupsApi.get(`/user/${user.id}`, { params: { per_page: 50 } })
      .then(res => {
        const list = res?.data?.data?.startups || res?.data?.startups || [];
        setMyStartups(list);
        // If user has a preferred active_workspace_id, use it
        if (list.length > 0 && !selectedWorkspace) {
          setSelectedWorkspace(list[0].id);
        }
      })
      .catch(() => {});
  }, [user?.id]);

  const loadData = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      // 1. Get latest revenue pool (most recent period_end)
      const poolsRes = await revenueApi.get(`/workspaces/${workspaceId}/revenue-pools`);
      const pools = poolsRes.data?.data?.pools || poolsRes.data?.pools || [];
      const sorted = pools.sort((a, b) => new Date(b.period_end) - new Date(a.period_end));
      setLatestPool(sorted[0] || null);

      // 2. Get all tasks, sum approved_points
      const tasksRes = await tasksApi.get("/list", { params: { workspace_id: workspaceId } });
      const tasks = tasksRes.data?.data?.tasks || tasksRes.data?.tasks || [];
      const total = tasks.reduce((sum, t) => sum + (t.approved_points || 0), 0);
      setTotalPoints(total);

      // 3. Compute top contributors (group by assignee, sum approved_points)
      const userPoints = {};
      tasks.forEach(task => {
        if (task.approved_points && task.assigned_to) {
          userPoints[task.assigned_to] = (userPoints[task.assigned_to] || 0) + task.approved_points;
        }
      });
      const sortedUsers = Object.entries(userPoints)
        .map(([userId, points]) => ({ userId: parseInt(userId), points }))
        .sort((a, b) => b.points - a.points)
        .slice(0, 5);
      
      // Fetch user names (batch)
      if (sortedUsers.length > 0) {
        const userIds = sortedUsers.map(u => u.userId);
        const userPromises = userIds.map(id => userApi.get(`/${id}`).catch(() => ({ data: { name: `User #${id}` } })));
        const userResponses = await Promise.all(userPromises);
        const usersMap = {};
        userResponses.forEach((res, idx) => {
          const userId = userIds[idx];
          const userName = res.data?.name || res.data?.firstName ? `${res.data.firstName} ${res.data.lastName}` : `User #${userId}`;
          usersMap[userId] = userName;
        });
        setContributors(sortedUsers.map(u => ({ ...u, name: usersMap[u.userId] })));
      } else {
        setContributors([]);
      }
    } catch (err) {
      console.error("Failed to load workspace dashboard", err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Workspace Dashboard</h1>
            <p className="text-zinc-400 mt-1">Executive overview of your workspace</p>
          </div>
          {/* B8 FIX: startup switcher for founders with multiple startups */}
          {myStartups.length > 1 && (
            <select
              value={selectedWorkspace}
              onChange={e => setSelectedWorkspace(parseInt(e.target.value))}
              className="bg-zinc-900 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5
                focus:outline-none focus:border-zinc-500"
            >
              {myStartups.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}
          {myStartups.length === 1 && (
            <span className="text-sm text-zinc-500 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl">
              {myStartups[0]?.name}
            </span>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KpiCard
            icon={DollarSign}
            label="Eligible Revenue"
            value={latestPool ? `$${latestPool.eligible_revenue.toLocaleString()}` : "—"}
            accent="#22c55e"
          />
          <KpiCard
            icon={TrendingUp}
            label="Team Pool (40%)"
            value={latestPool ? `$${latestPool.team_pool_amount.toLocaleString()}` : "—"}
            accent="#f59e0b"
          />
          <KpiCard
            icon={Award}
            label="Total Approved Points"
            value={totalPoints.toLocaleString()}
            accent="#6366f1"
          />
        </div>

        {/* Top Contributors Table */}
        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users size={20} className="text-blue-400" /> Top Contributors
          </h2>
          {contributors.length === 0 ? (
            <p className="text-zinc-500 text-center py-6">No approved tasks yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="text-left py-2">Rank</th>
                    <th className="text-left py-2">User</th>
                    <th className="text-left py-2">Approved Points</th>
                  </tr>
                </thead>
                <tbody>
                  {contributors.map((c, idx) => (
                    <tr key={c.userId} className="border-b border-zinc-800">
                      <td className="py-2">#{idx + 1}</td>
                      <td className="py-2">{c.name}</td>
                      <td className="py-2 font-semibold text-green-400">{c.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Additional insight: if no pool exists */}
        {!latestPool && (
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-center">
            <p className="text-sm text-blue-300">No revenue pool yet. Create one in <strong>Revenue Pools</strong> to track revenue share.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6" style={{ borderTop: `3px solid ${accent}` }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5" style={{ color: accent }} />
        <span className="text-xs uppercase tracking-widest text-zinc-500">{label}</span>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  );
}