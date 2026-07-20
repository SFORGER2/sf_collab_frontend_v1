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
  { id: 'planned', name: 'Planned', color: '#6B7280', backendStatus: 'today' },
  { id: 'in-progress', name: 'In Progress', color: '#F59E0B', backendStatus: 'in_progress' },
  { id: 'done', name: 'Done', color: '#10B981', backendStatus: 'completed' },
  { id: 'overdue', name: 'Overdue', color: '#EF4444', backendStatus: 'overdue' },
];

const columns = [
  { id: 'planned', name: 'Planned', color: '#6B7280', backendStatus: 'today' },
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'from-rose-500/40 to-red-600/40';
      case 'medium':
        return 'from-amber-500/40 to-orange-600/40';
      case 'low':
        return 'from-emerald-500/40 to-green-600/40';
      default:
        return 'from-slate-500/40 to-slate-600/40';
    }
  };

  const getPriorityColorTwo = (priority) => {
    switch (priority) {
      case 'high':
        return 'rgba(181, 13, 139, 0.20)';
      case 'medium':
        return 'rgba(207, 137, 25, 0.20)';
      case 'low':
        return 'rgba(20, 181, 138, 0.20)';
      default:
        return 'rgba(100, 116, 139, 0.20)';
    }
  };

  // Kanban Card Component - as a function that takes feature as parameter
  const KanbanTaskCard = (feature) => (
    <KanbanCard
      column={feature.column}
      id={feature.id}
      key={feature.id}
      name={feature.name}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex flex-col gap-1 flex-1">
          <p className="m-0 flex-1 font-medium text-sm text-white">
            {feature.name}
          </p>
          <p className="m-0 text-slate-400 text-xs line-clamp-2">
            {feature.description}
          </p>
        </div>
        {feature.owner && (
          <Avatar className="h-6 w-6 shrink-0">
            <AvatarImage src={feature.owner.image} />
            <AvatarFallback className="text-xs">
              {feature.owner.firstName?.slice(0, 1)}{feature.owner.lastName?.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-2">
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
          feature.priority === 'high' ? 'bg-red-500/20 text-red-300' :
          feature.priority === 'medium' ? 'bg-amber-500/20 text-amber-300' :
          'bg-emerald-500/20 text-emerald-300'
        }`}>
          {feature.priority}
        </span>
        <p className="m-0 text-slate-400 text-xs">
          {shortDateFormatter.format(feature.endAt)}
        </p>
      </div>

      {feature.progress_percentage > 0 && (
        <div className="mt-2">
          <div className="w-full bg-slate-700 rounded-full h-1.5">
            <div 
              className="bg-blue-500 h-1.5 rounded-full" 
              style={{ width: `${feature.progress_percentage}%` }}
            />
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
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
    >
      <div className="flex items-center gap-3 w-full">
        <div
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: feature.status.color }}
        />
        
        <div className="flex-1 min-w-0">
          <p className="m-0 font-medium text-sm text-white truncate">
            {feature.name}
          </p>
          <p className="m-0 text-slate-400 text-xs truncate">
            {feature.description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            feature.priority === 'high' ? 'bg-red-500/20 text-red-300' :
            feature.priority === 'medium' ? 'bg-amber-500/20 text-amber-300' :
            'bg-emerald-500/20 text-emerald-300'
          }`}>
            {feature.priority}
          </span>

          {feature.owner && (
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarImage src={feature.owner.image} />
              <AvatarFallback className="text-xs">
                {feature.owner.firstName?.slice(0, 1)}{feature.owner.lastName?.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
          )}

          <span className="text-xs text-slate-400 w-16 text-right">
            {shortDateFormatter.format(feature.endAt)}
          </span>
        </div>
      </div>
    </ListItem>
  );

  return (
    <div className="overflow-hidden bg-transparent px-8 w-full">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-8 w-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <ShinyText 
                text="Tasks Board" 
                disabled={false} 
                speed={3} 
                className='custom-class text-2xl font-bold' 
              />
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2  rounded-lg p-1 border border-slate-700/50">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'kanban' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="text-slate-400 text-lg ml-14">Manage and track your project tasks</p>
        </div>

        {/* Kanban View */}
        {viewMode === 'kanban' && (
          <div className="w-full">
            <KanbanProvider
              className="w-full flex flex-wrap gap-6 items-center justify-center"
              columns={columns}
              data={filteredFeatures}
              onDataChange={setFeatures}
            >
              {(column) => (
                <KanbanBoard id={column.id} key={column.id} className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4 min-h-[500px] w-74">
                  <KanbanHeader>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: column.color }}
                      />
                      <span className="text-white font-semibold">{column.name}</span>
                      <span className="bg-slate-700/50 text-slate-300 text-xs px-2 py-1 rounded-full">
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
          <div className=" p-6">
            <ListProvider onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        <div className="text-sm text-slate-400 py-4 text-center bg-slate-800/20 rounded-lg border border-slate-700/30">
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