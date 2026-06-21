import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";
import { CheckCircle, XCircle, Star } from "lucide-react";

const api = axios.create({ baseURL: "/api/erp-tasks" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const approvalApi = axios.create({ baseURL: "/api/workspaces" });
approvalApi.interceptors.request.use(requestInterceptor);
approvalApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

export default function TaskApproval() {
  const { user } = useSelector((s) => s.auth);
  const workspaceId = user?.active_workspace_id || 1;
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/list", { params: { workspace_id: workspaceId, status: "done" } });
      const data = res.data?.data || res.data;
      setTasks(data.tasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleApprove = async (taskId, qualityRating) => {
    setActionLoading((prev) => ({ ...prev, [taskId]: "approve" }));
    try {
      await approvalApi.post(`/${workspaceId}/tasks/${taskId}/approve`, { quality_rating: qualityRating });
      loadTasks();
      alert("Task approved successfully!");
    } catch (err) {
      alert(err?.response?.data?.error || "Approval failed");
    } finally {
      setActionLoading((prev) => ({ ...prev, [taskId]: undefined }));
    }
  };

  const handleReject = async (taskId, reason) => {
    const rejectionReason = prompt("Enter rejection reason:");
    if (!rejectionReason) return;
    setActionLoading((prev) => ({ ...prev, [taskId]: "reject" }));
    try {
      await approvalApi.post(`/${workspaceId}/tasks/${taskId}/reject`, { rejection_reason: rejectionReason });
      loadTasks();
      alert("Task rejected.");
    } catch (err) {
      alert(err?.response?.data?.error || "Rejection failed");
    } finally {
      setActionLoading((prev) => ({ ...prev, [taskId]: undefined }));
    }
  };

  const qualityOptions = [
    { value: "accepted", label: "Accepted (1.0x)", color: "#22c55e" },
    { value: "good", label: "Good (1.2x)", color: "#f59e0b" },
    { value: "excellent", label: "Excellent (1.5x)", color: "#6366f1" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Task Approval</h1>
        <p className="text-zinc-400 mb-8">Approve or reject completed tasks to award execution points</p>

        {loading ? (
          <div className="text-center py-20">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">No completed tasks pending approval.</div>
        ) : (
          <div className="space-y-6">
            {tasks.map((task) => (
              <div key={task.id} className="bg-[#121215] border border-zinc-800 rounded-2xl p-6">
                <div className="flex flex-wrap justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{task.title}</h3>
                    <p className="text-zinc-400 text-sm mt-1">Assigned to: {task.assignee?.name || `User #${task.assigned_to}`}</p>
                    {task.deadline && <p className="text-zinc-500 text-xs mt-1">Deadline: {new Date(task.deadline).toLocaleDateString()}</p>}
                  </div>
                </div>
                <p className="text-zinc-300 mb-4">{task.description}</p>

                <div className="flex flex-wrap gap-3 mt-4">
                  {qualityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleApprove(task.id, opt.value)}
                      disabled={actionLoading[task.id] === "approve"}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors"
                      style={{ background: `${opt.color}20`, color: opt.color, border: `1px solid ${opt.color}40` }}
                    >
                      <CheckCircle size={16} /> {opt.label}
                    </button>
                  ))}
                  <button
                    onClick={() => handleReject(task.id)}
                    disabled={actionLoading[task.id] === "reject"}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40 font-semibold"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                </div>
                {actionLoading[task.id] && (
                  <div className="mt-3 text-sm text-zinc-500">Processing...</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}