import { tasksAPI } from "@/utils/APIs/startupsAPI";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
export default function TaskCard({ task, setActiveTasks, setTaskStats, itemVariants }) {

  const title = task.title || 'Task';
  const startup = task?.startup?.name || task.startupName || 'Unknown Startup';
  const description = task.description || 'No description';
  const progress = task.progress || 0;
  const dueDate = task.due_date || task.dueDate;
  const getStatusColor = (status) => {
      switch (status) {
        case 'in-progress':
          return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
        case 'review':
          return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
        case 'completed':
          return 'bg-green-500/20 border-green-500/30 text-green-300';

      }
    };
  const isOverdued = () => {
        const dueDate = new Date(task.due_date || task.dueDate);
        const now = new Date();
        return dueDate < now && task.status !== 'completed';
    }
    
    const getStatusIcon = (status) => {
      switch (status) {
        case 'in_progress':
          return <Clock className="w-4 h-4" />;
        case 'review':
          return <AlertCircle className="w-4 h-4" />;
        case 'completed':
          return <CheckCircle className="w-4 h-4" />;
      }
    };
  const statusIcon = getStatusIcon(task.status);
  const overdued = isOverdued();
  const handleCompleteTask = async (taskId) => {
      
      try {
        const response = await tasksAPI.completeTask(taskId);
        if (response.success) {
          // Update local state
          setActiveTasks((prevTasks) =>
            prevTasks.map((task) =>
              task.id === taskId ? { ...task, status: 'completed', progress: 100 } : task
            )
          );
          setTaskStats((prevStats) => ({
            ...prevStats,
            completedTasks: prevStats.completedTasks + 1,
          }))
          toast.success('Task marked as completed!');
        } else {
          toast.error('Failed to complete task');
        }
      } catch (err) {
        console.error('Failed to update progress:', err);
        toast.error('Failed to update progress');
      }
  };
  const snakeToText = (str) => {
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  return (
    <motion.div
      key={task.id}
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative my-2 border ${task.status === 'completed' ? 'border-green-500' : overdued ? 'border-red-500' : task.status === 'review' ? 'border-yellow-500'  : 'border-blue-500'} rounded-xl`}
    >
      <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
      <div className={`relative bg-linear-to-br from-white/10 to-white/5 border border-white/10 group-hover:border-blue-500/50 rounded-xl p-6 transition-all duration-300 backdrop-blur-sm ${overdued ? 'bg-red-500/10' : task.status === 'review' ? 'bg-yellow-500/10' : task.status === 'completed' ? 'bg-green-500/10' : ''}`}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className={`text-lg font-semibold transition-colors ${task.status === 'completed' ? 'text-green-300' : overdued ? 'text-red-400' : task.status === 'review' ? 'text-yellow-300'  : 'text-white'}`}>{title}</h3>
              <p className="text-sm text-gray-400">{startup}</p>
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">{description}</p>
            </div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap font-medium flex items-center gap-2 ${getStatusColor(task.status)}`}
            >
              {statusIcon}
              {
                overdued ? 'Overdue' :
                snakeToText(task.status)}
            </motion.div>
          </div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Progress</span>
              <motion.span
                className="text-sm font-semibold text-green-400"
                key={progress}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3 }}
              >
                {task.status === 'completed' ? '100' : progress}%
              </motion.span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden border border-white/5">
              <motion.div
                className="bg-linear-to-r from-blue-500 via-blue-400 to-cyan-400 h-2.5 rounded-full shadow-lg shadow-blue-500/50"
                initial={{ width: 0 }}
                animate={{ width: `${task.status === 'completed' ? '100' : progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </motion.div>

          {/* Footer */}
          {
            task.status !== 'completed' ? (
                        
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-sm text-gray-400">
                  Due: {dueDate ? new Date(dueDate).toLocaleDateString() : 'No due date'}
                </span>
                <motion.button
                  onClick={() => handleCompleteTask(task.id)}
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(59, 130, 246, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-lg bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-medium transition-all duration-200"
                >
                  Complete Task
                </motion.button>
              </div>)
              :
              <div className="flex items-center justify-end pt-4 border-t border-white/10">
                <div className="px-4 py-2 rounded-lg bg-green-600/30 text-green-300 text-sm font-medium">
                  Task Completed
                </div></div>}
        </div>
      </div>
    </motion.div>
  );
};
  