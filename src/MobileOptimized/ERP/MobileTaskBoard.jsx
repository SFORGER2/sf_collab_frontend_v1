import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, LayoutGrid, List, Filter, 
  MoreVertical, Calendar, User, CheckCircle2, 
  Clock, AlertCircle 
} from "lucide-react";
import { GlassCard } from "@/components/pages/erp/components/GlassCard";

const MobileTaskBoard = ({ 
  tasks, 
  searchQuery, 
  setSearchQuery, 
  setIsModalOpen, 
  handleStatusChange 
}) => {
  const [activeTab, setActiveTab] = useState("todo");

  const columns = [
    { id: "todo", title: "To Do", icon: <Clock className="text-blue-400" size={16} /> },
    { id: "in_progress", title: "Active", icon: <AlertCircle className="text-yellow-400" size={16} /> },
    { id: "done", title: "Done", icon: <CheckCircle2 className="text-green-400" size={16} /> },
  ];

  const columnTasks = tasks.filter(t => t.status === activeTab);

  const TaskCard = ({ task }) => (
    <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl mb-3">
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[8px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full ${
          task.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
          task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
        }`}>
          {task.priority}
        </span>
        <button className="text-zinc-600">
          <MoreVertical size={14} />
        </button>
      </div>
      <h4 className="text-sm font-bold text-white mb-1">{task.title}</h4>
      <p className="text-[11px] text-zinc-500 mb-4 line-clamp-2 leading-relaxed">{task.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-[9px] font-bold text-white shadow-lg shadow-indigo-500/20">
            {task.assignee?.avatar || 'U'}
          </div>
          <span className="text-[10px] font-bold text-zinc-400">{task.assignee?.name || 'User'}</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-black text-zinc-600 uppercase tracking-tighter">
          <Calendar size={12} />
          {task.deadline}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-4 pb-24 h-full">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tasks</h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">Workspace Pipeline</p>
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20"
        >
          <Plus size={20} />
        </motion.button>
      </header>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
        <input 
          type="text" 
          placeholder="Search tasks..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder-zinc-700"
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-white/5">
        {columns.map(col => (
          <button
            key={col.id}
            onClick={() => setActiveTab(col.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all relative ${
              activeTab === col.id ? "text-white" : "text-zinc-600"
            }`}
          >
            {activeTab === col.id && (
              <motion.div 
                layoutId="activeTab" 
                className="absolute inset-0 bg-white/5 rounded-xl border border-white/10" 
                transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
              {col.icon}
              {col.title}
            </span>
          </button>
        ))}
      </div>

      {/* Task List Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.2 }}
          >
            {columnTasks.length > 0 ? (
              columnTasks.map(task => <TaskCard key={task.id} task={task} />)
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center px-10">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5">
                  <Filter className="text-zinc-700" size={20} />
                </div>
                <p className="text-sm font-bold text-zinc-600 uppercase tracking-widest">No Tasks Found</p>
                <p className="text-[10px] text-zinc-700 mt-2">Try adjusting your filters or create a new entry.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MobileTaskBoard;
