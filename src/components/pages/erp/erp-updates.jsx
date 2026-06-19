// src/components/pages/erp/erp-updates.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Star,
  Plus,
  X,
  Calendar,
  Send,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  requestInterceptor,
  responseInterceptor,
  responseErrorInterceptor,
} from "../../../utils/APIs/interceptors";

// Use the correct backend base URL for daily updates
const api = axios.create({ baseURL: "/api/daily-updates-new" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

export default function ERPUpdates() {
  const { user } = useSelector((s) => s.auth);
  // Use active workspace ID – ensure backend returns it
  const workspaceId = user?.active_workspace_id || 1;

  const [role, setRole] = useState("builder");
  const [currentPage, setCurrentPage] = useState(1);
  const updatesPerPage = 5;
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    today_work: "",
    next_plan: "",
    blockers: "",
    progress_rating: 0,
  });

  useEffect(() => {
    const storedRole = localStorage.getItem("activeRole");
    if (storedRole) setRole(storedRole);
  }, []);

  const isAdmin = role === "founder";

  const loadUpdates = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      if (isAdmin) {
        // Admin view: all workspace updates for today (or you can add date param)
        response = await api.get("/workspace", {
          params: { workspace_id: workspaceId, date: new Date().toISOString().split("T")[0] },
        });
        const records = response.data?.data?.records || response.data?.records || [];
        // Transform backend records to frontend shape
        const transformed = records.map((u) => ({
          id: u.id,
          user: u.user?.name || `User #${u.user_id}`,
          avatarColor: "bg-violet-600",
          date: new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          time: new Date(u.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          today: u.today_work,
          next: u.next_plan,
          blockers: u.blockers || "None reported",
          progress: u.progress_rating || 0,
        }));
        setUpdates(transformed);
      } else {
        // Member view: my updates
        response = await api.get("/my", {
          params: { workspace_id: workspaceId, limit: 50 },
        });
        const records = response.data?.data?.records || response.data?.records || [];
        const transformed = records.map((u) => ({
          id: u.id,
          user: "You",
          avatarColor: "bg-violet-600",
          date: new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          time: new Date(u.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          today: u.today_work,
          next: u.next_plan,
          blockers: u.blockers || "None reported",
          progress: u.progress_rating || 0,
        }));
        setUpdates(transformed);
      }
    } catch (error) {
      console.error("Failed to load updates", error);
      setUpdates([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, isAdmin]);

  useEffect(() => {
    loadUpdates();
  }, [loadUpdates]);

  const showToast = (message, isError = false) => {
    const toast = document.createElement("div");
    toast.className = `fixed bottom-6 right-6 ${isError ? "bg-red-600" : "bg-violet-600"} text-white px-6 py-4 rounded-3xl shadow-2xl z-[99999] flex items-center gap-3`;
    toast.innerHTML = `<span class="font-semibold">${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.today_work.trim()) {
      showToast("Please describe what you did today.", true);
      return;
    }
    try {
      await api.post("/submit", {
        workspace_id: workspaceId,
        today_work: formData.today_work,
        next_plan: formData.next_plan || null,
        blockers: formData.blockers || null,
        progress_rating: formData.progress_rating || null,
      });
      setFormData({ today_work: "", next_plan: "", blockers: "", progress_rating: 0 });
      setIsModalOpen(false);
      setCurrentPage(1);
      loadUpdates();
      showToast("Daily update submitted successfully!");
    } catch (error) {
      console.error("Failed to submit update", error);
      // Extract server error message if available
      const serverMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to submit update. Please try again.";
      showToast(serverMsg, true);
    }
  };

  // Sort newest first
  const filteredUpdates = [...updates].sort((a, b) => new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`));
  const totalPages = Math.ceil(filteredUpdates.length / updatesPerPage);
  const startIndex = (currentPage - 1) * updatesPerPage;
  const currentUpdates = filteredUpdates.slice(startIndex, startIndex + updatesPerPage);

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8 text-white">
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.5px] bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
              Daily Updates
            </h1>
            <p className="text-zinc-400 text-lg mt-1">
              {isAdmin ? "All Updates Feed" : "My Updates Feed"}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="hidden md:flex items-center gap-x-3 bg-gradient-to-br from-violet-600 via-purple-950 to-violet-950 hover:bg-violet-700 active:scale-95 transition-all px-8 py-4 rounded-3xl font-semibold text-lg shadow-xl shadow-violet-500/20"
          >
            <Plus className="w-6 h-6" />
            Log Today's Progress
          </button>
        </div>

        {/* Banner */}
        <div className="mb-10 bg-gradient-to-br from-violet-600 via-purple-600 to-violet-950 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden">
          <div className="flex items-center gap-x-4">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium">Consistent logging accelerates delivery</p>
              <p className="text-white/80 text-sm">
                {isAdmin ? "What did your team build today?" : "What did you build today?"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-white text-violet-700 px-8 py-3 rounded-3xl font-semibold flex items-center justify-center gap-x-2 hover:bg-violet-200 transition-colors"
          >
            Log Update
            <Send className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between mb-6 px-1">
          <div className="uppercase text-xs font-semibold tracking-[1px] text-zinc-400">
            {isAdmin ? "ALL TEAM UPDATES" : "MY UPDATES"}
          </div>
          <div className="text-xs text-zinc-400">{filteredUpdates.length} updates</div>
        </div>

        {/* Updates Feed */}
        <div className="space-y-8">
          {currentUpdates.length === 0 ? (
            <div className="bg-[#111113] border border-dashed border-zinc-700 rounded-3xl p-16 text-center">
              <p className="text-zinc-400 text-xl">No updates yet.</p>
            </div>
          ) : (
            currentUpdates.map((update) => (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-[#111113] border border-zinc-700 hover:border-violet-500/30 rounded-3xl py-8 md:px-8 px-6 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/10"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-x-4">
                    <div className={`w-9 h-9 ${update.avatarColor} rounded-2xl flex items-center justify-center text-white font-semibold text-xl`}>
                      {update.user[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-lg bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
                        {update.user}
                      </p>
                      <div className="flex items-center text-xs text-zinc-300">
                        <Calendar className="w-3 h-3 mr-1" />
                        {update.date} • {update.time}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-x-2 bg-zinc-900 px-5 py-2 rounded-3xl text-sm md:ml-auto">
                    <span className="text-zinc-300 font-medium">Progress</span>
                    <div className="flex gap-x-px">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < update.progress ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="flex gap-x-3">
                    <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold tracking-widest text-emerald-400 mb-2">WHAT I DID TODAY</p>
                      <p className="text-zinc-200 leading-relaxed text-[15px]">{update.today}</p>
                    </div>
                  </div>
                  <div className="flex gap-x-3">
                    <ArrowRight className="w-6 h-6 text-sky-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold tracking-widest text-sky-400 mb-2">WHAT I'LL DO NEXT</p>
                      <p className="text-zinc-200 leading-relaxed text-[15px]">{update.next}</p>
                    </div>
                  </div>
                  <div className="flex gap-x-3">
                    <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold tracking-widest text-amber-400 mb-2">BLOCKERS</p>
                      <p className="text-zinc-200 leading-relaxed text-[15px]">{update.blockers}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-zinc-700 text-xs text-zinc-400 text-right">
                  Logged • {update.time}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-x-4 mt-12">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-x-2 px-5 py-3 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-3xl transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
            <div className="flex gap-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-2xl font-medium transition-colors ${
                    page === currentPage ? "bg-violet-600 text-white" : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-x-2 px-5 py-3 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-3xl transition-colors"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-2xl z-[9999] flex items-center justify-center p-6"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-[#17171a] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-violet-300/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-8 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-[#17171a] z-10 border-b border-zinc-800">
                <div className="flex items-center gap-x-3">
                  <h2 className="text-3xl font-semibold tracking-tight">Submit Daily Update</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center hover:bg-zinc-800 rounded-2xl transition-colors">
                  <X className="w-6 h-6 text-zinc-400" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-8">
                <div>
                  <label className="flex items-center gap-x-2 text-sm font-medium text-zinc-400 mb-3">
                    What did you do today?
                  </label>
                  <textarea
                    value={formData.today_work}
                    onChange={(e) => setFormData({ ...formData, today_work: e.target.value })}
                    className="w-full h-32 bg-[#1f1f24] border border-transparent focus:border-violet-400 rounded-3xl px-6 py-5 text-base resize-none outline-none placeholder:text-zinc-500"
                    placeholder="Describe your key accomplishments today..."
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-x-2 text-sm font-medium text-zinc-400 mb-3">
                    What will you do next? <span className="text-zinc-600 text-xs">(optional)</span>
                  </label>
                  <textarea
                    value={formData.next_plan}
                    onChange={(e) => setFormData({ ...formData, next_plan: e.target.value })}
                    className="w-full h-32 bg-[#1f1f24] border border-transparent focus:border-violet-400 rounded-3xl px-6 py-5 text-base resize-none outline-none placeholder:text-zinc-500"
                    placeholder="Your plan for tomorrow..."
                  />
                </div>
                <div>
                  <label className="flex items-center gap-x-2 text-sm font-medium text-zinc-400 mb-3">
                    Blockers
                  </label>
                  <textarea
                    value={formData.blockers}
                    onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
                    className="w-full h-24 bg-[#1f1f24] border border-transparent focus:border-violet-400 rounded-3xl px-6 py-5 text-base resize-none outline-none placeholder:text-zinc-500"
                    placeholder="Any blockers or dependencies?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-4">Progress rating</label>
                  <div className="flex items-center justify-center gap-x-4 py-6 bg-[#1f1f24] rounded-3xl">
                    {[...Array(5)].map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, progress_rating: i + 1 })}
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star className={`w-9 h-9 ${i + 1 <= formData.progress_rating ? "text-yellow-400 fill-yellow-400" : "text-zinc-600"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-br from-violet-600 to-purple-950 hover:from-violet-600 hover:to-purple-700 py-6 rounded-3xl font-semibold text-xl flex items-center justify-center gap-x-3 shadow-2xl shadow-violet-500/30 active:scale-[0.98] transition-all hover:cursor-pointer"
                >
                  Submit Daily Update
                  <Send className="w-6 h-6" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}