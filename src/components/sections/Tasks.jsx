import React, { useRef, useState, useEffect, useMemo } from "react";
import { ChevronRight, MoreVertical, CheckCircle2, Clock, Calendar, Users, Grid, List } from "lucide-react";
import ShinyText from "../ui/ShinyText";
import SpotlightCard from "../ui/SpotlightCard";
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from '../ui/shadcn-io/kanban';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { faker } from '@faker-js/faker';
import {
  ListGroup,
  ListHeader,
  ListItem,
  ListItems,
  ListProvider,
} from '../ui/shadcn-io/list';

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// Status mapping between frontend and backend
const statusMapping = {
  'today': 'Planned',
  'in_progress': 'In Progress',
  'completed': 'Done',
  'overdue': 'Overdue'
};

const reverseStatusMapping = {
  'Planned': 'today',
  'In Progress': 'in_progress',
  'Done': 'completed',
  'Overdue': 'overdue'
};

const statuses = [
  { id: 'planned', name: 'Planned', color: '#71717A', backendStatus: 'today' },
  { id: 'in-progress', name: 'In Progress', color: '#F59E0B', backendStatus: 'in_progress' },
  { id: 'done', name: 'Done', color: '#10B981', backendStatus: 'completed' },
  { id: 'overdue', name: 'Overdue', color: '#EF4444', backendStatus: 'overdue' },
];

const columns = [
  { id: 'planned', name: 'Planned', color: '#71717A', backendStatus: 'today' },
  { id: 'in-progress', name: 'In Progress', color: '#F59E0B', backendStatus: 'in_progress' },
  { id: 'done', name: 'Done', color: '#10B981', backendStatus: 'completed' },
  { id: 'overdue', name: 'Overdue', color: '#EF4444', backendStatus: 'overdue' },
];

const users = Array.from({ length: 4 })
  .fill(null)
  .map(() => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    image: faker.image.avatar(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  }));

