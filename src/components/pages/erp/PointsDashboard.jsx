import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";
import { Award, CheckCircle, Calendar } from "lucide-react";

const tasksApi = axios.create({ baseURL: "/api/erp-tasks" });
tasksApi.interceptors.request.use(requestInterceptor);
tasksApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const updatesApi = axios.create({ baseURL: "/api/daily-updates-new" });
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
      // Fetch tasks assigned to user
      const tasksRes = await tasksApi.get("/list", {
        params: { workspace_id: workspaceId, assigned_to: userId }
      });
      const tasksData = tasksRes.data?.data?.tasks || tasksRes.data?.tasks || [];
      const approvedTasks = tasksData.filter(t => 
        (t.status || "").toLowerCase() === "approved" && 
        Number(t.approved_points) > 0
      );
      setTasks(approvedTasks);
      const points = approvedTasks.reduce((sum, t) => sum + Number(t.approved_points || 0), 0);
      setTaskPoints(points);

      // Consistency points
      const updatesRes = await updatesApi.get("/my", {
        params: { workspace_id: workspaceId, limit: 100 }
      });
      const updates = updatesRes.data?.data?.records || updatesRes.data?.records || [];
      const submittedCount = updates.length;
      const consistency = submittedCount * 2;
      setConsistencyPoints(consistency);
    } catch (err) {
      console.error("Failed to load points data", err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Recompute total whenever taskPoints or consistencyPoints change
  useEffect(() => {
    setTotalPoints(taskPoints + consistencyPoints);
  }, [taskPoints, consistencyPoints]);

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Points Dashboard</h1>
        <p className="text-zinc-400 mb-8">Your execution points breakdown</p>

        {/* Total Points Card */}
        <div className="bg-gradient-to-br from-violet-900 to-indigo-900 rounded-2xl p-8 mb-8 text-center">
          <Award className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
          <p className="text-sm uppercase tracking-widest text-zinc-300">Total Points</p>
          <p className="text-5xl font-bold text-white">{totalPoints}</p>
        </div>

        {/* Points Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h2 className="text-xl font-semibold">Task Points</h2>
            </div>
            <p className="text-3xl font-bold text-white mb-4">{taskPoints}</p>
            <p className="text-sm text-zinc-400">From {tasks.length} approved tasks</p>
          </div>
          <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-semibold">Consistency Points</h2>
            </div>
            <p className="text-3xl font-bold text-white mb-4">{consistencyPoints}</p>
            <p className="text-sm text-zinc-400">From daily updates (2 pts each)</p>
          </div>
        </div>

        {/* Approved Tasks Table */}
        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Approved Tasks</h2>
          {tasks.length === 0 ? (
            <p className="text-zinc-500 text-center py-6">No approved tasks yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="text-left py-2">Task</th>
                    <th className="text-left py-2">Quality</th>
                    <th className="text-left py-2">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task.id} className="border-b border-zinc-800">
                      <td className="py-2">{task.title}</td>
                      <td className="py-2 capitalize">{task.quality_rating || "accepted"}</td>
                      <td className="py-2 font-semibold text-green-400">{task.approved_points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-xs text-zinc-500">
          <p>Points are awarded when admin approves a task with quality rating. Consistency points come from daily updates.</p>
        </div>
      </div>
    </div>
  );
}