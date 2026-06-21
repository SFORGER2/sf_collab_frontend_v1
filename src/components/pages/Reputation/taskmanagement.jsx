import React, { useState } from "react";

// --- MOCK DATA & HELPERS ---
const mockUsers = [
  { id: "u1", name: "Alex Chen" },
  { id: "u2", name: "Sarah Jenkins" },
  { id: "u3", name: "Marcus Johnson" },
  { id: "u4", name: "Priya Patel (Admin)" },
];

const getUserById = (id) => mockUsers.find((user) => user.id === id);

const mockTasks = [
  {
    id: "task-1",
    title: "Implement OAuth Authentication",
    description: "Set up Google and GitHub login providers using NextAuth.",
    status: "in_progress",
    priority: "high",
    complexity: "large",
    assignedTo: "u1",
    assignedToName: "Alex Chen",
    deadline: new Date(new Date().setDate(new Date().getDate() + 3)),
    proofRequired: true,
    proofStatus: "none",
    basePoints: 35,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "task-2",
    title: "Update Dashboard UI",
    description:
      "Refactor the main dashboard to use the new Tailwind color palette.",
    status: "planned",
    priority: "medium",
    complexity: "medium",
    assignedTo: "u2",
    assignedToName: "Sarah Jenkins",
    deadline: new Date(new Date().setDate(new Date().getDate() + 7)),
    proofRequired: false,
    proofStatus: "none",
    basePoints: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "task-3",
    title: "Fix Navigation Bug on Mobile",
    description:
      "The hamburger menu is unresponsive on iOS Safari. Needs immediate patch.",
    status: "completed",
    priority: "high",
    complexity: "small",
    assignedTo: "u3",
    assignedToName: "Marcus Johnson",
    deadline: new Date(),
    proofRequired: true,
    proofStatus: "pending",
    basePoints: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
// ----------------------------

export default function TaskManagementUI() {
  const [tasks, setTasks] = useState(mockTasks);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // Form state for new task
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    complexity: "medium",
    priority: "medium",
    assignedTo: "u2",
    deadline: "",
    proofRequired: false,
  });

  // Approval state
  const [approvalData, setApprovalData] = useState({
    notes: "",
    rejecting: false,
  });

  const handleCreateTask = () => {
    if (!formData.title || !formData.deadline) {
      alert("Please fill in all required fields");
      return;
    }

    const newTask = {
      id: `task-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      status: "planned",
      priority: formData.priority,
      complexity: formData.complexity,
      assignedTo: formData.assignedTo,
      assignedToName: getUserById(formData.assignedTo)?.name || "Unknown",
      deadline: new Date(formData.deadline),
      proofRequired: formData.proofRequired,
      proofStatus: "none",
      basePoints: getBasePoints(formData.complexity),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTasks([...tasks, newTask]);
    setShowModal(false);
    resetForm();
  };

  const getBasePoints = (complexity) => {
    const points = {
      small: 5,
      medium: 15,
      large: 35,
      critical: 60,
    };
    return points[complexity];
  };

  const handleApproveTask = (taskId) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: "reviewed",
              proofStatus: "approved",
              approvalNotes: approvalData.notes,
              approvedBy: "u4",
              updatedAt: new Date(),
            }
          : t,
      ),
    );
    closeDetail();
  };

  const handleRejectTask = (taskId) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: "rejected",
              proofStatus: "rejected",
              approvalNotes: approvalData.notes,
              approvedBy: "u4",
              updatedAt: new Date(),
            }
          : t,
      ),
    );
    closeDetail();
  };

  const handleAssignTask = (taskId, userId) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              assignedTo: userId,
              assignedToName: getUserById(userId)?.name || "Unknown",
              updatedAt: new Date(),
            }
          : t,
      ),
    );
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      complexity: "medium",
      priority: "medium",
      assignedTo: "u2",
      deadline: "",
      proofRequired: false,
    });
    setApprovalData({ notes: "", rejecting: false });
  };

  const closeDetail = () => {
    setSelectedTask(null);
    resetForm();
  };

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus !== "all" && task.status !== filterStatus) return false;
    if (filterPriority !== "all" && task.priority !== filterPriority)
      return false;
    return true;
  });

  // Status badge styling
  const getStatusBadge = (status) => {
    const colors = {
      planned: "bg-slate-500/10 border-slate-500/20 text-slate-400",
      in_progress: "bg-blue-500/10 border-blue-500/20 text-blue-400",
      blocked: "bg-red-500/10 border-red-500/20 text-red-400",
      completed: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      reviewed: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      rejected: "bg-red-500/10 border-red-500/20 text-red-400",
      archived: "bg-slate-500/10 border-slate-500/20 text-slate-400",
    };
    return colors[status] || colors.planned;
  };

  return (
    <div className="min-h-screen bg-[#0B101E] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-lg font-semibold text-white tracking-wide">
              Task Management
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Create, assign, and approve tasks with proof tracking
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="h-11 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-500/20 border border-blue-400/20 px-4 transition-all flex items-center gap-2"
          >
            New Task
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#0F1423] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="blocked">Blocked</option>
              <option value="completed">Completed</option>
              <option value="reviewed">Reviewed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Priority
            </label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-[#0F1423] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="ml-auto text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center">
            {filteredTasks.length} Task{filteredTasks.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Task Cards */}
        <div className="grid gap-4 mb-8">
          {filteredTasks.length === 0 ? (
            <div className="bg-[#0F1423]/50 border border-white/5 rounded-lg p-12 text-center">
              <p className="text-slate-400">No tasks match your filters</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="bg-[#151B2B] border border-white/5 rounded-xl p-5 shadow-sm transition-all hover:border-white/10 hover:shadow-md cursor-pointer"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-sm font-medium text-white">
                        {task.title}
                      </h3>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${getStatusBadge(task.status)}`}
                      >
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">
                      {task.description}
                    </p>
                    <div className="flex flex-wrap gap-3 text-[10px]">
                      <div>
                        <span className="font-bold uppercase tracking-widest text-slate-500">
                          Assigned To
                        </span>
                        <p className="text-slate-300 mt-1">
                          {task.assignedToName}
                        </p>
                      </div>
                      <div>
                        <span className="font-bold uppercase tracking-widest text-slate-500">
                          Complexity
                        </span>
                        <p className="text-slate-300 mt-1 capitalize">
                          {task.complexity}
                        </p>
                      </div>
                      <div>
                        <span className="font-bold uppercase tracking-widest text-slate-500">
                          Base Points
                        </span>
                        <p className="text-slate-300 mt-1 text-lg font-bold">
                          {task.basePoints}
                        </p>
                      </div>
                      <div>
                        <span className="font-bold uppercase tracking-widest text-slate-500">
                          Deadline
                        </span>
                        <p className="text-slate-300 mt-1">
                          {task.deadline.toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="font-bold uppercase tracking-widest text-slate-500">
                          Proof
                        </span>
                        <p className="text-slate-300 mt-1">
                          {task.proofRequired ? "Required" : "Not Required"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {task.priority === "high" && (
                      <div className="inline-block px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-bold text-red-400 uppercase tracking-widest">
                        High Priority
                      </div>
                    )}
                    {task.priority === "medium" && (
                      <div className="inline-block px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                        Med Priority
                      </div>
                    )}
                    {task.priority === "low" && (
                      <div className="inline-block px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                        Low Priority
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#151B2B] border border-white/10 rounded-xl p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white tracking-wide">
                Create New Task
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter task title"
                  className="w-full bg-[#0F1423] border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors mt-2"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter task description"
                  className="w-full bg-[#0F1423] border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors mt-2 h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Complexity
                  </label>
                  <select
                    value={formData.complexity}
                    onChange={(e) =>
                      setFormData({ ...formData, complexity: e.target.value })
                    }
                    className="w-full bg-[#0F1423] border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors mt-2"
                  >
                    <option value="small">Small (5 pts)</option>
                    <option value="medium">Medium (15 pts)</option>
                    <option value="large">Large (35 pts)</option>
                    <option value="critical">Critical (60 pts)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full bg-[#0F1423] border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors mt-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Assign To
                  </label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedTo: e.target.value })
                    }
                    className="w-full bg-[#0F1423] border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors mt-2"
                  >
                    {mockUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    className="w-full bg-[#0F1423] border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors mt-2"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#0F1423]/50 border border-white/5 rounded-lg p-4">
                <input
                  type="checkbox"
                  id="proofRequired"
                  checked={formData.proofRequired}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      proofRequired: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded border-white/10 accent-blue-500"
                />
                <label
                  htmlFor="proofRequired"
                  className="text-sm text-slate-300 cursor-pointer"
                >
                  Proof Required - This task must have approval proof attached
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 h-11 bg-transparent border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  className="px-4 h-11 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-500/20 border border-blue-400/20 transition-all"
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail View */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#151B2B] border border-white/10 rounded-xl p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white tracking-wide">
                {selectedTask.title}
              </h2>
              <button
                onClick={closeDetail}
                className="text-slate-400 hover:text-white text-xl font-bold leading-none"
              >
                ✕
              </button>
            </div>

            {/* Task Details */}
            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-white/5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Status
                </p>
                <p className="text-white mt-2 capitalize">
                  {selectedTask.status.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Priority
                </p>
                <p className="text-white mt-2 capitalize">
                  {selectedTask.priority}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Complexity
                </p>
                <p className="text-white mt-2 capitalize">
                  {selectedTask.complexity}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Base Points
                </p>
                <p className="text-2xl font-bold text-white mt-2 tracking-tight">
                  {selectedTask.basePoints}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Deadline
                </p>
                <p className="text-white mt-2">
                  {selectedTask.deadline.toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Assigned To
                </p>
                <p className="text-white mt-2">{selectedTask.assignedToName}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6 pb-6 border-b border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Description
              </p>
              <p className="text-slate-300 mt-2">{selectedTask.description}</p>
            </div>

            {/* Reassign */}
            <div className="mb-6 pb-6 border-b border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                Reassign Task
              </p>
              <select
                defaultValue={selectedTask.assignedTo}
                onChange={(e) =>
                  handleAssignTask(selectedTask.id, e.target.value)
                }
                className="w-full bg-[#0F1423] border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              >
                {mockUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Approval Section */}
            {(selectedTask.status === "completed" ||
              selectedTask.status === "in_progress") && (
              <div className="mb-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                  Approve or Reject
                </p>
                <textarea
                  value={approvalData.notes}
                  onChange={(e) =>
                    setApprovalData({ ...approvalData, notes: e.target.value })
                  }
                  placeholder="Add approval or rejection notes..."
                  className="w-full bg-[#0F1423] border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors mb-4 h-20"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApproveTask(selectedTask.id)}
                    className="flex-1 h-11 bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-emerald-500/20 border border-emerald-400/20 transition-all flex items-center justify-center gap-2"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectTask(selectedTask.id)}
                    className="flex-1 h-11 bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}

            {/* Approval Status */}
            {selectedTask.approvalNotes && (
              <div className="bg-[#0F1423]/50 border border-white/5 rounded-lg p-4 mb-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Approval Notes
                </p>
                <p className="text-slate-300 mt-2">
                  {selectedTask.approvalNotes}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={closeDetail}
                className="px-4 h-11 bg-transparent border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
