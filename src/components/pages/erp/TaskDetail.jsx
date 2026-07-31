import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar, User, CheckCircle, Star, FileText, LayoutList } from "lucide-react";

import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";
import { ERPPageHeader } from "../../erp/shared/ERPPageHeader";
import { ERPStatusBadge } from "../../erp/shared/ERPStatusBadge";
import { ERPEmptyState } from "../../erp/shared/ERPEmptyState";
import { ERPSpinner } from "../../erp/shared/ERPLoadingSkeleton";
import { ERPBannerManager } from "../../erp/shared/ERPBanner";

const api = axios.create({ baseURL: "/api/erp-tasks" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const docApi = axios.create({ baseURL: "/api/erp-documents" });
docApi.interceptors.request.use(requestInterceptor);
docApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const statusColor = { todo: "#888888", in_progress: "#3b82f6", done: "#22c55e" };
const statusLabel = { todo: "To Do", in_progress: "In Progress", done: "Completed" };

export default function TaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const workspaceId = user?.active_workspace_id || 1;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proofs, setProofs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProof, setSelectedProof] = useState(null);
  const [reviewComment, setReviewComment] = useState("");
  const isAdmin = user?.role === "admin";

  const fetchTask = useCallback(async () => {
    try {
      const res = await api.get("/list", { params: { workspace_id: workspaceId } });
      const tasks = res.data?.data?.tasks || res.data?.tasks || [];
      const found = tasks.find(t => t.id === parseInt(taskId));
      if (!found) throw new Error("Task not found");
      setTask(found);
    } catch (err) {
      setError(err.message);
    }
  }, [taskId, workspaceId]);

  const fetchProofs = useCallback(async () => {
    try {
      const res = await docApi.get(`/task/${taskId}`);
      const data = res.data?.data || res.data;
      setProofs(data.documents || []);
    } catch (err) {
      console.error("Failed to load proofs", err);
    }
  }, [taskId]);

  useEffect(() => {
    Promise.all([fetchTask(), fetchProofs()]).finally(() => setLoading(false));
  }, [fetchTask, fetchProofs]);

  const handleProofUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("workspace_id", workspaceId);
    formData.append("task_id", taskId);
    formData.append("folder", "proofs");
    try {
      await docApi.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      fetchProofs();
    } catch (err) {
      setError(err?.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleReviewProof = async (proofId, status, comment) => {
    try {
      await docApi.post(`/${proofId}/review`, { status, comment });
      fetchProofs();
      setShowReviewModal(false);
      setReviewComment("");
    } catch (err) {
      setError(err?.response?.data?.error || "Review failed");
    }
  };

  const openReviewModal = (proof) => {
    setSelectedProof(proof);
    setReviewComment("");
    setShowReviewModal(true);
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0b]"><ERPSpinner label="Loading task details..." /></div>;
  if (!task) return <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center text-red-400">Task not found</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-3.5 sm:p-8 max-w-full min-w-0 overflow-x-hidden">
      <div className="max-w-3xl mx-auto min-w-0 w-full">
        <button onClick={() => navigate("/erp/tasks")} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 min-h-[44px]">
          <ArrowLeft size={18} /> Back to Tasks
        </button>

        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-4 sm:p-8 shadow-2xl w-full min-w-0">
          <div className="flex justify-between items-start flex-wrap gap-3 mb-6 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold break-words max-w-full">{task.title}</h1>
            <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shrink-0" style={{ background: `${statusColor[task.status] || '#888'}20`, color: statusColor[task.status] || '#888' }}>
              {statusLabel[task.status] || task.status}
            </span>
          </div>

          {error && <ERPBannerManager error={error} onDismissError={() => setError(null)} />}

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-2xl mb-8" style={{ background: "#111115", border: "1px solid rgba(255,255,255,0.06)" }}>
            {task.description && (
              <div className="mb-6">
                <h2 className="text-xs sm:text-sm font-semibold text-zinc-400 mb-2">Description</h2>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed break-words">{task.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 mb-6">
              <div className="flex items-center gap-2 min-w-0">
                <User size={16} className="text-zinc-500 shrink-0" />
                <span className="text-xs sm:text-sm text-zinc-300 truncate">Assigned to: {task.assignee?.name || `User #${task.assigned_to}`}</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Calendar size={16} className="text-zinc-500 shrink-0" />
                <span className="text-xs sm:text-sm text-zinc-300 whitespace-nowrap">Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : "Not set"}</span>
              </div>
              {task.approved_points > 0 && (
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle size={16} className="text-green-500 shrink-0" />
                  <span className="text-xs sm:text-sm text-zinc-300">Points: {task.approved_points}</span>
                </div>
              )}
              {task.quality_rating && (
                <div className="flex items-center gap-2 min-w-0">
                  <Star size={16} className="text-yellow-500 shrink-0" />
                  <span className="text-xs sm:text-sm text-zinc-300 capitalize">Quality: {task.quality_rating}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Proof Attachments Section */}
          <div className="border-t border-zinc-800 pt-4 mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
              <div className="flex items-center gap-2 text-zinc-400">
                <FileText size={16} className="shrink-0" />
                <span className="text-xs sm:text-sm font-medium">Proof Attachments</span>
              </div>
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-lg transition-colors inline-flex items-center justify-center min-h-[36px] w-full sm:w-auto">
                {uploading ? "Uploading..." : "Upload Proof"}
                <input type="file" onChange={handleProofUpload} disabled={uploading} className="hidden" />
              </label>
            </div>
            {proofs.length === 0 ? (
              <p className="text-zinc-500 text-xs sm:text-sm py-2">No proof attachments yet.</p>
            ) : (
              <div className="space-y-2.5">
                {proofs.map(proof => (
                  <div key={proof.id} className="bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-white break-words">{proof.original_filename}</p>
                      <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 break-words">
                        Status: <span className={`capitalize font-semibold ${proof.proof_status === 'approved' ? 'text-green-400' : proof.proof_status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}`}>{proof.proof_status}</span>
                        {proof.proof_review_comment && ` · Note: ${proof.proof_review_comment}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <a href={`/api/erp-documents/${proof.id}/download`} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs sm:text-sm hover:underline py-1 px-2">Download</a>
                      {isAdmin && proof.proof_status === 'pending' && (
                        <button onClick={() => openReviewModal(proof)} className="text-xs bg-yellow-600 text-black font-semibold px-2.5 py-1 rounded hover:bg-yellow-500 min-h-[32px]">Review</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedProof && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-5 sm:p-6 w-full max-w-md my-auto shadow-2xl">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3">Review Proof</h3>
            <p className="text-xs sm:text-sm text-zinc-400 mb-3 break-words">File: {selectedProof.original_filename}</p>
            <textarea
              placeholder="Review comment (optional)"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500/50 resize-none"
              rows="3"
            />
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
              <button onClick={() => handleReviewProof(selectedProof.id, 'approved', reviewComment)} className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-semibold py-2.5 rounded-lg min-h-[44px]">Approve</button>
              <button onClick={() => handleReviewProof(selectedProof.id, 'rejected', reviewComment)} className="w-full sm:flex-1 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold py-2.5 rounded-lg min-h-[44px]">Reject</button>
              <button onClick={() => setShowReviewModal(false)} className="w-full sm:flex-1 bg-zinc-700 hover:bg-zinc-600 text-white text-xs sm:text-sm font-semibold py-2.5 rounded-lg min-h-[44px]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}