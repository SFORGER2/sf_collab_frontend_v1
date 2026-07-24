import React from "react";
import { CheckCircle2, Zap, Users, AlertCircle, TrendingUp } from "lucide-react";

// ── SHARED CORE DATA ────────────────────────────────────────────────────────

export const MOCK_USERS = [
  { id: 1, name: "Alex Rivera", avatar: "AR", role: "Developer", email: "alex@sfcollab.com", status: "Active", joined: "2024-01-15" },
  { id: 2, name: "Sarah Chen", avatar: "SC", role: "Designer", email: "sarah@sfcollab.com", status: "Active", joined: "2024-02-10" },
  { id: 3, name: "Marcus Smith", avatar: "MS", role: "Product Manager", email: "marcus@sfcollab.com", status: "Pending", joined: "2024-05-01" },
  { id: 4, name: "Elena Vogt", avatar: "EV", role: "DevOps", email: "elena@sfcollab.com", status: "Active", joined: "2023-11-20" },
  { id: 5, name: "David Kim", avatar: "DK", role: "Frontend", email: "david@sfcollab.com", status: "Active", joined: "2024-03-05" },
];

export const WORKSPACES = [
  { id: "ws_1", name: "SFCollab Main", score: 8.4, status: "Healthy" },
  { id: "ws_2", name: "Stealth Project B", score: 6.2, status: "Warning" },
  { id: "ws_3", name: "VibeCheck AI", score: 9.1, status: "Hyper-Growth" },
];

// ── EXECUTION & ANALYTICS ───────────────────────────────────────────────────

export const INITIAL_EXECUTION_SCORE = {
  overall: 8.4,
  breakdown: [
    { label: "Milestone Completion", value: 9.0, weight: 35, color: "#6366f1", detail: "Based on 12/14 milestones met." },
    { label: "Activity Consistency", value: 8.0, weight: 20, color: "#10b981", detail: "98% daily update log rate." },
    { label: "Project Momentum", value: 8.5, weight: 20, color: "#f59e0b", detail: "2.4x velocity increase this month." },
    { label: "Team Strength", value: 7.5, weight: 15, color: "#ec4899", detail: "4/5 core roles activated." },
    { label: "External Validation", value: 7.0, weight: 10, color: "#06b6d4", detail: "3 peer reviews pending." },
  ]
};

export const INITIAL_KPI_DATA = {
  day: [
    { label: "Tasks Completed", value: "8", trend: "+2", icon: <CheckCircle2 className="text-emerald-400" size={18} /> },
    { label: "Completion Rate", value: "92%", trend: "+5%", icon: <Zap className="text-blue-400" size={18} /> },
    { label: "Active Contributors", value: "12", trend: "+1", icon: <Users className="text-purple-400" size={18} /> },
    { label: "Open Warnings", value: "0", trend: "-1", icon: <AlertCircle className="text-emerald-400" size={18} /> },
    { label: "Est. Revenue Pool", value: "$4,200", trend: "+12%", icon: <TrendingUp className="text-indigo-400" size={18} /> },
    { label: "Est. Payouts", value: "$3,800", trend: "+8%", icon: <Zap className="text-amber-400" size={18} /> },
  ],
  week: [
    { label: "Tasks Completed", value: "124", trend: "+12%", icon: <CheckCircle2 className="text-emerald-400" size={18} /> },
    { label: "Completion Rate", value: "88%", trend: "+2%", icon: <Zap className="text-blue-400" size={18} /> },
    { label: "Active Contributors", value: "18", trend: "+2", icon: <Users className="text-purple-400" size={18} /> },
    { label: "Open Warnings", value: "3", trend: "-1", icon: <AlertCircle className="text-amber-400" size={18} /> },
    { label: "Est. Revenue Pool", value: "$28,500", trend: "+15%", icon: <TrendingUp className="text-indigo-400" size={18} /> },
    { label: "Est. Payouts", value: "$24,200", trend: "+10%", icon: <Zap className="text-amber-400" size={18} /> },
  ],
  month: [
    { label: "Tasks Completed", value: "482", trend: "+24%", icon: <CheckCircle2 className="text-emerald-400" size={18} /> },
    { label: "Completion Rate", value: "84%", trend: "-3%", icon: <Zap className="text-blue-400" size={18} /> },
    { label: "Active Contributors", value: "24", trend: "+4", icon: <Users className="text-purple-400" size={18} /> },
    { label: "Open Warnings", value: "12", trend: "+3", icon: <AlertCircle className="text-red-400" size={18} /> },
    { label: "Est. Revenue Pool", value: "$112,000", trend: "+20%", icon: <TrendingUp className="text-indigo-400" size={18} /> },
    { label: "Est. Payouts", value: "$98,400", trend: "+18%", icon: <Zap className="text-amber-400" size={18} /> },
  ]
};

export const INITIAL_BURN_RATE = {
  monthly: "$12,400",
  efficiency: "94%",
  runway: "14 months",
  status: "Optimized"
};

