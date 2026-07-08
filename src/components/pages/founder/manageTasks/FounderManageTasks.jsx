import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { tasksAPI, startupsAPI } from '@/utils/APIs/startupsAPI';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

import AddTaskModal from '@/components/pages/startupDetails/modals/AddTasksModal';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Award,
  Search,
  List,
  Grid3x3,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  Building2,
} from 'lucide-react';
import DeleteConfirmationModal from '@/utils/confirm';
import { toast } from 'react-toastify';

const FounderManageTasks = () => {
  const { user, access_token } = useSelector((state) => state.auth);
  const [startups, setStartups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState(localStorage.getItem('founder:tasks:viewMode') || 'list');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedStartupId, setSelectedStartupId] = useState(null);
  const [expandedStartup, setExpandedStartup] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskStats, setTaskStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
  });

  const statuses = [
    { id: 'all', label: 'All Tasks', filterFn: () => true },
    { id: 'in_progress', label: 'In Progress', filterFn: (task) => task.status === 'in_progress' },
    { id: 'overdue', label: 'Overdue', filterFn: (task) => task.is_overdue },
    // FIX: real task status values are 'todo' / 'done' (see app/models/erp_task.py) —
    // this previously checked 'completed' / 'to_do', which never matched any
    // real task, so these two tabs always showed an empty list.
    { id: 'completed', label: 'Completed', filterFn: (task) => task.status === 'done' },
    { id: 'to_do', label: 'To Do', filterFn: (task) => task.status === 'todo' },
  ];

  // Fetch startups with their tasks
  useEffect(() => {
    fetchStartupsWithTasks();
  }, [access_token, user]);

  const fetchStartupsWithTasks = async () => {
    setLoading(true);
    try {
      const response = await startupsAPI.getAll({my_startups: true, per_page: 100}, access_token);
      const startupsData = response.data.startups || [];

      // Fetch tasks for each startup
      const startupsWithTasks = await Promise.all(
        startupsData.map(async (startup) => {
          try {
            const tasksResponse = await tasksAPI.getAll({
              startup_id: startup.id,
              per_page: 100,
            }, access_token);
            return {
              ...startup,
              tasks: tasksResponse.data?.tasks || [],
            };
          } catch (err) {
            console.error(`Failed to fetch tasks for startup ${startup.id}`, err);
            return { ...startup, tasks: [] };
          }
        })
      );

      setStartups(startupsWithTasks);
      if (startupsWithTasks.length > 0) {
        setExpandedStartup(startupsWithTasks[0].id);
      }
    } catch (err) {
      setError('Failed to load startups');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  // Handle task completion toggle
  const handleCompleteTask = async (taskId, currentStatus) => {
    try {
      // FIX: 'completed' / 'to_do' aren't real status values (see statuses
      // list above) — using them here meant "un-complete" silently failed
      // validation server-side. Real values are 'done' / 'todo'.
      if (currentStatus === 'done') {
        await tasksAPI.update(taskId, { status: 'todo' });
      } else {
        await tasksAPI.completeTask(taskId);
      }
      await fetchStartupsWithTasks();
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
    }
  };

  // Handle task edit
  const handleEditTask = (task, startupId) => {
    setEditingTask(task);
    setSelectedStartupId(startupId);
    setIsAddTaskOpen(true);
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {

      try {
        await tasksAPI.delete(taskId);
        await fetchStartupsWithTasks();
      } catch (err) {
        setError('Failed to delete task');
        console.error(err);
      }
  };

  // Handle task form submission
  const handleTaskSubmit = async (taskData) => {
    console.log("Task data:", taskData);
    try {
      if (editingTask) {
        await tasksAPI.update(editingTask.id, taskData);
      } else {
        await tasksAPI.create(taskData);
      }
      await fetchStartupsWithTasks();
      setIsAddTaskOpen(false);
      setEditingTask(null);
    } catch (err) {
      setError('Failed to save task');
      console.error(err);
    }
  };
  // Calculate stats from all tasks
  useEffect(() => {
    const allTasks = startups.flatMap(s => s.tasks);
    const completed = allTasks.filter((t) => t.status === 'done').length;
    const inProgress = allTasks.filter((t) => t.status === 'in_progress' || t.status === 'in-progress').length;
    const overdue = allTasks.filter((t) => t.is_overdue).length;
    const total = allTasks.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    setTaskStats({
      totalTasks: total,
      completedTasks: completed,
      inProgressTasks: inProgress,
      overdueTasks: overdue,
      completionRate: rate,
    });
  }, [startups]);

  useEffect(() => {
    localStorage.setItem('founder:tasks:viewMode', viewMode);
  }, [viewMode]);

  // Filter tasks within each startup
  const getFilteredTasksForStartup = (tasks) => {
    const statusFilter = statuses.find((s) => s.id === filterStatus) || statuses[0];
    return tasks
      .filter(statusFilter.filterFn)
      .filter(task => task.title.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const snakeToText = (str) => {
    return str
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (loading && startups.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
          className="rounded-full h-12 w-12 border-3 border-blue-500/20 border-t-blue-500"
        />
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-black text-white px-2 md:px-4 py-8">
      <div className="w-full mx-auto space-y-8 w-full">
        
        {/* Header */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold bg-linear-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Manage Tasks
              </h1>
              <p className="text-gray-400 text-lg mt-2">
                Track and manage all your startup tasks
              </p>
            </div>
          </div>
        </motion.div>

        {/* KPI Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-slate-900/90 backdrop-blur border border-white/10 group-hover:border-green-500/50 rounded-2xl p-6 space-y-3 transition-all">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Tasks Completed</p>
                <p className="text-3xl font-bold text-white mt-2">{taskStats.completedTasks}</p>
                <p className="text-xs text-gray-400 mt-1">{taskStats.completionRate}% completion rate</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-slate-900/90 backdrop-blur border border-white/10 group-hover:border-blue-500/50 rounded-2xl p-6 space-y-3 transition-all">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">In Progress</p>
                <p className="text-3xl font-bold text-white mt-2">{taskStats.inProgressTasks}</p>
                <p className="text-xs text-gray-400 mt-1">Active tasks</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`group relative overflow-hidden rounded-2xl`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${taskStats.overdueTasks > 0 ? 'from-red-500 to-red-600' : 'from-green-500 to-emerald-500'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <div className={`relative bg-slate-900/90 backdrop-blur border border-white/10 ${taskStats.overdueTasks > 0 ? 'group-hover:border-red-500/50' : 'group-hover:border-green-500/50'} rounded-2xl p-6 space-y-3 transition-all`}>
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${taskStats.overdueTasks > 0 ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                  <AlertCircle className={`w-5 h-5 ${taskStats.overdueTasks > 0 ? 'text-red-400' : 'text-green-400'}`} />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Overdue Tasks</p>
                <p className="text-3xl font-bold text-white mt-2">{taskStats.overdueTasks}</p>
                <p className="text-xs text-gray-400 mt-1">{taskStats.overdueTasks > 0 ? '⚠️ Needs attention' : '✓ All on track'}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-slate-900/90 backdrop-blur border border-white/10 group-hover:border-purple-500/50 rounded-2xl p-6 space-y-3 transition-all">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Award className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Total Tasks</p>
                <p className="text-3xl font-bold text-white mt-2">{taskStats.totalTasks}</p>
                <p className="text-xs text-gray-400 mt-1">{taskStats.completionRate}% done</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 z-10" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-white/20"
            />
          </div>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              ✕ Clear Search
            </button>
          )}

          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <motion.button
                key={status.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterStatus(status.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === status.id
                    ? 'bg-blue-600 text-white border border-blue-400 shadow-lg shadow-blue-500/20'
                    : 'bg-white/5 border border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                {status.label}
              </motion.button>
            ))}
          </div>

          <div className="flex gap-2 md:justify-end">
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-300 backdrop-blur"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Startups with Tasks */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {startups.length === 0 ? (
            <motion.div
              className="text-center py-20 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl backdrop-blur"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-500/20 rounded-full">
                  <Building2 className="w-12 h-12 text-blue-400" />
                </div>
              </div>
              <p className="text-gray-300 text-lg font-semibold">No startups found</p>
              <p className="text-gray-500 text-sm mt-2">Create a startup to manage tasks</p>
            </motion.div>
          ) : (
            startups.map((startup, startupIndex) => {
              const filteredTasks = getFilteredTasksForStartup(startup.tasks);
              const startupTaskStats = {
                total: startup.tasks.length,
                completed: startup.tasks.filter(t => t.status === 'done').length,
                inProgress: startup.tasks.filter(t => t.status === 'in_progress' || t.status === 'in-progress').length,
                overdue: startup.tasks.filter(t => t.is_overdue).length,
              };

              return (
                <motion.div
                  key={startup.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: startupIndex * 0.05 }}
                  className="group relative overflow-hidden rounded-xl bg-slate-900/50 border border-white/10 hover:border-blue-500/30 transition-all backdrop-blur"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/5 group-hover:to-transparent transition-all duration-300" />
                  
                  {/* Startup Header */}
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                    onClick={() =>
                      setExpandedStartup(
                        expandedStartup === startup.id ? null : startup.id
                      )
                    }
                    className="relative w-full px-6 py-4 flex items-center justify-between hover:bg-blue-500/10 transition"
                  >
                    <div className="flex items-center gap-4 flex-1 text-left">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                          {startup.name}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {startup.tasks.length} task{startup.tasks.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <motion.div
                      animate={{
                        rotate: expandedStartup === startup.id ? 180 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  </motion.button>

                  {/* Tasks List */}
                  <motion.div
                    initial={false}
                    animate={{
                      height: expandedStartup === startup.id ? 'auto' : 0,
                      opacity: expandedStartup === startup.id ? 1 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-white/10"
                  >
                    <div className="relative p-6 space-y-4">
                      {filteredTasks.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">
                          {startup.tasks.length === 0 ? 'No tasks in this startup' : 'No tasks match your filters'}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {filteredTasks.map((task, taskIndex) => (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: taskIndex * 0.05 }}
                              whileHover={{
                                y: -2,
                                borderColor: 'rgba(59, 130, 246, 0.5)',
                              }}
                              className="flex flex-col p-4 rounded-lg bg-slate-800/50 border border-white/5 hover:border-blue-500/30 transition-all space-y-3"
                            >
                              <div>
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <p className="font-semibold text-white truncate">{task.title}</p>
                                  <Badge className={`whitespace-nowrap flex-shrink-0 border ${
                                    task.priority === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' : ''
                                  } ${
                                    task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : ''
                                  } ${
                                    task.priority === 'low' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : ''
                                  }`}>
                                    {snakeToText(task.priority)}
                                  </Badge>
                                </div>
                                {task.description && (
                                  <p className="text-sm text-gray-400 line-clamp-2">{task.description}</p>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Badge className={`text-xs border ${
                                  task.status === 'done' ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''
                                } ${
                                  task.status === 'in_progress' || task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : ''
                                } ${
                                  task.is_overdue ? 'bg-red-500/20 text-red-400 border-red-500/30' : ''
                                } ${
                                  task.status === 'todo' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : ''
                                }`}>
                                  {task.is_overdue ? 'OVERDUE' : snakeToText(task.status)}
                                </Badge>
                                {task.tags?.map((tag, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>

                              {task.due_date && (
                                <p className="text-xs text-gray-400">
                                  Due: {new Date(task.due_date).toLocaleDateString()}
                                </p>
                              )}

                              <div className="flex gap-2 pt-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleCompleteTask(task.id, task.status)}
                                  className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-1 ${
                                    task.status === 'done'
                                      ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                                  }`}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  {task.status === 'done' ? 'Incomplete' : 'Complete'}
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleEditTask(task, startup.id)}
                                  className="px-3 py-2 rounded-lg bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:border-gray-500 hover:text-white transition-all"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setShowDeleteConfirm(task?.id)}
                                  className="px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* Add Task Button */}
                      {expandedStartup === startup.id && (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={() => {
                            setSelectedStartupId(startup.id);
                            setEditingTask(null);
                            setIsAddTaskOpen(true);
                          }}
                          className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium flex items-center justify-center gap-2 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          Add Task to {startup.name}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>

      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => {
          setIsAddTaskOpen(false);
          setEditingTask(null);
          setSelectedStartupId(null);
        }}
        editMode={!!editingTask}
        task={editingTask}
        setTasks={() => {}}
        startupId={selectedStartupId}
        onSubmit={handleTaskSubmit}
      />
      </div>
      <DeleteConfirmationModal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          handleDeleteTask(showDeleteConfirm);
          setShowDeleteConfirm(false);
          toast.success('Task deleted successfully');
        }}
        type="soft"
      />
      </>
  );
};

export default FounderManageTasks;