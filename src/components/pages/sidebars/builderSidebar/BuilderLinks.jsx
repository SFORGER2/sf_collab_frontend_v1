import {
  CheckCircle,
  Save,
  MessageSquareHeart,
  Rocket,
  Users,
  ClipboardList,
  FileTerminal,
  Hammer,
  TrendingUp,
  Settings,
  BarChart3,
  BarChart2,
  FolderOpen,
  Bell,
  DollarSign,
  ShoppingCart,
  ShoppingBag,
  Coins,
  Trophy,
  Wallet,
  GraduationCap,
  Search,
  Star,
  Building2,
  CalendarClock,
  FileStack,
  Video,
} from "lucide-react";
import {
  aiTools,
  dashboardLink,
  ideation,
  socialSection,
  toolsSection,
} from "../sidebarCommons";
import { FcInvite } from "react-icons/fc";

export function createBuilderLinks(
  unreadMessagesCount,
  userRoles = [],
  setActiveRole,
) {
  return [
    dashboardLink(userRoles, setActiveRole),
    {
      id: 2,
      icon: <Rocket size={22} />,
      href: "/discover-startups",
      label: "Discover Startups",
      subItems: [
        {
          id: "discover-startups",
          href: "/discover-startups",
          label: "Discover Startups",
          icon: <Rocket size={18} />,
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
      id: 5,
      icon: <Hammer size={22} />,
      href: "/builder/my-startups",
      label: "My Startups",
      subItems: [
        {
          id: "my-startups",
          href: "/builder/my-startups",
          label: "My Startups",
          icon: <Hammer size={18} />,
        },
        {
          id: "my-applications",
          href: "/builder/my-applications",
          label: "My Applications",
          icon: <CheckCircle size={18} />,
        },
        {
          id: "my-work",
          href: "/builder/my-work",
          label: "My Work",
          icon: <ClipboardList size={18} />,
        },
        {
          id: "my-invitations",
          href: "/invitations",
          label: "My Invitations",
          icon: <FcInvite size={18} />,
        },
      ],
    },
    // Mentorship
    {
      id: 6,
      icon: <GraduationCap size={22} />,
      href: "/mentors",
      label: "Mentorship",
      subItems: [
        { id: "mentors",                href: "/mentors",                label: "Find a Mentor",    icon: <Search size={18} /> },
        { id: "mentor-dashboard",       href: "/mentor-dashboard",       label: "Mentor Dashboard", icon: <GraduationCap size={18} /> },
        { id: "my-mentorship-requests", href: "/my-mentorship-requests", label: "My Requests",      icon: <Star size={18} /> },
      ],
    },
    socialSection(7),
    aiTools(8),
    toolsSection(9),
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
    // ERP
    {
      id: 11,
      icon: <Building2 size={22} />,
      href: "/erp-dashboard",
      label: "ERP",
      subItems: [
        { id: "erp-dashboard",    href: "/erp-dashboard",    label: "Dashboard",    icon: <Building2 size={18} /> },
        { id: "erp-attendance",   href: "/erp/attendance",   label: "Attendance",   icon: <CalendarClock size={18} /> },
        { id: "erp-tasks",        href: "/erp/tasks",        label: "Tasks",        icon: <ClipboardList size={18} /> },
        { id: "erp-updates",      href: "/erp/updates",      label: "Updates",      icon: <FileStack size={18} /> },
        { id: "erp-documents",    href: "/erp/documents",    label: "Documents",    icon: <FileTerminal size={18} /> },
        { id: "erp-alerts",       href: "/erp/alerts",       label: "Alerts",       icon: <Bell size={18} /> },
        { id: "erp-analytics",    href: "/erp/analytics",    label: "Analytics",    icon: <BarChart3 size={18} /> },
        { id: "erp-payouts",      href: "/erp/payouts",      label: "Payouts",      icon: <DollarSign size={18} /> },
        { id: "erp-my-analytics", href: "/erp/my-analytics", label: "My Analytics", icon: <BarChart2 size={18} /> },
        { id: "erp-settings",     href: "/erp/settings",     label: "Settings",     icon: <Settings size={18} /> },
      ],
    },
    {
      id: 13,
      icon: <Video size={22} />,
      href: "/meet",
      label: "SF Meet",
      subItems: [
        { id: "meet",         href: "/meet",         label: "All Meetings",    icon: <Video size={18} /> },
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