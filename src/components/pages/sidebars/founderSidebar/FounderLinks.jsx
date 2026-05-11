import {
  Building2,
  LightbulbIcon,
  Save,
  UserCog,
  Settings,
  TrendingUp,
  ClipboardList,
  FileTerminal,
  Bell,
  BarChart3,
  BarChart2,
  Rocket,
  PlusSquare,
  MessageSquareHeart,
  Users,
  FolderOpen,
  DollarSign,
  ShoppingCart,
  ShoppingBag,
  Coins,
  Trophy,
  Wallet,
  GraduationCap,
  Search,
  Star,
  CalendarClock,
  FileStack,
  Activity,
  ShieldCheck,
} from "lucide-react";

import { Lightbulb } from "lucide-react";
import {
  aiTools,
  dashboardLink,
  ideation,
  socialSection,
  toolsSection,
} from "../sidebarCommons";
import { GiChecklist } from "react-icons/gi";

/**
 * Creates navigation links for the Founder sidebar
 * @param {number} unreadMessagesCount - Number of unread messages to display in badge
 * @returns {Array} Array of link objects for sidebar navigation
 */
// eslint-disable-next-line no-unused-vars
export function createFounderLinks(
  unreadMessagesCount = 0,
  userRoles = [],
  setActiveRole = () => {},
) {
  return [
    dashboardLink(userRoles, setActiveRole),
    {
      id: 2,
      icon: <Rocket size={22} />,
      href: "/discover-startups",
      label: "Startups",
      subItems: [
        {
          id: "discover-startups",
          href: "/discover-startups",
          label: "Discover",
          icon: <Rocket size={18} />,
        },
        {
          id: "register-startup",
          href: "/register-startup",
          label: "Register",
          icon: <PlusSquare size={18} />,
        },
        {
          id: "my-startups",
          href: "/my-startups",
          label: "My Startups",
          icon: <Building2 size={18} />,
        },
        {
          id: "saved-startups",
          href: "/saved-startups",
          label: "Saved Startups",
          icon: <Save size={18} />,
        },
      ],
    },
    ideation(3),
    {
      id: 4,
      icon: <UserCog size={22} />,
      href: "/founder/my-applications",
      label: "Manage",
      subItems: [
        {
          id: "manage-applications",
          href: "/founder/my-applications",
          label: "Applications",
          icon: <GiChecklist size={18} />,
        },
        {
          id: "manage-team",
          href: "/founder/my-team",
          label: "Team",
          icon: <Users size={18} />,
        },
        {
          id: "manage-tasks",
          href: "/founder/manage-tasks",
          label: "Tasks",
          icon: <LightbulbIcon size={18} />,
        },
      ],
    },
    socialSection(5),
    aiTools(6),
    toolsSection(7),
    // Mentorship
    {
      id: 8,
      icon: <GraduationCap size={22} />,
      href: "/mentors",
      label: "Mentorship",
      subItems: [
        { id: "mentors",                href: "/mentors",                label: "Find a Mentor",    icon: <Search size={18} /> },
        { id: "mentor-dashboard",       href: "/mentor-dashboard",       label: "Mentor Dashboard", icon: <GraduationCap size={18} /> },
        { id: "my-mentorship-requests", href: "/my-mentorship-requests", label: "My Requests",      icon: <Star size={18} /> },
      ],
    },
    // Wallet & Store — marketplace lives here
    {
      id: 10,
      icon: <Wallet size={22} />,
      href: "/wallet",
      label: "Wallet & Store",
      subItems: [
        { id: "wallet",      href: "/wallet",      label: "My Wallet",   icon: <Coins size={18} /> },
        { id: "store",       href: "/store",       label: "SF Store",    icon: <ShoppingBag size={18} /> },
        { id: "leaderboard", href: "/leaderboard", label: "Leaderboard", icon: <Trophy size={18} /> },
        { id: "marketplace", href: "/marketplace", label: "Marketplace", icon: <ShoppingCart size={18} /> },
      ],
    },
    // ERP — founder gets full admin access
    {
      id: 11,
      icon: <Building2 size={22} />,
      href: "/erp-dashboard",
      label: "ERP",
      subItems: [
        { id: "erp-dashboard",          href: "/erp-dashboard",            label: "Dashboard",            icon: <Building2 size={18} /> },
        { id: "erp-attendance",         href: "/erp/attendance",           label: "Attendance",           icon: <CalendarClock size={18} /> },
        { id: "erp-tasks",              href: "/erp/tasks",                label: "Tasks",                icon: <ClipboardList size={18} /> },
        { id: "erp-updates",            href: "/erp/updates",              label: "Updates",              icon: <FileStack size={18} /> },
        { id: "erp-documents",          href: "/erp/documents",            label: "Documents",            icon: <FileTerminal size={18} /> },
        { id: "erp-alerts",             href: "/erp/alerts",               label: "Alerts",               icon: <Bell size={18} /> },
        { id: "erp-analytics",          href: "/erp/analytics",            label: "Analytics",            icon: <BarChart3 size={18} /> },
        { id: "erp-admin-analytics",    href: "/erp/admin-analytics",      label: "Admin Analytics",      icon: <ShieldCheck size={18} /> },
        { id: "erp-payouts",            href: "/erp/payouts",              label: "Payouts",              icon: <DollarSign size={18} /> },
        { id: "erp-my-analytics",       href: "/erp/my-analytics",         label: "My Analytics",         icon: <BarChart2 size={18} /> },
        { id: "erp-attendance-ws",      href: "/erp/attendance/workspace", label: "Workspace Attendance", icon: <Users size={18} /> },
        { id: "erp-activity",           href: "/erp/activity",             label: "Activity Monitor",     icon: <Activity size={18} /> },
        { id: "erp-settings",           href: "/erp/settings",             label: "Settings",             icon: <Settings size={18} /> },
      ],
    },
    {
      id: 12,
      icon: <FolderOpen size={22} />,
      href: "/sf-drive",
      label: "SF Drive",
      subItems: [],
    },
  ];
}