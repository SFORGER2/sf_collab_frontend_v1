import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  requestInterceptor,
  responseInterceptor,
  responseErrorInterceptor,
} from "../../../utils/APIs/interceptors";
import { Plus, LayoutGrid, List, Filter, Calendar, User, CheckCircle2, Clock, AlertCircle, Trash2, Award, ChevronDown, ChevronRight } from "lucide-react";
import { PageHeader, GlassCard, Button, Badge, SearchBar, Spinner, EmptyState } from "@/components/erp/ui";

const api = axios.create({ baseURL: "/api/erp-tasks" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const workspaceApi = axios.create({ baseURL: "/api/workspaces" });
workspaceApi.interceptors.request.use(requestInterceptor);
workspaceApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

export default function TaskBoard() {
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

  useEffect(() => { loadTasks(); }, [loadTasks]);

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
    if (!window.confirm("Delete this task?")) return;
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
    if (task.status === "approved") return false;
    const isAdmin = user?.role === "admin";
    const isCreator = task.created_by === user?.id;
    return isAdmin || isCreator;
  };

  const TaskCard = ({ task }) => {
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
          <Badge color="yellow">Medium</Badge>
          {canDelete(task) && (
            <button
              onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
              className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
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
                onClick={(e) => { e.stopPropagation(); handleStatusChange(task.id, nextStatus); }}
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
            <Badge color="gray">{tasksInColumn.length}</Badge>
          </div>
          <button className="text-gray-500 hover:text-white">
            <Plus size={16} />
          </button>
        </div>
        {!isCollapsed && (
          <div className="flex-1 bg-[#0a0a0a] rounded-2xl p-2 border border-dashed border-[#262626]">
            {tasksInColumn.map(task => <TaskCard key={task.id} task={task} />)}
            {tasksInColumn.length === 0 && (
              <p className="text-center text-gray-500 text-xs py-4">No tasks</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-3.5 sm:p-6 pb-20 max-w-full min-w-0 overflow-x-hidden">
      <PageHeader
        title="Task Management"
        subtitle="Track and organize workspace tasks efficiently."
        actions={
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-[#262626] shrink-0">
              <button onClick={() => setView("kanban")} className={`p-1.5 rounded min-h-[36px] min-w-[36px] flex items-center justify-center ${view === 'kanban' ? 'bg-[#262626] text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                <LayoutGrid size={18} />
              </button>
              <button onClick={() => setView("list")} className={`p-1.5 rounded min-h-[36px] min-w-[36px] flex items-center justify-center ${view === 'list' ? 'bg-[#262626] text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                <List size={18} />
              </button>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="flex-1 sm:flex-none justify-center min-h-[44px]">
              <Plus size={18} className="mr-2" /> New Task
            </Button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6 w-full min-w-0">
        <div className="flex-1 min-w-0">
          <SearchBar value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search tasks..." />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none justify-center"><Filter size={16} className="mr-1" /> Filter</Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none justify-center">Sort by: Priority</Button>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : view === "kanban" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 w-full min-w-0">
          {columns.map(column => renderColumn(column))}
        </div>
      ) : (
        <GlassCard className="overflow-hidden p-0 w-full min-w-0">
          <div className="overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <Table
              headers={["Task Name", "Status", "Assignee", "Deadline", "Actions"]}
              rows={filteredTasks.map(task => [
                <span className="font-medium text-white break-words">{task.title}</span>,
                task.status === "approved" ? (
                  <Badge color="purple"><Award size={12} className="mr-1" /> Approved</Badge>
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
                ),
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                    {task.assignee.avatar}
                  </div>
                  <span className="text-gray-300 truncate">{task.assignee.name}</span>
                </div>,
                <span className="text-gray-400 whitespace-nowrap">{task.deadline}</span>,
                canDelete(task) && (
                  <button onClick={() => handleDeleteTask(task.id)} className="text-gray-400 hover:text-red-400 p-1">
                    <Trash2 size={16} />
                  </button>
                )
              ])}
            />
          </div>
        </GlassCard>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-5 sm:p-8 w-full max-w-md my-auto shadow-2xl">
            <h2 className="text-lg font-semibold text-white mb-5">New Task</h2>
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
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="w-full sm:flex-1 py-2.5 bg-[#262626] text-white rounded-lg text-sm font-medium hover:bg-[#333] transition-colors min-h-[44px]">
                Cancel
              </button>
              <button onClick={handleCreateTask} disabled={submitting || !newTask.title.trim()}
                className="w-full sm:flex-1 py-2.5 bg-white text-black rounded-lg text-sm font-bold hover:bg-gray-200 disabled:opacity-50 transition-colors min-h-[44px]">
                {submitting ? "Creating…" : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

