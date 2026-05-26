import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";
import { ArrowLeft, Calendar, User, CheckCircle, Clock, AlertCircle, FileText, Star, Upload, Download, Eye } from "lucide-react";

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
      await docApi.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Proof uploaded successfully");
      fetchProofs();
    } catch (err) {
      alert(err?.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleReviewProof = async (proofId, status, comment) => {
    try {
      await docApi.post(`/${proofId}/review`, { status, comment });
      alert(`Proof ${status}`);
      fetchProofs();
      setShowReviewModal(false);
      setReviewComment("");
    } catch (err) {
      alert(err?.response?.data?.error || "Review failed");
    }
  };

  const openReviewModal = (proof) => {
    setSelectedProof(proof);
    setReviewComment("");
    setShowReviewModal(true);
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center text-red-400">{error}</div>;
  if (!task) return null;

  const statusColor = {
    todo: "#3b82f6",
    in_progress: "#f59e0b",
    done: "#22c55e",
    approved: "#10b981",
    rejected: "#ef4444",
  };

  const statusLabel = {
    todo: "To Do",
    in_progress: "In Progress",
    done: "Done",
    approved: "Approved",
    rejected: "Rejected",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate("/erp/tasks")} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6">
          <ArrowLeft size={18} /> Back to Tasks
        </button>

        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-8">
          <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
            <h1 className="text-2xl font-bold">{task.title}</h1>
            <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ background: `${statusColor[task.status]}20`, color: statusColor[task.status] }}>
              {statusLabel[task.status] || task.status}
            </span>
          </div>

          {task.description && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-zinc-400 mb-2">Description</h2>
              <p className="text-zinc-300">{task.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <User size={16} className="text-zinc-500" />
              <span className="text-sm">Assigned to: {task.assignee?.name || `User #${task.assigned_to}`}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-zinc-500" />
              <span className="text-sm">Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : "Not set"}</span>
            </div>
            {task.approved_points > 0 && (
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-sm">Points: {task.approved_points}</span>
              </div>
            )}
            {task.quality_rating && (
              <div className="flex items-center gap-2">
                <Star size={16} className="text-yellow-500" />
                <span className="text-sm capitalize">Quality: {task.quality_rating}</span>
              </div>
            )}
          </div>

          {/* Proof Attachments Section */}
          <div className="border-t border-zinc-800 pt-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-zinc-400">
                <FileText size={16} />
                <span className="text-sm font-medium">Proof Attachments</span>
              </div>
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
                {uploading ? "Uploading..." : "Upload Proof"}
                <input type="file" onChange={handleProofUpload} disabled={uploading} className="hidden" />
              </label>
            </div>
            {proofs.length === 0 ? (
              <p className="text-zinc-500 text-sm">No proof attachments yet.</p>
            ) : (
              <div className="space-y-2">
                {proofs.map(proof => (
                  <div key={proof.id} className="bg-zinc-900/50 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{proof.original_filename}</p>
                      <p className="text-xs text-zinc-400">
                        Status: <span className={`capitalize ${proof.proof_status === 'approved' ? 'text-green-400' : proof.proof_status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}`}>{proof.proof_status}</span>
                        {proof.proof_review_comment && ` · Note: ${proof.proof_review_comment}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <a href={`/api/erp-documents/${proof.id}/download`} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm hover:underline">Download</a>
                      {isAdmin && proof.proof_status === 'pending' && (
                        <button onClick={() => openReviewModal(proof)} className="text-xs bg-yellow-600 px-2 py-1 rounded">Review</button>
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Review Proof</h3>
            <p className="text-sm text-zinc-400 mb-2">File: {selectedProof.original_filename}</p>
            <textarea
              placeholder="Review comment (optional)"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm"
              rows="3"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => handleReviewProof(selectedProof.id, 'approved', reviewComment)} className="flex-1 bg-green-600 py-2 rounded-lg">Approve</button>
              <button onClick={() => handleReviewProof(selectedProof.id, 'rejected', reviewComment)} className="flex-1 bg-red-600 py-2 rounded-lg">Reject</button>
              <button onClick={() => setShowReviewModal(false)} className="flex-1 bg-zinc-700 py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}