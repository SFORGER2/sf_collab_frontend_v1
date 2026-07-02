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
  Video,
} from "lucide-react";

import { Lightbulb } from "lucide-react";
import { aiTools, dashboardLink, ideation, socialSection, toolsSection, erpSection, filterERPModules, sfDriveSection, sfMeetSection } from "../sidebarCommons";
import { GiChecklist } from "react-icons/gi";

/**
 * Creates navigation links for the Founder sidebar
 * @param {number} unreadMessagesCount - Number of unread messages to display in badge
 * @returns {Array} Array of link objects for sidebar navigation
 */
// eslint-disable-next-line no-unused-vars
export function createFounderLinks(unreadMessagesCount, userRoles = [], setActiveRole = () => {}, activeRole = 'founder') {
  const erp = { ...erpSection(11), subItems: filterERPModules(erpSection(11).subItems, activeRole, userRoles) };
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
          id: "register-existing",
          href: "/register-existing-startup",
          label: "Register Existing",
          icon: <Building2 size={18} />,
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
          href: "/erp/tasks",
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
    erp,
    sfDriveSection(11),
    sfMeetSection(12),
  ];
}