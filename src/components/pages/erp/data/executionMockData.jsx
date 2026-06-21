import React from "react";
import { CheckCircle2, Zap, Users, AlertCircle } from "lucide-react";

export const WORKSPACES = [
  { id: "ws_1", name: "SFCollab Main", score: 8.4, status: "Healthy" },
  { id: "ws_2", name: "Stealth Project B", score: 6.2, status: "Warning" },
  { id: "ws_3", name: "VibeCheck AI", score: 9.1, status: "Hyper-Growth" },
];

export const INITIAL_EXECUTION_SCORE = {
  overall: 8.4,
  breakdown: [
    { label: "Milestone Completion", value: 9.0, weight: 35, color: "#6366f1", detail: "Based on 12/14 milestones met.", v: 0.9, q: 1.0, c: 1.0 },
    { label: "Activity Consistency", value: 8.0, weight: 20, color: "#10b981", detail: "98% daily update log rate.", v: 1.0, q: 0.8, c: 1.0 },
    { label: "Project Momentum", value: 8.5, weight: 20, color: "#f59e0b", detail: "2.4x velocity increase this month.", v: 1.2, q: 0.7, c: 1.0 },
    { label: "Team Strength", value: 7.5, weight: 15, color: "#ec4899", detail: "4/5 core roles activated.", v: 0.7, q: 1.0, c: 1.1 },
    { label: "External Validation", value: 7.0, weight: 10, color: "#06b6d4", detail: "3 peer reviews pending.", v: 0.8, q: 0.9, c: 1.0 },
  ]
};

export const INITIAL_KPI_DATA = {
  day: [
    { label: "Tasks Completed", value: "8", trend: "+2", icon: <CheckCircle2 className="text-emerald-400" size={18} /> },
    { label: "Execution Velocity", value: "1.4x", trend: "+0.1", icon: <Zap className="text-blue-400" size={18} /> },
    { label: "Active Contributors", value: "12", trend: "+1", icon: <Users className="text-purple-400" size={18} /> },
    { label: "Open Warnings", value: "0", trend: "-1", icon: <AlertCircle className="text-emerald-400" size={18} /> },
  ],
  week: [
    { label: "Tasks Completed", value: "124", trend: "+12%", icon: <CheckCircle2 className="text-emerald-400" size={18} /> },
    { label: "Execution Velocity", value: "2.2x", trend: "+15%", icon: <Zap className="text-blue-400" size={18} /> },
    { label: "Active Contributors", value: "18", trend: "+2", icon: <Users className="text-purple-400" size={18} /> },
    { label: "Open Warnings", value: "3", trend: "-1", icon: <AlertCircle className="text-amber-400" size={18} /> },
  ],
  month: [
    { label: "Tasks Completed", value: "482", trend: "+24%", icon: <CheckCircle2 className="text-emerald-400" size={18} /> },
    { label: "Execution Velocity", value: "1.9x", trend: "-2%", icon: <Zap className="text-blue-400" size={18} /> },
    { label: "Active Contributors", value: "24", trend: "+4", icon: <Users className="text-purple-400" size={18} /> },
    { label: "Open Warnings", value: "12", trend: "+3", icon: <AlertCircle className="text-red-400" size={18} /> },
  ]
};

export const INITIAL_BURN_RATE = {
  monthly: "$12,400",
  efficiency: "94%",
  runway: "14 months",
  status: "Optimized"
};

export const INITIAL_ACTIVITY = [
  { id: 1, user: "Alex Rivera", action: "approved milestone", target: "Auth Engine", time: "Just now", type: "milestone", status: "VALIDATED", details: "Security audit passed with 100% compliance. All unit tests green." },
  { id: 2, user: "Sarah Chen", action: "uploaded proof", target: "UI Kit v2", time: "15m ago", type: "proof", status: "PENDING AUDIT", details: "Figma design system handoff complete. Added 12 new glassy components." },
  { id: 3, user: "Elena Vogt", action: "resolved warning", target: "API Latency", time: "1h ago", type: "warning", status: "VALIDATED", details: "Optimized database queries in the reputation engine. Latency down 40%." },
  { id: 4, user: "Marcus Smith", action: "created task", target: "User Interviews", time: "3h ago", type: "task", status: "STALE", details: "Scheduling 5 sessions with early beta users to validate scoring UI." },
];

export const INITIAL_WARNINGS = [
  { id: 1, title: "Critical Milestone Overdue", target: "Beta Launch", severity: "high", days: 2 },
  { id: 2, title: "Inactivity Detected", target: "Team Growth", severity: "medium", days: 5 },
  { id: 3, title: "Proof Missing", target: "Legal Docs", severity: "low", days: 1 },
  { id: 4, title: "Budget Burn Spiking", target: "Marketing", severity: "high", days: 1 },
  { id: 5, title: "Validation Ratio Low", target: "Frontend", severity: "medium", days: 3 },
  { id: 6, title: "API Limit Reached", target: "External Services", severity: "high", days: 1 },
  { id: 7, title: "Unassigned Tasks", target: "Backlog", severity: "low", days: 14 }
];

export const INITIAL_LEADERBOARD = [
  { id: 1, name: "Alex Rivera", points: 2450, avatar: "AR", impact: "High", role: "Backend", tasks: 45 },
  { id: 2, name: "Sarah Chen", points: 2120, avatar: "SC", impact: "High", role: "Design", tasks: 38 },
  { id: 3, name: "Marcus Smith", points: 1890, avatar: "MS", impact: "Medium", role: "Product", tasks: 32 },
  { id: 4, name: "Elena Vogt", points: 1650, avatar: "EV", impact: "Medium", role: "DevOps", tasks: 28 },
  { id: 5, name: "David Kim", points: 1420, avatar: "DK", impact: "Low", role: "Frontend", tasks: 22 },
];
