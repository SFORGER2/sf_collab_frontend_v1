import React, { useState } from "react";
import { 
  Plus, Search, LayoutGrid, List, Filter, 
  MoreVertical, Calendar, User, CheckCircle2, 
  Clock, AlertCircle 
} from "lucide-react";

// Mock data for workspace users
const MOCK_USERS = [
  { id: 1, name: "Alex Rivera", avatar: "AR", role: "Developer" },
  { id: 2, name: "Sarah Chen", avatar: "SC", role: "Designer" },
  { id: 3, name: "Marcus Smith", avatar: "MS", role: "Product Manager" },
  { id: 4, name: "Elena Vogt", avatar: "EV", role: "DevOps" },
];

// Mock data for tasks
const INITIAL_TASKS = [
  { id: "1", title: "Implement ERP Auth Flow", description: "Set up multi-tenant workspace isolation for the ERP module.", status: "todo", priority: "high", assignee: MOCK_USERS[0], deadline: "2024-05-15" },
  { id: "2", title: "Design System Update", description: "Update the component library to include new ERP UI elements.", status: "in_progress", priority: "medium", assignee: MOCK_USERS[1], deadline: "2024-05-12" },
  { id: "3", title: "Analytics Dashboard UI", description: "Create the layout for the workspace analytics engine.", status: "todo", priority: "low", assignee: MOCK_USERS[2], deadline: "2024-05-20" },
  { id: "4", title: "Backend Schema Design", description: "Define models for Attendance, Holidays, and Daily Updates.", status: "done", priority: "high", assignee: MOCK_USERS[3], deadline: "2024-05-10" },
];

const TaskBoard = () => {
  const [view, setView] = useState("kanban"); // 'kanban' or 'list'
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { id: "todo", title: "To Do", icon: <Clock className="text-blue-400" size={18} /> },
    { id: "in_progress", title: "In Progress", icon: <AlertCircle className="text-yellow-400" size={18} /> },
    { id: "done", title: "Done", icon: <CheckCircle2 className="text-green-400" size={18} /> },
  ];

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

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
      {view === "kanban" ? (
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
    </div>
  );
};

export default TaskBoard;
