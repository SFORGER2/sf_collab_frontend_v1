import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion } from "framer-motion";
import { Award, CheckCircle, Calendar } from "lucide-react";

import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";
import { ERPPageHeader } from "../../erp/shared/ERPPageHeader";
import { ERPStatCard } from "../../erp/shared/ERPStatCard";
import { ERPLoadingSkeleton } from "../../erp/shared/ERPLoadingSkeleton";
import { ERPEmptyState } from "../../erp/shared/ERPEmptyState";

const tasksApi = axios.create({ baseURL: "/api/erp-tasks" });
tasksApi.interceptors.request.use(requestInterceptor);
tasksApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const updatesApi = axios.create({ baseURL: "/api/daily-update" });
updatesApi.interceptors.request.use(requestInterceptor);
updatesApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

export default function PointsDashboard() {
  const { user } = useSelector((s) => s.auth);
  const workspaceId = user?.active_workspace_id || 1;
  const userId = user?.id;

  const [tasks, setTasks] = useState([]);
  const [taskPoints, setTaskPoints] = useState(0);
  const [consistencyPoints, setConsistencyPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!workspaceId || !userId) return;
    setLoading(true);
    try {
      const tasksRes = await tasksApi.get("/list", { params: { workspace_id: workspaceId, assigned_to: userId } });
      const tasksData = tasksRes.data?.data?.tasks || tasksRes.data?.tasks || [];
      const approvedTasks = tasksData.filter(t => (t.status || "").toLowerCase() === "approved" && Number(t.approved_points) > 0);
      
      setTasks(approvedTasks);
      const points = approvedTasks.reduce((sum, t) => sum + Number(t.approved_points || 0), 0);
      setTaskPoints(points);

      const updatesRes = await updatesApi.get("/my", { params: { workspace_id: workspaceId, limit: 100 } });
      const updates = updatesRes.data?.data?.records || updatesRes.data?.records || [];
      setConsistencyPoints(updates.length * 2);
    } catch (err) {
      console.error("Failed to load points data", err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, userId]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { setTotalPoints(taskPoints + consistencyPoints); }, [taskPoints, consistencyPoints]);

  if (loading) return <div className="min-h-screen bg-[#0a0a0b]"><ERPLoadingSkeleton /></div>;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ERPPageHeader
          icon={<Award size={20} />}
          title="Points Dashboard"
          description="Track your execution points and consistency bonuses."
          breadcrumbs={[{ label: "ERP" }, { label: "My Points" }]}
        />

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 mb-8 text-center p-10 rounded-3xl" style={{ background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(79, 70, 229, 0.2))", border: "1px solid rgba(99, 102, 241, 0.2)" }}>
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-indigo-400" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-2">Total Points</p>
          <p className="text-6xl font-black tracking-tighter text-white drop-shadow-md">{totalPoints.toLocaleString()}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <ERPStatCard
            title="Task Points"
            value={taskPoints.toLocaleString()}
            subValue={`From ${tasks.length} approved tasks`}
            icon={<CheckCircle size={18} className="text-emerald-500" />}
            accentColor="#10b981"
          />
          <ERPStatCard
            title="Consistency Points"
            value={consistencyPoints.toLocaleString()}
            subValue="From daily updates (2 pts each)"
            icon={<Calendar size={18} className="text-blue-500" />}
            accentColor="#3b82f6"
          />
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111115] border border-white/5 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-6 flex items-center gap-2"><CheckCircle size={18} className="text-indigo-400" /> Approved Tasks</h2>
          {tasks.length === 0 ? (
            <ERPEmptyState icon={<CheckCircle size={24} />} title="No approved tasks yet" sub="Points will appear here once your tasks are approved by an admin." compact />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-white/10">
                  <tr>
                    <th className="pb-3 px-4">Task Name</th>
                    <th className="pb-3 px-4">Quality Rating</th>
                    <th className="pb-3 px-4">Points Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tasks.map((task) => (
                    <motion.tr whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }} key={task.id} className="transition-colors">
                      <td className="py-4 px-4 font-semibold text-white">{task.title}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${task.quality_rating === 'excellent' ? 'bg-indigo-500/10 text-indigo-400' : task.quality_rating === 'good' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                          {task.quality_rating || "accepted"}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-emerald-400">+{task.approved_points}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        <div className="mt-8 text-center text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          Points are awarded when admin approves a task with quality rating. Consistency points come from daily updates.
        </div>
      </div>
    </div>
  );
}