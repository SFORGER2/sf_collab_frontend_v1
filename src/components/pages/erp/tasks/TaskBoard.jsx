import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";

import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { Terminal } from "lucide-react";
import TaskCard from "./TaskCard";
import { cn } from "../../../../lib/utils";

/* =========================
   Sortable Task
   ========================= */
const SortableTask = ({ task, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "transition-opacity duration-200",
        isDragging && "opacity-30",
      )}
    >
      <TaskCard task={task} onClick={() => onClick(task)} />
    </div>
  );
};

/* =========================
   Column
   ========================= */
const KanbanColumn = ({ id, title, tasks, onTaskClick }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col w-[320px] min-w-[320px] h-[calc(100vh-220px)]"
    >
      {/* Column Header */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            {title}
          </h3>
        </div>

        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#151B2B] border border-white/5 text-slate-400 animate-in zoom-in duration-300">
          {tasks.length.toString().padStart(2, "0")}
        </span>
      </div>

      {/* Tasks */}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar pb-10 pt-1">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTask key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-white/10 rounded-xl bg-[#0F1423]/50 animate-in fade-in duration-500">
            <Terminal className="w-5 h-5 text-slate-600 mb-3" />
            <p className="text-sm font-medium text-slate-500 text-center leading-relaxed">
              No tasks in queue
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================
   Main Board
   ========================= */
const TaskBoard = ({
  initialTasks = [],
  onTaskUpdate,
  onTaskClick,
  className,
}) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const columns = {
    todo: {
      title: "Queue / Pending",
      tasks: tasks.filter((t) => t.status === "To Do"),
    },
    inprogress: {
      title: "Active Execution",
      tasks: tasks.filter((t) => t.status === "In Progress"),
    },
    done: {
      title: "Verification",
      tasks: tasks.filter((t) =>
        ["Done", "Approved", "Rejected"].includes(t.status),
      ),
    },
  };

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    let newStatus = activeTask.status;

    if (["todo", "inprogress", "done"].includes(over.id)) {
      if (over.id === "todo") newStatus = "To Do";
      if (over.id === "inprogress") newStatus = "In Progress";
      if (over.id === "done") newStatus = "Done";
    } else {
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) newStatus = overTask.status;
    }

    if (newStatus === activeTask.status) return;

    const updatedTasks = tasks.map((task) =>
      task.id === active.id ? { ...task, status: newStatus } : task,
    );
    setTasks(updatedTasks);
    if (onTaskUpdate) onTaskUpdate(active.id, newStatus);
  };

  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      <div className="flex items-center justify-between px-6 py-5 mb-6 bg-[#151B2B] border border-white/5 rounded-xl shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-white tracking-wide">
            Task Operations
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Drag items to organize and update execution status
          </p>
        </div>
        <div className="text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          {tasks.length.toString().padStart(2, "0")} Active Units
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar">
        <div className="flex gap-6 min-w-max pb-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {Object.entries(columns).map(([id, col]) => (
              <KanbanColumn
                key={id}
                id={id}
                title={col.title}
                tasks={col.tasks}
                onTaskClick={onTaskClick}
              />
            ))}
            <DragOverlay dropAnimation={{ duration: 200 }}>
              {activeId ? (
                <div className="rotate-2 scale-105 pointer-events-none shadow-2xl opacity-90 transition-transform">
                  <TaskCard task={tasks.find((t) => t.id === activeId)} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
};

export default TaskBoard;
