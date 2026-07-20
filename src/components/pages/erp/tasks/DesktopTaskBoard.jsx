import React, { useState } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, LayoutGrid, List, Filter, 
  MoreVertical, Calendar, User, CheckCircle2, 
  Clock, AlertCircle 
} from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { SectionHeader } from "../components/SectionHeader";
import { Modal } from "../components/Modal";
import { MOCK_USERS, INITIAL_TASKS } from "../data/taskMockData";

const TaskBoard = () => {
  const [view, setView] = useState("kanban"); // 'kanban' or 'list'
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Task Form State
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium", status: "todo" });

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { id: "todo", title: "To Do", icon: <Clock className="text-blue-400" size={18} /> },
    { id: "in_progress", title: "In Progress", icon: <AlertCircle className="text-yellow-400" size={18} /> },
    { id: "done", title: "Done", icon: <CheckCircle2 className="text-green-400" size={18} /> },
  ];

  const handleCreateTask = () => {
    if (!newTask.title) return;
    const task = {
      id: Date.now().toString(),
      ...newTask,
      assignee: MOCK_USERS[0], // Default assignee for simulation
      deadline: new Date().toISOString().split('T')[0]
    };
    setTasks([task, ...tasks]);
    setIsModalOpen(false);
    setNewTask({ title: "", description: "", priority: "medium", status: "todo" });
    toast.success("Task created successfully!");
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const TaskCard = ({ task }) => (
    <GlassCard className="p-4 mb-3 group relative">
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${
          task.priority === 'high' ? 'bg-red-500/10 text-red-400' : 
          task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-blue-500/10 text-blue-400'
        }`}>
          {task.priority}
        </span>
        <button className="text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <MoreVertical size={16} />
        </button>
      </div>
      <h4 className="text-sm font-semibold text-white mb-1 leading-tight">{task.title}</h4>
      <p className="text-[11px] text-zinc-400 mb-4 line-clamp-2 leading-relaxed">{task.description}</p>
      
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-[9px] font-bold text-white">
            {task.assignee.avatar}
          </div>
          <span className="text-[10px] font-bold text-zinc-500">{task.assignee.name}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-600">
          <Calendar size={12} />
          {task.deadline}
        </div>
      </div>
    </GlassCard>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 p-6 lg:p-8 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Task Management</h1>
          <p className="text-zinc-500 text-xs font-bold mt-1 uppercase tracking-widest">Track and organize workspace tasks</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-zinc-900/50 rounded-xl p-1 border border-white/5">
            <button 
              onClick={() => setView("kanban")}
              className={`p-2 rounded-lg transition-all ${view === 'kanban' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setView("list")}
              className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <List size={16} />
            </button>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
          >
            <Plus size={16} />
            New Task
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-3 bg-zinc-900/50 border border-white/5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors">
            <Filter size={14} />
            Filter
          </button>
          <button className="px-4 py-3 bg-zinc-900/50 border border-white/5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors">
            Sort: Priority
          </button>
        </div>
      </div>

      {/* View Selection */}
      <AnimatePresence mode="wait">
        {view === "kanban" ? (
          <motion.div key="kanban" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map(column => {
              const columnTasks = filteredTasks.filter(t => t.status === column.id);
              return (
                <div key={column.id} className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-2">
                      {column.icon}
                      <h3 className="font-bold text-sm text-white">{column.title}</h3>
                      <span className="bg-white/5 text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/5">
                        {columnTasks.length}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 rounded-2xl p-2 min-h-[400px]">
                    {columnTasks.length > 0 ? (
                      <AnimatePresence>
                        {columnTasks.map(task => (
                          <motion.div key={task.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                            <TaskCard task={task} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    ) : (
                      <div className="h-full border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-center p-6 bg-white/[0.01]">
                        <p className="text-xs font-bold text-zinc-600 mb-1">No Tasks</p>
                        <p className="text-[10px] text-zinc-700">Drag tasks here or create a new one.</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <GlassCard className="overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Task Name</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Priority</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Assignee</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Deadline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTasks.map(task => (
                    <tr key={task.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 font-semibold text-white text-xs">{task.title}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest ${
                          task.status === 'done' ? 'bg-green-500/10 text-green-400' :
                          task.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] uppercase font-bold tracking-widest ${
                          task.priority === 'high' ? 'text-red-400' : 
                          task.priority === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-[9px] font-bold text-white">
                            {task.assignee.avatar}
                          </div>
                          <span className="text-zinc-400 text-xs font-bold">{task.assignee.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 text-xs font-bold">{task.deadline}</td>
                    </tr>
                  ))}
                  {filteredTasks.length === 0 && (
                     <tr>
                       <td colSpan="5" className="px-6 py-12 text-center text-zinc-500 text-xs font-bold">No tasks found matching your search.</td>
                     </tr>
                  )}
                </tbody>
              </table>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Task">
        <div className="space-y-4">
          <div className="space-y-2">
             <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
               Task Title <span className="text-red-500">*</span>
             </label>
             <input 
               type="text" 
               value={newTask.title}
               onChange={(e) => setNewTask({...newTask, title: e.target.value})}
               placeholder="E.g., Update Auth Engine" 
               className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-indigo-500 outline-none" 
             />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Description</label>
             <textarea 
               value={newTask.description}
               onChange={(e) => setNewTask({...newTask, description: e.target.value})}
               placeholder="Add context and details..." 
               className="w-full h-24 bg-zinc-900 border border-white/10 rounded-xl p-4 text-sm text-white resize-none focus:border-indigo-500 outline-none" 
             />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Priority</label>
               <select 
                 value={newTask.priority}
                 onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                 className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-indigo-500 outline-none appearance-none cursor-pointer"
               >
                 <option value="low">Low</option>
                 <option value="medium">Medium</option>
                 <option value="high">High</option>
               </select>
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</label>
               <select 
                 value={newTask.status}
                 onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                 className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-indigo-500 outline-none appearance-none cursor-pointer"
               >
                 <option value="todo">To Do</option>
                 <option value="in_progress">In Progress</option>
                 <option value="done">Done</option>
               </select>
             </div>
          </div>
          <button 
            onClick={handleCreateTask}
            disabled={!newTask.title}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-sm mt-4 disabled:opacity-50 hover:bg-indigo-500 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            Create Task
          </button>
        </div>
      </Modal>

    </div>
  );
};

export default TaskBoard;
