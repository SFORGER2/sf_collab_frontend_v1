import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, FileCheck } from "lucide-react";

import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";
import { ERPPageHeader } from "../../erp/shared/ERPPageHeader";
import { ERPEmptyState } from "../../erp/shared/ERPEmptyState";
import { ERPSpinner } from "../../erp/shared/ERPLoadingSkeleton";
import { ERPBannerManager } from "../../erp/shared/ERPBanner";

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
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/list", { params: { workspace_id: workspaceId, status: "done" } });
      const data = res.data?.data || res.data;
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleApprove = async (taskId, qualityRating) => {
    setActionLoading((prev) => ({ ...prev, [taskId]: "approve" }));
    try {
      await approvalApi.post(`/${workspaceId}/tasks/${taskId}/approve`, { quality_rating: qualityRating });
      loadTasks();
    } catch (err) {
      setError(err?.response?.data?.error || "Approval failed");
    } finally {
      setActionLoading((prev) => ({ ...prev, [taskId]: undefined }));
    }
  };

  const handleReject = async (taskId) => {
    const rejectionReason = prompt("Enter rejection reason:");
    if (!rejectionReason) return;
    setActionLoading((prev) => ({ ...prev, [taskId]: "reject" }));
    try {
      await approvalApi.post(`/${workspaceId}/tasks/${taskId}/reject`, { rejection_reason: rejectionReason });
      loadTasks();
    } catch (err) {
      setError(err?.response?.data?.error || "Rejection failed");
    } finally {
      setActionLoading((prev) => ({ ...prev, [taskId]: undefined }));
    }
  };

  const qualityOptions = [
    { value: "accepted", label: "Accepted (1.0x)", color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)" },
    { value: "good", label: "Good (1.2x)", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" },
    { value: "excellent", label: "Excellent (1.5x)", color: "#6366f1", bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.3)" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ERPPageHeader
          icon={<FileCheck size={20} />}
          title="Task Approval"
          description="Review completed tasks and award execution points based on quality."
          breadcrumbs={[{ label: "ERP" }, { label: "Admin" }, { label: "Approvals" }]}
        />

        {error && <ERPBannerManager error={error} onDismissError={() => setError(null)} />}

        {loading ? (
          <ERPSpinner label="Loading pending approvals..." />
        ) : tasks.length === 0 ? (
          <ERPEmptyState
            icon={<CheckCircle2 size={28} />}
            title="All caught up"
            sub="There are no completed tasks waiting for your approval right now."
          />
        ) : (
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 rounded-2xl"
                style={{ background: "var(--surface-panel)", border: "1px solid var(--surface-border)" }}
              >
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">{task.title}</h3>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                      <span>Assignee: {task.assignee?.name || `#${task.assigned_to}`}</span>
                      {task.deadline && <span>• Deadline: {new Date(task.deadline).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest">
                    Pending Review
                  </span>
                </div>
                
                {task.description && (
                  <p className="text-sm text-zinc-300 mb-6 bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                    {task.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/5">
                  {qualityOptions.map((opt) => (
                    <motion.button
                      key={opt.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleApprove(task.id, opt.value)}
                      disabled={actionLoading[task.id]}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{ background: opt.bg, color: opt.color, border: `1px solid ${opt.border}`, opacity: actionLoading[task.id] ? 0.5 : 1 }}
                    >
                      <CheckCircle2 size={14} /> {opt.label}
                    </motion.button>
                  ))}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleReject(task.id)}
                    disabled={actionLoading[task.id]}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 ml-auto transition-all"
                    style={{ opacity: actionLoading[task.id] ? 0.5 : 1 }}
                  >
                    <XCircle size={14} /> Reject
                  </motion.button>
                </div>
                {actionLoading[task.id] && <p className="mt-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest animate-pulse">Processing action...</p>}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}