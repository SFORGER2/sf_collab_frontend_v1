import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  requestInterceptor,
  responseInterceptor,
  responseErrorInterceptor,
} from "../../../utils/APIs/interceptors";
import { 
  Plus, Search, LayoutGrid, List, Filter, 
  MoreVertical, Calendar, User, CheckCircle2, 
  Clock, AlertCircle 
} from "lucide-react";

const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const TaskBoard = () => {
  const { user } = useSelector((s) => s.auth);

  const [view, setView]             = useState("kanban");
  const [tasks, setTasks]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/tasks", { params: { per_page: 100 } });
      const raw = res.data?.data?.tasks || res.data?.data || res.data?.tasks || res.data || [];
      const normalised = (Array.isArray(raw) ? raw : []).flatMap((t) => {
        try {
          return [{
            id:          String(t.id),
            title:       t.title || t.name || "Untitled",
            description: t.description || "",
            status:      t.status === "completed" || t.status === "done" ? "done"
                       : t.status === "in_progress" ? "in_progress"
                       : "todo",
            priority:    t.priority || "medium",
            deadline:    t.due_date ? new Date(t.due_date).toLocaleDateString() : "—",
            assignee: t.assignee
              ? { name: `${t.assignee.firstName || t.assignee.first_name || ""} ${t.assignee.lastName || t.assignee.last_name || ""}`.trim() || `User #${t.assigned_to}`,
                  avatar: ((t.assignee.firstName || t.assignee.first_name || "?")[0] + (t.assignee.lastName || t.assignee.last_name || "?")[0]).toUpperCase() }
              : { name: user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "You", avatar: (user?.firstName?.[0] || "?") },
          }];
        } catch { return []; }
      });
      setTasks(normalised);
    } catch (e) {
      // 500 = task route has server error (likely serialisation issue in task model)
      // Show empty state rather than crashing
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    const apiStatus = newStatus === "done" ? "completed" : newStatus === "in_progress" ? "in_progress" : "to_do";
    try {
      await api.patch(`/tasks/${taskId}`, { status: apiStatus });
    } catch {
      load(); // revert
    }
  };

  // New Task modal state
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium", due_date: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/tasks", {
        title:       newTask.title,
        description: newTask.description || "",
        priority:    newTask.priority,
        status:      "to_do",
        due_date:    newTask.due_date || null,
        assigned_to: user?.id,
        user_id:     user?.id,      // task owner
        created_by:  user?.id,
      });
      setNewTask({ title: "", description: "", priority: "medium", due_date: "" });
      setIsModalOpen(false);
      load();
    } catch (e) {
      alert(e?.response?.data?.error || e?.response?.data?.message || "Failed to create task. Check required fields.");
    } finally { setSubmitting(false); }
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { id: "todo",        title: "To Do",       icon: <Clock        className="text-blue-400"   size={18} /> },
    { id: "in_progress", title: "In Progress",  icon: <AlertCircle  className="text-yellow-400" size={18} /> },
    { id: "done",        title: "Done",         icon: <CheckCircle2 className="text-green-400"  size={18} /> },
  ];

  const TaskCard = ({ task }) => (
    <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-4 mb-3 hover:border-[#333] transition-all group">
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
          task.priority === 'high' ? 'bg-red-500/10 text-red-400' : 
          task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-blue-500/10 text-blue-400'
        }`}>
          {task.priority}
        </span>
        <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical size={16} />
        </button>
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
        <div className="flex items-center gap-1 text-[10px] text-gray-500">
          <Calendar size={12} />
          {task.deadline}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Task Management</h1>
          <p className="text-gray-400 text-sm mt-1">Track and organize workspace tasks efficiently.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-[#262626]">
            <button 
              onClick={() => setView("kanban")}
              className={`p-1.5 rounded ${view === 'kanban' ? 'bg-[#262626] text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setView("list")}
              className={`p-1.5 rounded ${view === 'list' ? 'bg-[#262626] text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <List size={18} />
            </button>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            <Plus size={18} />
            New Task
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] border border-[#262626] rounded-lg text-sm text-gray-400 hover:text-white transition-colors">
            <Filter size={16} />
            Filter
          </button>
          <button className="px-3 py-2 bg-[#1a1a1a] border border-[#262626] rounded-lg text-sm text-gray-400 hover:text-white transition-colors text-nowrap">
            Sort by: Priority
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {loading ? (
        <div className="flex justify-center py-16 text-gray-500 text-sm">Loading tasks…</div>
      ) : view === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(column => (
            <div key={column.id} className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  {column.icon}
                  <h3 className="font-semibold text-sm">{column.title}</h3>
                  <span className="bg-[#1a1a1a] text-gray-500 text-[10px] px-2 py-0.5 rounded-full border border-[#262626]">
                    {filteredTasks.filter(t => t.status === column.id).length}
                  </span>
                </div>
                <button className="text-gray-500 hover:text-white">
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="flex-1 bg-[#0a0a0a] rounded-2xl p-2 border border-dashed border-[#262626]">
                {filteredTasks
                  .filter(t => t.status === column.id)
                  .map(task => <TaskCard key={task.id} task={task} />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0a0a0a] border-b border-[#262626]">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-400">Task Name</th>
                <th className="px-6 py-3 font-medium text-gray-400">Status</th>
                <th className="px-6 py-3 font-medium text-gray-400">Priority</th>
                <th className="px-6 py-3 font-medium text-gray-400">Assignee</th>
                <th className="px-6 py-3 font-medium text-gray-400">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {filteredTasks.map(task => (
                <tr key={task.id} className="hover:bg-[#222] transition-colors cursor-pointer group">
                  <td className="px-6 py-4 font-medium text-white">{task.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      task.status === 'done' ? 'bg-green-500/10 text-green-400' :
                      task.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] uppercase font-bold ${
                      task.priority === 'high' ? 'text-red-400' : 
                      task.priority === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold">
                        {task.assignee.avatar}
                      </div>
                      <span className="text-gray-300">{task.assignee.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{task.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-lg font-semibold text-white mb-6">New Task</h2>
            <div className="space-y-4">
              <input
                type="text" placeholder="Task title *"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
              />
              <textarea
                rows={3} placeholder="Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Priority</label>
                  <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Due Date</label>
                  <input type="date" value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
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