export const INITIAL_WARNINGS = [
  { id: 1, title: "Critical Milestone Overdue", target: "Beta Launch", severity: "high", days: 2 },
  { id: 2, title: "Inactivity Detected", target: "Team Growth", severity: "medium", days: 5 },
  { id: 3, title: "Proof Missing", target: "Legal Docs", severity: "low", days: 1 },
  { id: 4, title: "Budget Burn Spiking", target: "Marketing", severity: "high", days: 1 },
  { id: 5, title: "Validation Ratio Low", target: "Frontend", severity: "medium", days: 3 },
  { id: 6, title: "API Limit Reached", target: "External Services", severity: "high", days: 1 },
  { id: 7, title: "Unassigned Tasks", target: "Backlog", severity: "low", days: 14 }
];

export const INITIAL_ACTIVITY = [
  { id: 1, user: "Alex Rivera", action: "approved milestone", target: "Auth Engine", time: "Just now", type: "milestone", status: "VALIDATED" },
  { id: 2, user: "Sarah Chen", action: "uploaded proof", target: "UI Kit v2", time: "15m ago", type: "proof", status: "PENDING AUDIT" },
  { id: 3, user: "Elena Vogt", action: "resolved warning", target: "API Latency", time: "1h ago", type: "warning", status: "VALIDATED" },
  { id: 4, user: "Marcus Smith", action: "created task", target: "User Interviews", time: "3h ago", type: "task", status: "STALE" },
];

export const INITIAL_LEADERBOARD = [
  { id: 1, name: "Alex Rivera", points: 2450, avatar: "AR", impact: "High", role: "Backend", tasks: 45 },
  { id: 2, name: "Sarah Chen", points: 2120, avatar: "SC", impact: "High", role: "Design", tasks: 38 },
  { id: 3, name: "Marcus Smith", points: 1890, avatar: "MS", impact: "Medium", role: "Product", tasks: 32 },
  { id: 4, name: "Elena Vogt", points: 1650, avatar: "EV", impact: "Medium", role: "DevOps", tasks: 28 },
  { id: 5, name: "David Kim", points: 1420, avatar: "DK", impact: "Low", role: "Frontend", tasks: 22 },
];

// ── TASK DATA ───────────────────────────────────────────────────────────────

export const INITIAL_TASKS = [
  { id: "1", title: "Implement ERP Auth Flow", description: "Set up multi-tenant workspace isolation for the ERP module.", status: "todo", priority: "high", assignee: MOCK_USERS[0], deadline: "2024-05-15", proofRequired: true, proofStatus: "pending_upload" },
  { id: "2", title: "Design System Update", description: "Update the component library to include new ERP UI elements.", status: "in_progress", priority: "medium", assignee: MOCK_USERS[1], deadline: "2024-05-12", proofRequired: false },
  { id: "3", title: "Analytics Dashboard UI", description: "Create the layout for the workspace analytics engine.", status: "todo", priority: "low", assignee: MOCK_USERS[2], deadline: "2024-05-20", proofRequired: false },
  { id: "4", title: "Backend Schema Design", description: "Define models for Attendance, Holidays, and Daily Updates.", status: "done", priority: "high", assignee: MOCK_USERS[3], deadline: "2024-05-10", proofRequired: true, proofStatus: "approved" },
];

// ── WARNING DATA ─────────────────────────────────────────────────────────────

export const WARNINGS_FULL = [
  { id: 1, title: "Critical Milestone Overdue", target: "Beta Launch", severity: "high", status: "open", category: "Milestone", days: 2, assignee: "Alex Rivera", raisedAt: "2024-05-12T10:00:00Z" },
  { id: 2, title: "Inactivity Detected", target: "Team Growth", severity: "medium", status: "escalated", category: "Attendance", days: 5, assignee: "Marcus Smith", raisedAt: "2024-05-09T08:30:00Z" },
  { id: 3, title: "Proof Missing", target: "Legal Docs", severity: "low", status: "open", category: "Proof", days: 1, assignee: "Elena Vogt", raisedAt: "2024-05-13T14:00:00Z" },
];

export const WARNING_TREND_DATA = [
  { day: "Mon", high: 1, medium: 2, low: 0 },
  { day: "Tue", high: 2, medium: 1, low: 1 },
  { day: "Wed", high: 0, medium: 3, low: 2 },
  { day: "Thu", high: 3, medium: 1, low: 0 },
  { day: "Fri", high: 1, medium: 2, low: 1 },
  { day: "Sat", high: 2, medium: 0, low: 1 },
  { day: "Sun", high: 1, medium: 1, low: 2 },
];

// ── ADMIN DATA ───────────────────────────────────────────────────────────────

export const INITIAL_MEMBERS = MOCK_USERS;

export const INITIAL_HOLIDAYS = [
  { id: 1, name: "New Year's Day", date: "2024-01-01" },
  { id: 2, name: "Labor Day", date: "2024-05-01" },
  { id: 3, name: "Independence Day", date: "2024-07-04" },
];

// ── END OF CORE DATA ────────────────────────────────────────────────────────


