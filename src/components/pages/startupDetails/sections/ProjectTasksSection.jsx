import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, Clock, AlertCircle, Plus, Trash2, Settings, Eye, EyeOff, List, Grid3x3, ListPlus } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import AddTaskModal from "../modals/AddTasksModal";
import { tasksAPI } from "@/utils/APIs/startupsAPI";
import { API_URL } from "@/utils/config";

const priorityColors = {
  low: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  high: "bg-red-500/20 text-red-400 border border-red-500/30",
  urgent: "bg-red-600/20 text-red-500 border border-red-600/30",
};

const statusIcons = {
  today: <Clock className="w-4 h-4 text-blue-400" />,
  in_progress: <AlertCircle className="w-4 h-4 text-yellow-400" />,
  completed: <CheckCircle className="w-4 h-4 text-green-400" />,
  overdue: <AlertCircle className="w-4 h-4 text-red-400" />,

};

const visibilityIcons = {
  public: <Eye className="w-4 h-4" />,
  team: <Eye className="w-4 h-4" />,
  private: <EyeOff className="w-4 h-4" />,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function ProjectTasksSection({ tasks, isAdmin, setTasks, startupId, teamMembers }) {
  const [openCreate, setOpenCreate] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [view, setView] = useState(localStorage.getItem("tasksView") || "list");
  const { user } = useSelector((state) => state.auth);

  const filteredTasks = useMemo(() => filterStatus === "all" ? tasks : tasks.filter(t => t.status === filterStatus), [filterStatus, tasks]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setTasks(prevTasks =>
        prevTasks.map(t => t?.id === taskId ? { ...t, status: newStatus } : t)
      );
      const response = await tasksAPI.update(taskId, { status: newStatus });
      if (!response.success) {
        throw new Error("Failed to update task status");
      }
      toast.success("Task status updated");
    } catch (err) {
      toast.error("Error updating task status");
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setTasks(prevTasks => prevTasks.filter(t => t?.id !== taskId));
      await tasksAPI.delete(taskId);
      toast.success("Task deleted successfully");
    } catch (err) {
      toast.error("Error deleting task");
      console.error(err);
    }
  };

  const isVisible = (task) => {
    if (isAdmin) return true;
    if (task.visible_by === 'all' || task.visible_by === 'public') {
      return true;
    }
    if (task.visible_by === 'team') {
      return teamMembers.some(member => member?.id === user?.id);
    }
    if (task.visible_by === 'private') {
      return task.assigned_user && task.assigned_user?.id === user?.id || task.created_by.id === user?.id;
    }
    return false;
  };

  const handleViewChange = (newView) => {
    setView(newView);
    localStorage.setItem("tasksView", newView);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between flex-wrap gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Tasks
          </h2>
          <p className="text-gray-400 text-sm mt-1">{filteredTasks.length} tasks</p>
        </div>

        <div className="flex items-center gap-2">
          {/* View switch */}
          <div className="flex rounded-lg bg-gray-800 border border-gray-700 overflow-hidden">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                variant={view === "list" ? "default" : "ghost"}
                onClick={() => handleViewChange("list")}
                className={view === "list" ? "bg-gradient-to-r from-blue-600 to-cyan-600 border-0" : "border-gray-600 hover:border-gray-500"}
              >
                <List className="w-4 h-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                variant={view === "grid" ? "default" : "ghost"}
                onClick={() => handleViewChange("grid")}
                className={view === "grid" ? "bg-gradient-to-r from-blue-600 to-cyan-600 border-0" : "border-gray-600 hover:border-gray-500"}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>

          {isAdmin && (
            <Button
              onClick={() => setOpenCreate(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-blue-500/50 transition-all"
            >
              <ListPlus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          )}
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        className="flex gap-2 flex-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {["all", "today", "in_progress", "completed", "overdue"].map((status) => (
          <motion.div key={status} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className={`transition-all ${
                filterStatus === status
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 border-0 shadow-lg shadow-blue-500/50"
                  : "border-gray-600 hover:border-gray-500 text-black"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
            </Button>
          </motion.div>
        ))}
      </motion.div>

      {/* Views */}
      {view === "list" && (
        <TaskListView
          filteredTasks={filteredTasks}
          isAdmin={isAdmin}
          isVisible={isVisible}
          user={user}
          handleStatusChange={handleStatusChange}
          handleDeleteTask={handleDeleteTask}
          setEditMode={setEditMode}
          setSelectedTask={setSelectedTask}
          setOpenCreate={setOpenCreate}
        />
      )}

      {view === "grid" && (
        <TaskGridView
          filteredTasks={filteredTasks}
          isAdmin={isAdmin}
          isVisible={isVisible}
          user={user}
          handleStatusChange={handleStatusChange}
          handleDeleteTask={handleDeleteTask}
          setEditMode={setEditMode}
          setSelectedTask={setSelectedTask}
          setOpenCreate={setOpenCreate}
        />
      )}

      <AddTaskModal
        isOpen={openCreate}
        onClose={() => {
          setOpenCreate(false);
          setEditMode(false);
          setSelectedTask(null);
        }}
        editMode={editMode}
        task={editMode ? selectedTask : null}
        startupId={startupId}
        setTasks={setTasks}
        teamMembers={teamMembers}
      />
    </div>
  );
}

const TaskCard = ({ task, isAdmin, isVisible, user, handleStatusChange, handleDeleteTask, setEditMode, setSelectedTask, setOpenCreate }) => (
  <Card
    className={`bg-gradient-to-br from-gray-800 to-gray-900 border transition-all hover:shadow-lg hover:shadow-blue-500/10 ${
      task.status === "completed"
        ? "border-green-500/50 hover:border-green-500/70"
        : task.is_overdue
        ? "border-red-500/50 hover:border-red-500/70"
        : task.urgent
        ? "border-red-600/50 hover:border-red-600/70"
        : "border-gray-700 hover:border-gray-600"
    }`}
  >
    
    <CardHeader>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {statusIcons[task.status]}{task.urgent && <AlertCircle className="w-4 h-4 text-red-500" />}
            </motion.div>
            <CardTitle
              className={`text-white transition-all ${
                task.status === "completed" ? "line-through text-gray-500" : ""
              }`}
            >
              {task.title}
            </CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            {task.description}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Badge className={`${priorityColors[task.urgent ? 'urgent' : task.priority]} font-semibold`}>
            {
              !task?.urgent ?
                `${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority` :
                'URGENT'
            }
          </Badge>
          <Badge
            variant="outline"
            className="text-xs text-white border-gray-600"
          >
            {visibilityIcons[task.visible_by]} {task.visible_by.charAt(0).toUpperCase() + task.visible_by.slice(1)}
          </Badge>
        </div>
      </div>
    </CardHeader>

    <CardContent className="space-y-5">
      {/* Progress Bar */}
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Progress</span>
          <motion.span
            className="text-cyan-400 font-bold"
            key={task.progress_percentage}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
          >
            {task.progress_percentage}%
          </motion.span>
        </div>
        <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${task.progress_percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Task Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        {[
          {
            label: "Due Date",
            value: task.due_date
              ? new Date(task.due_date).toLocaleDateString()
              : "No due date",
            highlight: task.is_overdue,
          },
          {
            label: "Assigned To",
            value:
              task?.assigned_to === user?.id ?
              "You" :
              task.assigned_user
              ? `${task.assigned_user.firstName} ${task.assigned_user.lastName}`
              : "Unassigned",
          },
          {
            label: "Estimated Hours",
            value: task.estimated_hours || "-",
          },
        ].map((detail, idx) => (
          <motion.div
            key={idx}
            className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/30"
            whileHover={{ borderColor: "rgba(59, 130, 246, 0.5)" }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-gray-400 text-xs font-semibold">{detail.label}</span>
            <p
              className={`text-white mt-1 font-medium ${
                detail.highlight ? "text-red-400" : ""
              }`}
            >
              {detail.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Tags and Labels */}
      {(task.tags?.length > 0 || task.labels?.length > 0) && (
        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {task.tags?.map((tag, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Badge variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            </motion.div>
          ))}
          {task.labels?.map((label, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Badge
                className="text-xs"
                style={{ backgroundColor: label.color || "#6B7280" }}
              >
                {label.name}
              </Badge>
            </motion.div>
          ))}
        </motion.div>
      )}
    </CardContent>

    {isVisible(task) && (
      <CardFooter className="flex items-center justify-between pt-4 border-t border-gray-700/50">
        <motion.div className="flex gap-2" whileHover={{ scale: 1.02 }}>
          {task?.status !== "completed" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange(task?.id, "completed")}
              className="border-green-600/50 bg-green-500 text-white hover:bg-white hover:text-green-500 hover:border-green-500 transition-all"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Complete
            </Button>
          )}
        </motion.div>

        {isAdmin && (
          <motion.div className="flex gap-2" whileHover={{ scale: 1.02 }}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditMode(true);
                setSelectedTask(task);
                setOpenCreate(true);
              }}
              className="border-gray-600 bg-gray-700 text-white hover:border-blue-500 hover:text-blue-400 transition-all"
            >
              <Settings className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeleteTask(task?.id)}
              className="border-red-600/50 bg-red-600 text-white hover:bg-white hover:text-red-500 hover:border-red-500 transition-all"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </motion.div>
        )}
      </CardFooter>
    )}
  </Card>
);

const TaskListView = (props) => {
  const { filteredTasks } = props;

  if (filteredTasks.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-12 text-center"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <Clock className="w-12 h-12 text-gray-600 mb-3" />
        <p className="text-gray-400 text-lg font-medium">No tasks found</p>
        <p className="text-gray-500 text-sm mt-1">Create your first task to get started</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {filteredTasks.map((task) => (
        <motion.div key={task?.id} variants={itemVariants}>
          <TaskCard {...props} task={task} />
        </motion.div>
      ))}
    </motion.div>
  );
};

const TaskGridView = (props) => {
  const { filteredTasks } = props;

  if (filteredTasks.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-12 text-center"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <Clock className="w-12 h-12 text-gray-600 mb-3" />
        <p className="text-gray-400 text-lg font-medium">No tasks found</p>
        <p className="text-gray-500 text-sm mt-1">Create your first task to get started</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {filteredTasks.map((task) => (
        <motion.div key={task?.id} variants={itemVariants}>
          <TaskCard {...props} task={task} />
        </motion.div>
      ))}
    </motion.div>
  );
};