export const MOCK_USERS = [
  { id: 1, name: "Alex Rivera", avatar: "AR", role: "Developer" },
  { id: 2, name: "Sarah Chen", avatar: "SC", role: "Designer" },
  { id: 3, name: "Marcus Smith", avatar: "MS", role: "Product Manager" },
  { id: 4, name: "Elena Vogt", avatar: "EV", role: "DevOps" },
];

export const INITIAL_TASKS = [
  { id: "1", title: "Implement ERP Auth Flow", description: "Set up multi-tenant workspace isolation for the ERP module.", status: "todo", priority: "high", assignee: MOCK_USERS[0], deadline: "2024-05-15" },
  { id: "2", title: "Design System Update", description: "Update the component library to include new ERP UI elements.", status: "in_progress", priority: "medium", assignee: MOCK_USERS[1], deadline: "2024-05-12" },
  { id: "3", title: "Analytics Dashboard UI", description: "Create the layout for the workspace analytics engine.", status: "todo", priority: "low", assignee: MOCK_USERS[2], deadline: "2024-05-20" },
  { id: "4", title: "Backend Schema Design", description: "Define models for Attendance, Holidays, and Daily Updates.", status: "done", priority: "high", assignee: MOCK_USERS[3], deadline: "2024-05-10" },
];
