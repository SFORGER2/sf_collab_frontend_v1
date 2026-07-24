import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { CheckCircle, Clock, AlertCircle, Search, Zap, TrendingUp, Award, List, Grid3x3 } from 'lucide-react';
import { motion } from 'framer-motion';
import usePaginatedFetch from '@/utils/hooks/usePaginated';
import InfiniteList from '@/components/InfiniteList';
import { tasksAPI } from '@/utils/APIs/startupsAPI';
import { toast } from 'react-toastify';
import TaskCard from './TaskCard';

const MyWork = () => {
  const { user, access_token } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState(localStorage.getItem('builder:my-work:viewMode') || 'list');
  const [taskStats, setTaskStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    completionRate: 0
  });
  const [filterStatus, setFilterStatus] = useState({ id: 'all', filterFn: () => true });
  
  const statuses = [{
    id: 'all',
    filterFn: () => true
  }, {
    id: 'in_progress',
    filterFn: (task) => task.status === 'in_progress' || task.status === 'in-progress'
  }, {
    id: 'overdue',
    filterFn: (task) => {
      const dueDate = new Date(task.due_date || task.dueDate);
      const now = new Date();
      return dueDate < now && task.status !== 'completed';
    }
  }, {
    id: 'review',
    filterFn: (task) => task.status === 'review'
  }, {
    id: 'completed',
    filterFn: (task) => task.status === 'completed'
  }];

  useEffect(() => {
    async function fetchTaskStats() {
      try {
        const response = await tasksAPI.getTasksStats({ user_id: user?.id });
        if (!response.success) throw new Error('Failed to fetch task stats');
        setTaskStats(response.data.stats);
      } catch (error) {
        console.error('Error fetching task stats:', error);
        toast.error('Error fetching task stats');
      }
    }
    fetchTaskStats();
  }, [user?.id]);

  const {
    items: activeTasks,
    setItems: setActiveTasks,
    loading,
    targetRef: tasksRef,
  } = usePaginatedFetch({
    fetchFn: ({ page, search }) =>
      tasksAPI.getAll({
        page,
        search,
        user_id: user?.id,
      }),
    search: searchQuery,
    objectKey: 'tasks',
    enabled: !!access_token,
  });

  const handleViewChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('builder:my-work:viewMode', mode);
  };

  const filteredTasks = useMemo(() => {
    if (filterStatus.id === 'all') return activeTasks;
    return activeTasks.filter(filterStatus.filterFn);
  }, [activeTasks, filterStatus]);

  const kpis = useMemo(() => [
    {
      label: 'Tasks Completed',
      value: taskStats.completedTasks,
      change: `${taskStats.completionRate}% completion rate`,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'In Progress',
      value: taskStats.inProgressTasks,
      change: `${taskStats.totalTasks - taskStats.completedTasks - taskStats.inProgressTasks} pending`,
      icon: Clock,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Overdue Tasks',
      value: taskStats.overdueTasks,
      change: taskStats.overdueTasks > 0 ? '⚠️ Needs attention' : '✓ All on track',
      icon: AlertCircle,
      color: taskStats.overdueTasks > 0 ? 'from-red-600 to-red-500' : 'from-green-500 to-emerald-500',
      isAlert: taskStats.overdueTasks > 0
    },
    {
      label: 'Total Tasks',
      value: taskStats.totalTasks,
      change: `${taskStats.completionRate}% done`,
      icon: Award,
      color: 'from-purple-500 to-pink-500'
    }
  ], [taskStats]);

  const filterTasks = (status) => {
    setFilterStatus(status);
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

  const snakeToText = (str) => {
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="min-h-screen bg-black text-white px-2 md:px-4 lg:pl-6 py-8">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        <div className="absolute top-1/4 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full mx-auto space-y-8 max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                My Work
              </h1>
              <p className="text-gray-400 text-lg mt-2">Track your active tasks and deliverables</p>
            </div>
          </div>
        </motion.div>

        {/* KPIs */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {kpis.map((kpi, index) => {
            const IconComponent = kpi.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group relative overflow-hidden rounded-2xl"
                animate={kpi.isAlert ? { boxShadow: ["0 0 20px rgba(220, 38, 38, 0)", "0 0 20px rgba(220, 38, 38, 0.5)", "0 0 20px rgba(220, 38, 38, 0)"] } : {}}
                transition={kpi.isAlert ? { duration: 2, repeat: Infinity } : {}}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${kpi.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative bg-slate-900/90 backdrop-blur border border-white/10 group-hover:border-white/20 rounded-2xl p-6 space-y-3 transition-all">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">+12%</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">{kpi.label}</p>
                    <p className="text-3xl font-bold text-white mt-2">{kpi.value}</p>
                    <p className="text-xs text-green-400 font-medium mt-2">{kpi.change}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 z-10" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-white/20"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <motion.button
                key={status.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => filterTasks(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus.id === status.id
                    ? 'bg-blue-600 text-white border border-blue-400 shadow-lg shadow-blue-500/20'
                    : 'bg-white/5 border border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                {snakeToText(status.id)}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Tasks Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold text-white">Tasks</h2>
              <motion.span
                className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium border border-blue-500/30"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {filteredTasks.length}
              </motion.span>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
              <button
                onClick={() => handleViewChange('list')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleViewChange('grid')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                title="Grid View"
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-300 backdrop-blur mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {loading && activeTasks.length === 0 ? (
            <div className="flex justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-12 w-12 border-3 border-blue-500/20 border-t-blue-500"
              />
            </div>
          ) : filteredTasks.length === 0 ? (
            <motion.div
              className="text-center py-20 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl backdrop-blur"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-500/20 rounded-full">
                  <CheckCircle className="w-12 h-12 text-blue-400" />
                </div>
              </div>
              <p className="text-gray-300 text-lg font-semibold">No tasks found</p>
              <p className="text-gray-500 text-sm mt-2">Great job! Keep up the momentum</p>
            </motion.div>
          ) : (
            <motion.div
              className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <InfiniteList
                items={filteredTasks}
                containerClassName='contents'
                renderItem={(task) => <TaskCard key={task.id} task={task} itemVariants={itemVariants} setActiveTasks={setActiveTasks} setTaskStats={setTaskStats} />}
                sentinelRef={tasksRef}
                loading={loading}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MyWork;