// Convert mock tasks to match backend Task model structure
const convertTasksToFeatures = (tasks) => {
  return tasks.map(task => ({
    id: task.id.toString(),
    name: task.title,
    description: task.description,
    startAt: new Date(),
    endAt: task.due_date ? new Date(task.due_date) : faker.date.future({ years: 0.5, refDate: new Date() }),
    column: columns.find(col => col.backendStatus === task.status)?.id || columns[0].id,
    status: statuses.find(status => status.backendStatus === task.status) || statuses[0],
    priority: task.priority,
    owner: users.find(user => user?.id === task.assigned_to?.toString()) || faker.helpers.arrayElement(users),
    progress_percentage: task.progress_percentage || 0,
    tags: task.tags || [],
    labels: task.labels || [],
    estimated_hours: task.estimated_hours,
    actual_hours: task.actual_hours,
    is_on_time: task.is_on_time,
    created_at: task.created_at,
    updated_at: task.updated_at,
  }));
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

const priorityBadgeClass = (priority) => {
  switch (priority) {
    case 'high':
      return 'border border-red-500/20 bg-red-500/10 text-red-400';
    case 'medium':
      return 'border border-amber-500/20 bg-amber-500/10 text-amber-400';
    default:
      return 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400';
  }
};

export default function Tasks({ searchQuery = "" }) {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const scrollRef = useRef(null);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollWidth, clientWidth } = scrollRef.current;
      setShowScrollIndicator(scrollWidth > clientWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  // Mock tasks data that matches the backend Task model
  const mockTasks = [
    {
      id: 1,
      title: "User Research",
      description: "Conduct a user research by conducting online survey and draft out questionnaires.",
      status: "in_progress",
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      priority: "high",
      progress_percentage: 50,
      assigned_to: 1,
      created_by: 1,
      tags: ["research", "user-feedback"],
      labels: [{ name: "UX", color: "#8B5CF6" }],
      estimated_hours: 8,
      actual_hours: 4,
      is_on_time: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      title: "Design System",
      description: "Conduct a user research by conducting online survey and draft out questionnaires.",
      status: "today",
      due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      priority: "medium",
      progress_percentage: 0,
      assigned_to: 2,
      created_by: 1,
      tags: ["design", "system"],
      labels: [{ name: "UI", color: "#06B6D4" }],
      estimated_hours: 16,
      actual_hours: 0,
      is_on_time: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 3,
      title: "Real Estate Landing Page",
      description: "Assist to leverage on our efforts in making the user research possible and ensure the design solution for the real estate project.",
      status: "completed",
      due_date: new Date("2024-04-31"),
      completed_date: new Date("2024-04-30"),
      priority: "low",
      progress_percentage: 100,
      assigned_to: 3,
      created_by: 1,
      tags: ["frontend", "landing-page"],
      labels: [{ name: "Development", color: "#10B981" }],
      estimated_hours: 24,
      actual_hours: 20,
      is_on_time: true,
      created_at: new Date("2024-04-01"),
      updated_at: new Date("2024-04-30"),
    },
    {
      id: 4,
      title: "Mobile App Redesign",
      description: "Complete redesign of the mobile application interface with new branding guidelines.",
      status: "completed",
      due_date: new Date("2024-04-31"),
      completed_date: new Date("2024-04-28"),
      priority: "high",
      progress_percentage: 100,
      assigned_to: 4,
      created_by: 1,
      tags: ["mobile", "redesign"],
      labels: [{ name: "Branding", color: "#F59E0B" }],
      estimated_hours: 40,
      actual_hours: 35,
      is_on_time: true,
      created_at: new Date("2024-03-15"),
      updated_at: new Date("2024-04-28"),
    },
    {
      id: 5,
      title: "API Integration",
      description: "Connect frontend with backend APIs and implement error handling",
      status: "in_progress",
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      priority: "high",
      progress_percentage: 75,
      assigned_to: 1,
      created_by: 2,
      tags: ["backend", "api"],
      labels: [{ name: "Technical", color: "#EF4444" }],
      estimated_hours: 12,
      actual_hours: 9,
      is_on_time: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 6,
      title: "Documentation",
      description: "Write comprehensive documentation for the new features",
      status: "overdue",
      due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      priority: "medium",
      progress_percentage: 30,
      assigned_to: 2,
      created_by: 1,
      tags: ["documentation"],
      labels: [{ name: "Docs", color: "#6B7280" }],
      estimated_hours: 6,
      actual_hours: 2,
      is_on_time: false,
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updated_at: new Date(),
    },
  ];

  const [features, setFeatures] = useState(convertTasksToFeatures(mockTasks));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) {
      return;
    }

    // Find the target status/column
    const targetColumn = columns.find((col) => col.id === over.id);

    if (!targetColumn) {
      return;
    }

    // Update the feature with new column
    setFeatures(
      features.map((feature) => {
        if (feature.id === active.id) {
          const newStatus = statuses.find(status => status.backendStatus === targetColumn.backendStatus) || statuses[0];
          return {
            ...feature,
            status: newStatus,
            column: targetColumn.id
          };
        }
        return feature;
      })
    );

    // Here you would typically make an API call to update the task status in the backend
    // updateTaskStatus(active.id, targetColumn.backendStatus);
  };

  const filterList = (list, q) =>
    list.filter((t) => {
      const title = t.name?.toLowerCase() || "";
      const description = t.description?.toLowerCase() || "";
      const status = t.status?.name?.toLowerCase() || "";
      return title.includes(q) || description.includes(q) || status.includes(q);
    });

  const filteredFeatures = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return features;
    }
    return filterList(features, q);
  }, [searchQuery, features]);

  // Kanban Card Component - as a function that takes feature as parameter
  const KanbanTaskCard = (feature) => (
    <KanbanCard
      column={feature.column}
      id={feature.id}
      key={feature.id}
      name={feature.name}
      className="border border-zinc-800 bg-zinc-900/80 hover:border-zinc-700"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <p className="m-0 flex-1 text-sm font-medium text-zinc-100">
            {feature.name}
          </p>
          <p className="m-0 line-clamp-2 text-xs text-zinc-400">
            {feature.description}
          </p>
        </div>
        {feature.owner && (
          <Avatar className="h-6 w-6 shrink-0">
            <AvatarImage src={feature.owner.image} />
            <AvatarFallback className="bg-indigo-600 text-xs text-white">
              {feature.owner.firstName?.slice(0, 1)}{feature.owner.lastName?.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${priorityBadgeClass(feature.priority)}`}>
          {feature.priority}
        </span>
        <p className="m-0 text-xs text-zinc-500">
          {shortDateFormatter.format(feature.endAt)}
        </p>
      </div>

      {feature.progress_percentage > 0 && (
        <div className="mt-2">
          <div className="h-1.5 w-full rounded-full bg-zinc-800">
            <div
              className="h-1.5 rounded-full bg-indigo-500"
              style={{ width: `${feature.progress_percentage}%` }}
            />
          </div>
          <span className="mt-1 block text-xs text-zinc-500">
            {feature.progress_percentage}% complete
          </span>
        </div>
      )}
    </KanbanCard>
  );

  // List Item Component
  const ListTaskItem = ({ feature, index, parent }) => (
    <ListItem
      id={feature.id}
      index={index}
      key={feature.id}
      name={feature.name}
      parent={parent}
      className="border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
    >
      <div className="flex w-full items-center gap-3">
        <div
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: feature.status.color }}
        />

        <div className="min-w-0 flex-1">
          <p className="m-0 truncate text-sm font-medium text-zinc-100">
            {feature.name}
          </p>
          <p className="m-0 truncate text-xs text-zinc-500">
            {feature.description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${priorityBadgeClass(feature.priority)}`}>
            {feature.priority}
          </span>

          {feature.owner && (
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarImage src={feature.owner.image} />
              <AvatarFallback className="bg-indigo-600 text-xs text-white">
                {feature.owner.firstName?.slice(0, 1)}{feature.owner.lastName?.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
          )}

          <span className="w-16 text-right text-xs text-zinc-500">
            {shortDateFormatter.format(feature.endAt)}
          </span>
        </div>
      </div>
    </ListItem>
  );

  return (
    <div className="w-full overflow-hidden bg-transparent px-8">
      <div className="mx-auto w-full">
        {/* Header */}
        <div className="mb-8 w-full">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
                <CheckCircle2 className="h-5 w-5 text-indigo-400" />
              </div>
              <ShinyText
                text="Tasks Board"
                disabled={false}
                speed={3}
                className='custom-class text-2xl font-bold'
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`rounded-md p-2 transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-md p-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="ml-14 text-sm text-zinc-400">Manage and track your project tasks</p>
        </div>

        {/* Kanban View */}
        {viewMode === 'kanban' && (
          <div className="w-full">
            <KanbanProvider
              className="flex w-full flex-wrap items-center justify-center gap-6"
              columns={columns}
              data={filteredFeatures}
              onDataChange={setFeatures}
            >
              {(column) => (
                <KanbanBoard id={column.id} key={column.id} className="w-74 min-h-[500px] rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                  <KanbanHeader>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: column.color }}
                      />
                      <span className="font-semibold text-zinc-100">{column.name}</span>
                      <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-400">
                        {filteredFeatures.filter(feature => feature.column === column.id)?.length}
                      </span>
                    </div>
                  </KanbanHeader>
                  <KanbanCards id={column.id} className="mt-4 space-y-3">
                    {KanbanTaskCard}
                  </KanbanCards>
                </KanbanBoard>
              )}
            </KanbanProvider>
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="p-6">
            <ListProvider onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statuses.map((status) => (
                  <ListGroup id={status.name} key={status.name} className="min-h-[400px]">
                    <ListHeader
                      color={status.color}
                      name={status.name}
                      count={filteredFeatures.filter(f => f.status.name === status.name).length}
                    />
                    <ListItems className="mt-4 space-y-2">
                      {filteredFeatures
                        .filter((feature) => feature.status.name === status.name)
                        .map((feature, index) => (
                          <ListTaskItem
                            key={feature.id}
                            feature={feature}
                            index={index}
                            parent={feature.status.name}
                          />
                        ))}
                      {filteredFeatures.filter(f => f.status.name === status.name).length === 0 && (
                        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 py-4 text-center text-sm text-zinc-500">
                          No tasks
                        </div>
                      )}
                    </ListItems>
                  </ListGroup>
                ))}
              </div>
            </ListProvider>
          </div>
        )}

        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </div>
  );
}
