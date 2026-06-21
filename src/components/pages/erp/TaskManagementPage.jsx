import React, { useState } from "react";
import TaskBoard from "./tasks/TaskBoard";
import TaskDetailModal from "./tasks/TaskDetailModal";
import { cn } from "../../../lib/utils";

const mockTasks = [
  {
    id: `unit-${crypto.randomUUID().slice(0, 8)}`,
    title: "Initialize Revenue System",
    description:
      "Set up backend logic and validation flow for revenue processing.",
    status: "In Progress",
    complexity: "Critical",
    priority: "High",
    deadline: "Next Week",
    basePoints: 60,
    assignee: "Pratyaksh",
    createdBy: "Founder-Alpha",
    hasProof: false,
  },
  {
    id: `unit-${crypto.randomUUID().slice(0, 8)}`,
    title: "Build UI Components",
    description: "Create reusable UI components for dashboard and task flow.",
    status: "Done",
    complexity: "Medium",
    priority: "Medium",
    deadline: "Today",
    basePoints: 15,
    assignee: "Alice",
    createdBy: "Founder-Alpha",
    hasProof: true,
    proofFiles: [{ name: "ui.png", type: "image/png" }],
  },
  {
    id: `unit-${crypto.randomUUID().slice(0, 8)}`,
    title: "Security Audit",
    description: "Verify authentication and role-based access control.",
    status: "To Do",
    complexity: "Large",
    priority: "High",
    deadline: "Yesterday",
    basePoints: 35,
    assignee: "Bob",
    createdBy: "Founder-Beta",
    hasProof: false,
  },
];

const TaskManagementPage = () => {
  const [tasks, setTasks] = useState(mockTasks);
  const [selectedTask, setSelectedTask] = useState(null);
  const [role, setRole] = useState("Admin");

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleTaskUpdate = (taskId, updates) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? typeof updates === "string"
            ? { ...t, status: updates }
            : { ...t, ...updates }
          : t,
      ),
    );
  };

  const handleNewUnit = () => {
    const newTask = {
      id: `unit-${crypto.randomUUID().slice(0, 8)}`,
      title: "New Objective",
      description: "Initialize system objective and assign parameters...",
      status: "To Do",
      complexity: "Small",
      priority: "Low",
      deadline: "Pending",
      basePoints: 10,
      assignee: "Unassigned",
      createdBy: role,
      hasProof: false,
    };

    setTasks((prev) => [newTask, ...prev]);
    handleTaskClick(newTask);
  };

  return (
    <div className="min-h-screen bg-[#0B101E] text-slate-100 font-sans selection:bg-blue-500/30">
      {/* Base App Background - Matches the deep navy of the screenshots */}
      <div className="max-w-[1600px] mx-auto px-8 py-10 space-y-8 min-h-screen flex flex-col transition-all duration-500">
        {/* Header Section */}
        <div className="flex items-center justify-between pb-6 border-b border-white/5">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-blue-500 tracking-tight">
              SFCollab ERP
            </h1>
            <div className="h-6 w-[1px] bg-white/10"></div>
            <h2 className="text-lg font-semibold text-white">
              Operational Board
            </h2>
          </div>

          <div className="flex items-center gap-5">
            {/* Clean Inset Toggle */}
            <div className="flex items-center bg-[#151B2B] border border-white/5 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setRole("Member")}
                className={cn(
                  "px-5 py-1.5 text-sm font-medium rounded-lg transition-all duration-200",
                  role === "Member"
                    ? "bg-[#0F1423] text-white shadow-md border border-white/5"
                    : "text-slate-400 hover:text-slate-200",
                )}
              >
                Member
              </button>

              <button
                onClick={() => setRole("Admin")}
                className={cn(
                  "px-5 py-1.5 text-sm font-medium rounded-lg transition-all duration-200",
                  role === "Admin"
                    ? "bg-[#0F1423] text-white shadow-md border border-white/5"
                    : "text-slate-400 hover:text-slate-200",
                )}
              >
                Admin
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handleNewUnit}
              className="px-5 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-b from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20 hover:from-blue-400 hover:to-blue-500 transition-all border border-blue-400/20"
            >
              + New Task
            </button>
          </div>
        </div>

        {/* Board Area */}
        <TaskBoard
          initialTasks={tasks}
          onTaskClick={handleTaskClick}
          onTaskUpdate={handleTaskUpdate}
          className="flex-1 mt-2"
        />

        {/* Modal */}
        {selectedTask && (
          <TaskDetailModal
            isOpen={!!selectedTask}
            onClose={() => setSelectedTask(null)}
            task={selectedTask}
            role={role}
            onUpdate={handleTaskUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default TaskManagementPage;
