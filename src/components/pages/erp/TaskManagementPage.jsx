import React, { useState, useEffect, useCallback } from "react";
import TaskBoard from "./tasks/TaskBoard";
import TaskDetailModal from "./tasks/TaskDetailModal";
import axios from "axios";
import { useSelector } from "react-redux";
import { Plus, Loader2, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";
import { ERPPageHeader } from "../../erp/shared/ERPPageHeader";

const erpTasksApi = axios.create({ baseURL: "/api/erp-tasks" });
erpTasksApi.interceptors.request.use(requestInterceptor);
erpTasksApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const TaskManagementPage = () => {
  const { user } = useSelector(s => s.auth);
  const workspaceId = user?.active_workspace_id || 1;
  const userRole = user?.role || "member";

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [creating, setCreating] = useState(false);

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
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ERPPageHeader
          icon={<LayoutDashboard size={20} />}
          title="Operational Board"
          description="Manage workspace tasks, track progress, and assign objectives."
          breadcrumbs={[{ label: "ERP" }, { label: "Task Management" }]}
          actions={
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {role} View
              </span>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNewUnit}
                disabled={creating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg"
                style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", opacity: creating ? 0.7 : 1 }}
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus size={15} />}
                New Task
              </motion.button>
            </div>
          }
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          <TaskBoard
            initialTasks={tasks}
            onTaskClick={handleTaskClick}
            onTaskUpdate={handleTaskUpdate}
          />
        </motion.div>

        <AnimatePresence>
          {selectedTask && (
            <TaskDetailModal
              isOpen={!!selectedTask}
              onClose={() => setSelectedTask(null)}
              task={selectedTask}
              role={role}
              onUpdate={handleTaskUpdate}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TaskManagementPage;