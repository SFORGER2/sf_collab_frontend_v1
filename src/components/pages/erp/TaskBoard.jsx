import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  requestInterceptor,
  responseInterceptor,
  responseErrorInterceptor,
} from "../../../utils/APIs/interceptors";
import { 
  Plus, Search, LayoutGrid, List, Filter, 
  MoreVertical, Calendar, User, CheckCircle2, 
  Clock, AlertCircle, Trash2, Award, ChevronDown, ChevronRight
} from "lucide-react";

const api = axios.create({ baseURL: "/api/erp-tasks" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const workspaceApi = axios.create({ baseURL: "/api/workspaces" });
workspaceApi.interceptors.request.use(requestInterceptor);
workspaceApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const TaskBoard = () => {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const workspaceId = user?.active_workspace_id || 1;
  const [view, setView] = useState("kanban");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [approvedCollapsed, setApprovedCollapsed] = useState(true);

  const loadTasks = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const res = await api.get("/list", { params: { workspace_id: workspaceId } });
      const raw = res.data?.data?.tasks || res.data?.tasks || [];
      const normalised = (Array.isArray(raw) ? raw : []).map((t) => ({
        id: String(t.id),
        title: t.title,
        description: t.description || "",
        status: t.status,
        deadline: t.deadline ? new Date(t.deadline).toLocaleDateString() : "—",
        assignee: t.assignee
          ? { name: t.assignee.name || `User #${t.assigned_to}`, avatar: (t.assignee.name?.[0] || "?") }
          : { name: "Unassigned", avatar: "?" },
        created_by: t.created_by,
      }));
      setTasks(normalised);
    } catch (e) {
      console.error("Failed to load tasks:", e);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleStatusChange = async (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await api.patch("/update", {
        workspace_id: workspaceId,
        task_id: parseInt(taskId),
        status: newStatus
      });
    } catch (error) {
      console.error("Failed to update task status", error);
      loadTasks();
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) return;
    try {
      await workspaceApi.delete(`/${workspaceId}/tasks/${taskId}`);
      loadTasks();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to delete task");
    }
  };

  const [newTask, setNewTask] = useState({ title: "", description: "", deadline: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/create", {
        workspace_id: workspaceId,
        title: newTask.title,
        description: newTask.description || "",
        assigned_to: user?.id,
        deadline: newTask.deadline || null,
        status: "todo"
      });
      setNewTask({ title: "", description: "", deadline: "" });
      setIsModalOpen(false);
      loadTasks();
    } catch (e) {
      alert(e?.response?.data?.error || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { id: "todo", title: "To Do", icon: <Clock className="text-blue-400" size={18} /> },
    { id: "in_progress", title: "In Progress", icon: <AlertCircle className="text-yellow-400" size={18} /> },
    { id: "done", title: "Done", icon: <CheckCircle2 className="text-green-400" size={18} /> },
    { id: "approved", title: "Approved", icon: <Award className="text-purple-400" size={18} /> },
  ];

  const canDelete = (task) => {
    // Only allow deletion for tasks that are NOT approved
    if (task.status === "approved") return false;
    const isAdmin = user?.role === "admin";
    const isCreator = task.created_by === user?.id;
    return isAdmin || isCreator;
  };

  const TaskCard = ({ task, onStatusChange, onDelete }) => {
    let nextStatus = null;
    if (task.status === "todo") nextStatus = "in_progress";
    else if (task.status === "in_progress") nextStatus = "done";
    const nextLabel = nextStatus === "in_progress" ? "In Progress" : "Done";

    return (
      <div
        className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-4 mb-3 hover:border-[#333] transition-all group cursor-pointer"
        onClick={() => navigate(`/erp/tasks/${task.id}`)}
      >
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400">
            Medium
          </span>
          {canDelete(task) && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
              className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete task"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
        <h4 className="text-sm font-semibold text-white mb-1">{task.title}</h4>
        <p className="text-xs text-gray-400 mb-4 line-clamp-2">{task.description}</p>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
              {task.assignee.avatar}
            </div>
            <span className="text-[10px] text-gray-400">{task.assignee.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <Calendar size={12} />
              {task.deadline}
            </div>
            {nextStatus && (
              <button
                onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, nextStatus); }}
                className="text-xs px-2 py-1 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30"
              >
                Move to {nextLabel}
              </button>
            )}
            {task.status === "done" && (
              <span className="text-xs text-gray-400 italic">Awaiting approval</span>
            )}
            {task.status === "approved" && (
              <span className="text-xs text-purple-400 font-medium">Points awarded</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderColumn = (column) => {
    const tasksInColumn = filteredTasks.filter(t => t.status === column.id);
    const isApprovedColumn = column.id === "approved";
    const isCollapsed = isApprovedColumn && approvedCollapsed;

    return (
      <div key={column.id} className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            {isApprovedColumn && (
              <button
                onClick={() => setApprovedCollapsed(!approvedCollapsed)}
                className="text-gray-400 hover:text-white"
              >
                {approvedCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
              </button>
            )}
            {column.icon}
            <h3 className="font-semibold text-sm">{column.title}</h3>
            <span className="bg-[#1a1a1a] text-gray-500 text-[10px] px-2 py-0.5 rounded-full border border-[#262626]">
              {tasksInColumn.length}
            </span>
          </div>
          <button className="text-gray-500 hover:text-white">
            <Plus size={16} />
          </button>
        </div>
        {!isCollapsed && (
          <div className="flex-1 bg-[#0a0a0a] rounded-2xl p-2 border border-dashed border-[#262626]">
            {tasksInColumn.map(task => (
              <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} onDelete={handleDeleteTask} />
            ))}
            {tasksInColumn.length === 0 && (
              <p className="text-center text-gray-500 text-xs py-4">No tasks</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-20">
      {/* Header and search – same as before */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Task Management</h1>
          <p className="text-gray-400 text-sm mt-1">Track and organize workspace tasks efficiently.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-[#262626]">
            <button onClick={() => setView("kanban")} className={`p-1.5 rounded ${view === 'kanban' ? 'bg-[#262626] text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              <LayoutGrid size={18} />
            </button>
            <button onClick={() => setView("list")} className={`p-1.5 rounded ${view === 'list' ? 'bg-[#262626] text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              <List size={18} />
            </button>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            <Plus size={18} />
            New Task
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input type="text" placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50" />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] border border-[#262626] rounded-lg text-sm text-gray-400 hover:text-white">
            <Filter size={16} /> Filter
          </button>
          <button className="px-3 py-2 bg-[#1a1a1a] border border-[#262626] rounded-lg text-sm text-gray-400 hover:text-white text-nowrap">
            Sort by: Priority
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-gray-500 text-sm">Loading tasks…</div>
      ) : view === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {columns.map(column => renderColumn(column))}
        </div>
      ) : (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0a0a0a] border-b border-[#262626]">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-400">Task Name</th>
                <th className="px-6 py-3 font-medium text-gray-400">Status</th>
                <th className="px-6 py-3 font-medium text-gray-400">Assignee</th>
                <th className="px-6 py-3 font-medium text-gray-400">Deadline</th>
                <th className="px-6 py-3 font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {filteredTasks.map(task => (
                <tr
                  key={task.id}
                  className="hover:bg-[#222] transition-colors cursor-pointer"
                  onClick={() => navigate(`/erp/tasks/${task.id}`)}
                >
                  <td className="px-6 py-4 font-medium text-white">{task.title}</td>
                  <td className="px-6 py-4">
                    {task.status === "approved" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400">
                        <Award size={12} /> Approved
                      </span>
                    ) : (
                      <select
                        value={task.status}
                        onChange={(e) => { e.stopPropagation(); handleStatusChange(task.id, e.target.value); }}
                        className="bg-[#1a1a1a] border border-[#262626] rounded px-2 py-1 text-xs text-white"
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                        {task.assignee.avatar}
                      </div>
                      <span className="text-gray-300">{task.assignee.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{task.deadline}</td>
                  <td className="px-6 py-4">
                    {canDelete(task) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          {/* modal content unchanged */}
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-lg font-semibold text-white mb-6">New Task</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Task title *" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50" />
              <textarea rows={3} placeholder="Description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 resize-none" />
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Due Date</label>
                <input type="date" value={newTask.deadline} onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-[#262626] text-white rounded-lg text-sm font-medium hover:bg-[#333] transition-colors">
                Cancel
              </button>
              <button onClick={handleCreateTask} disabled={submitting || !newTask.title.trim()}
                className="flex-1 py-2.5 bg-white text-black rounded-lg text-sm font-bold hover:bg-gray-200 disabled:opacity-50 transition-colors">
                {submitting ? "Creating…" : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
