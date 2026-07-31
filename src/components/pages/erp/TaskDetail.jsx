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
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate("/erp/tasks")} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors mb-6">
          <ArrowLeft size={14} /> Back to Tasks
        </button>

        <ERPPageHeader
          icon={<LayoutList size={20} />}
          title={task.title}
          description="Task details, assignment, and proof attachments"
          breadcrumbs={[{ label: "ERP" }, { label: "Tasks" }, { label: "Task Details" }]}
          badge={<ERPStatusBadge status={task.status} />}
        />

        {error && <ERPBannerManager error={error} onDismissError={() => setError(null)} />}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-2xl mb-8" style={{ background: "var(--surface-panel)", border: "1px solid var(--surface-border)" }}>
          {task.description && (
            <div className="mb-8">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Description</h2>
              <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/50 p-4 rounded-xl border border-white/5">{task.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5">
              <div className="flex items-center gap-2 mb-1.5 text-zinc-400"><User size={14} /><span className="text-[10px] font-bold uppercase tracking-widest">Assignee</span></div>
              <p className="text-sm font-semibold text-white">{task.assignee?.name || `User #${task.assigned_to}`}</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5">
              <div className="flex items-center gap-2 mb-1.5 text-zinc-400"><Calendar size={14} /><span className="text-[10px] font-bold uppercase tracking-widest">Deadline</span></div>
              <p className="text-sm font-semibold text-white">{task.deadline ? new Date(task.deadline).toLocaleDateString() : "Not set"}</p>
            </div>
            {task.approved_points > 0 && (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 mb-1.5 text-green-500/70"><CheckCircle size={14} /><span className="text-[10px] font-bold uppercase tracking-widest">Points</span></div>
                <p className="text-sm font-semibold text-green-400">{task.approved_points}</p>
              </div>
            )}
            {task.quality_rating && (
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-1.5 text-yellow-500/70"><Star size={14} /><span className="text-[10px] font-bold uppercase tracking-widest">Quality</span></div>
                <p className="text-sm font-semibold text-yellow-400 capitalize">{task.quality_rating}</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-8 rounded-2xl" style={{ background: "var(--surface-panel)", border: "1px solid var(--surface-border)" }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-zinc-400" />
              <h2 className="text-base font-semibold text-white">Proof Attachments</h2>
            </div>
            <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              {uploading ? "Uploading..." : "Upload Proof"}
              <input type="file" onChange={handleProofUpload} disabled={uploading} className="hidden" />
            </label>
          </div>

          {proofs.length === 0 ? (
            <ERPEmptyState icon={<FileText size={24} />} title="No proofs yet" sub="Upload documents to prove task completion." compact />
          ) : (
            <div className="space-y-3">
              {proofs.map(proof => (
                <div key={proof.id} className="flex justify-between items-center p-4 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">{proof.original_filename}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${proof.proof_status === 'approved' ? 'bg-green-500/10 text-green-400' : proof.proof_status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                        {proof.proof_status}
                      </span>
                      {proof.proof_review_comment && <span className="text-[10px] text-zinc-500">Note: {proof.proof_review_comment}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <a href={`/api/erp-documents/${proof.id}/download`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">Download</a>
                    {isAdmin && proof.proof_status === 'pending' && (
                      <button onClick={() => openReviewModal(proof)} className="text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors">Review</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showReviewModal && selectedProof && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#111115] border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-white mb-2">Review Proof</h3>
              <p className="text-xs text-zinc-400 mb-5 font-mono">{selectedProof.original_filename}</p>
              
              <div className="mb-5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Review Comment (Optional)</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-[#1a1a20] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  rows="3"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowReviewModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
                <button onClick={() => handleReviewProof(selectedProof.id, 'rejected', reviewComment)} className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 py-2.5 rounded-xl text-sm font-semibold transition-colors">Reject</button>
                <button onClick={() => handleReviewProof(selectedProof.id, 'approved', reviewComment)} className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 py-2.5 rounded-xl text-sm font-semibold transition-colors">Approve</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}