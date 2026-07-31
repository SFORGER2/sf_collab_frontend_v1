/**
 * WorkspaceDashboard.jsx — SFCollab ERP — REDESIGNED
 *
 * Covers: Workspace Dashboard (Executive overview)
 * API wiring: revenue-pool, startups, erp-tasks, users
 *
 * DESIGN CHANGES (UI only):
 *  - Fixed ERPStatCard `label` vs `title` prop issues
 *  - Premium glassmorphism and subtle glowing borders
 *  - Improved Top Contributors table with better typography and hierarchy
 *  - ERPPageHeader and ERPLoadingSkeleton usage
 *  - Framer Motion animations throughout
 */
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion } from "framer-motion";
import { DollarSign, Award, TrendingUp, Users, Building, AlertCircle } from "lucide-react";

import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";
import { ERPPageHeader } from "../../erp/shared/ERPPageHeader";
import { ERPStatCard } from "../../erp/shared/ERPStatCard";
import { ERPLoadingSkeleton, ERPSpinner } from "../../erp/shared/ERPLoadingSkeleton";

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
  const [myStartups, setMyStartups] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(user?.active_workspace_id || 1);
  const workspaceId = selectedWorkspace;
  const [latestPool, setLatestPool] = useState(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    startupsApi.get(`/user/${user.id}`, { params: { per_page: 50 } })
      .then(res => {
        const list = res?.data?.data?.startups || res?.data?.startups || [];
        setMyStartups(list);
        if (list.length > 0 && !selectedWorkspace) {
          setSelectedWorkspace(list[0].id);
        }
      }).catch(() => {});
  }, [user?.id, selectedWorkspace]);

  const loadData = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const poolsRes = await revenueApi.get(`/workspaces/${workspaceId}/revenue-pools`);
      const pools = poolsRes.data?.data?.pools || poolsRes.data?.pools || [];
      const sorted = pools.sort((a, b) => new Date(b.period_end) - new Date(a.period_end));
      setLatestPool(sorted[0] || null);

      const tasksRes = await tasksApi.get("/list", { params: { workspace_id: workspaceId } });
      const tasks = tasksRes.data?.data?.tasks || tasksRes.data?.tasks || [];
      const total = tasks.reduce((sum, t) => sum + (t.approved_points || 0), 0);
      setTotalPoints(total);

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

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div className="min-h-screen bg-[#0a0a0b]"><ERPSpinner label="Loading workspace data..." /></div>;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ERPPageHeader
          icon={<Building size={20} />}
          title="Workspace Dashboard"
          description="Executive overview of workspace revenue and execution."
          breadcrumbs={[{ label: "ERP" }, { label: "Workspace" }]}
          actions={
            myStartups.length > 1 ? (
              <select
                value={selectedWorkspace}
                onChange={e => setSelectedWorkspace(parseInt(e.target.value))}
                className="bg-zinc-900 border border-white/[0.06] text-white text-sm font-medium rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500/50 transition-colors shadow-sm"
              >
                {myStartups.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            ) : myStartups.length === 1 ? (
              <span className="text-sm font-medium text-zinc-300 bg-zinc-900 border border-white/[0.06] px-4 py-2.5 rounded-xl shadow-sm">
                {myStartups[0]?.name}
              </span>
            ) : null
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-6">
          <ERPStatCard
            label="Eligible Revenue"
            value={latestPool ? `$${latestPool.eligible_revenue.toLocaleString()}` : "—"}
            icon={<DollarSign size={18} />}
            accent="#10b981"
            sub="Current Pool"
          />
          <ERPStatCard
            label="Team Pool (40%)"
            value={latestPool ? `$${latestPool.team_pool_amount.toLocaleString()}` : "—"}
            icon={<TrendingUp size={18} />}
            accent="#f59e0b"
            sub="Distributed to contributors"
          />
          <ERPStatCard
            label="Total Approved Points"
            value={totalPoints.toLocaleString()}
            icon={<Award size={18} />}
            accent="#6366f1"
            sub="All-time approved"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 16 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl overflow-hidden relative"
          style={{ background: "var(--surface-panel)", border: "1px solid var(--surface-border)" }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
          
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
            <Users size={16} className="text-indigo-400" /> Top Contributors
          </h2>
          
          {contributors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-white/[0.02] flex items-center justify-center mb-4 border border-white/[0.04]">
                <Users size={20} className="text-zinc-600" />
              </div>
              <p className="text-sm font-semibold text-zinc-300">No approved tasks yet.</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">Complete and approve tasks to see the contributor leaderboard.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-white/[0.06]">
                  <tr>
                    <th className="pb-3 px-4 w-20">Rank</th>
                    <th className="pb-3 px-4">User</th>
                    <th className="pb-3 px-4 text-right">Approved Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {contributors.map((c, idx) => (
                    <motion.tr 
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }} 
                      key={c.userId} 
                      className="transition-colors group"
                    >
                      <td className="py-4 px-4 font-semibold text-zinc-500 group-hover:text-zinc-300 transition-colors">
                        #{idx + 1}
                      </td>
                      <td className="py-4 px-4 font-semibold text-zinc-200 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                             style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>
                          {c.name.charAt(0)}
                        </div>
                        {c.name}
                      </td>
                      <td className="py-4 px-4 font-bold text-indigo-400 text-right">
                        {c.points.toLocaleString()} <span className="text-zinc-600 font-medium text-xs ml-1">pts</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {!latestPool && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }} 
            className="mt-6 p-4 rounded-xl flex items-center justify-center gap-3 text-sm font-medium"
            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#fcd34d" }}
          >
            <AlertCircle size={16} /> 
            No active revenue pool found. Create one in Revenue Pools to track revenue share.
          </motion.div>
        )}
      </div>
    </div>
  );
}