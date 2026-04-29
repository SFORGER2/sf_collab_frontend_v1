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
  Rocket,
  PlusSquare,
  BookOpen,
  MessageSquareHeart,
  Users,
} from "lucide-react";

import { Lightbulb } from "lucide-react";
import {
  aiTools,
  dashboardLink,
  ideation,
  socialSection,
  toolsSection,
  wallet,
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
    wallet(10),
    {
      id: 11,
      icon: <TrendingUp size={22} />,
      href: "/erp-dashboard",
      label: "ERP",
      subItems: [
        {
          id: "erp-dashboard",
          href: "/erp-dashboard",
          label: "Dashboard",
          icon: <TrendingUp size={18} />,
        },
        {
          id: "erp-attendance",
          href: "/erp/attendance",
          label: "Attendance",
          icon: <Users size={18} />,
        },
        {
          id: "erp-tasks",
          href: "/erp/tasks",
          label: "Tasks",
          icon: <ClipboardList size={18} />,
        },
        {
          id: "erp-updates",
          href: "/erp/updates",
          label: "Updates",
          icon: <MessageSquareHeart size={18} />,
        },
        {
          id: "erp-documents",
          href: "/erp/documents",
          label: "Documents",
          icon: <FileTerminal size={18} />,
        },
        {
          id: "erp-alerts",
          href: "/erp/alerts",
          label: "Alerts",
          icon: <Bell size={18} />,
        },
        {
          id: "erp-analytics",
          href: "/erp/analytics",
          label: "Analytics",
          icon: <BarChart3 size={18} />,
        },
        {
          id: "erp-settings",
          href: "/erp/settings",
          label: "Settings",
          icon: <Settings size={18} />,
        },
      ],
    },
  ];
}
