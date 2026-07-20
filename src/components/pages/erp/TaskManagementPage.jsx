import React, { useState, useEffect, useCallback } from "react";
import TaskBoard from "./tasks/TaskBoard";
import TaskDetailModal from "./tasks/TaskDetailModal";
import { cn } from "../../../lib/utils";
import axios from "axios";
import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";
import { useSelector } from "react-redux";
import { Plus, Loader2 } from "lucide-react";

// B7 FIX: single /api/erp-tasks endpoint — no more mock data
const erpTasksApi = axios.create({ baseURL: "/api/erp-tasks" });
erpTasksApi.interceptors.request.use(requestInterceptor);
erpTasksApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const TaskManagementPage = () => {
  const { user } = useSelector(s => s.auth);
  const workspaceId = user?.active_workspace_id || 1;
  const userRole = user?.role || "member";

  const [tasks,        setTasks]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [creating,     setCreating]     = useState(false);

  // Role display: derive from real user role
  const role = ["founder", "admin", "owner"].includes(userRole?.toLowerCase()) ? "Admin" : "Member";

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await erpTasksApi.get("/list", { params: { workspace_id: workspaceId } });
      const raw = res?.data?.data?.tasks || res?.data?.tasks || [];
      setTasks((Array.isArray(raw) ? raw : []).map(t => ({ ...t, id: String(t.id) })));
    } catch (e) {
      console.error("Failed to load tasks:", e);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleTaskClick = (task) => setSelectedTask(task);

  const handleTaskUpdate = (taskId, updates) => {
    setTasks(prev => prev.map(t =>
      t.id === String(taskId)
        ? typeof updates === "string" ? { ...t, status: updates } : { ...t, ...updates }
        : t
    ));
  };

  const handleNewUnit = async () => {
    setCreating(true);
    try {
      const res = await erpTasksApi.post("/create", {
        workspace_id: workspaceId,
        title: "New Objective",
        description: "Initialize system objective and assign parameters...",
        status: "todo",
        priority: "low",
        complexity: "small",
      });
      const newTask = res?.data?.data?.task || res?.data?.task;
      if (newTask) {
        const normalised = { ...newTask, id: String(newTask.id) };
        setTasks(prev => [normalised, ...prev]);
        setSelectedTask(normalised);
      }
    } catch (e) {
      console.error("Failed to create task:", e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B101E] text-slate-100 font-sans selection:bg-blue-500/30">
      <div className="max-w-[1600px] mx-auto px-8 py-10 space-y-8 min-h-screen flex flex-col transition-all duration-500">

        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/5">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-blue-500 tracking-tight">SFCollab ERP</h1>
            <div className="h-6 w-[1px] bg-white/10" />
            <h2 className="text-lg font-semibold text-white">Operational Board</h2>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#151B2B] border border-white/5 text-slate-400">
              {role}
            </div>
            <button
              onClick={handleNewUnit}
              disabled={creating}
              className="px-5 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-b from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20 hover:from-blue-400 hover:to-blue-500 transition-all border border-blue-400/20 flex items-center gap-2 disabled:opacity-50"
            >
              {creating
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Plus className="w-4 h-4" />
              }
              New Task
            </button>
          </div>
        </div>

        {/* Board — passes real tasks; TaskBoard also fetches itself, so initialTasks is a warm seed */}
        <TaskBoard
          initialTasks={tasks}
          onTaskClick={handleTaskClick}
          onTaskUpdate={handleTaskUpdate}
          className="flex-1 mt-2"
        />

        {selectedTask && (
          <TaskDetailModal
            isOpen={!!selectedTask}
            onClose={() => setSelectedTask(null)}
            task={selectedTask}
            role={role}
            onUpdate={handleTaskUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default TaskManagementPage;