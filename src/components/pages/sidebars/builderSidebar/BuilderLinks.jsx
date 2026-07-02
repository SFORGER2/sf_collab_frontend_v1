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
  erpSection,
  filterERPModules
} from "../sidebarCommons";
import { FcInvite } from "react-icons/fc";

export function createBuilderLinks(unreadMessagesCount, userRoles = [], setActiveRole = () => {}, activeRole = 'builder') {
  const erp = { ...erpSection(11), subItems: filterERPModules(erpSection(11).subItems, activeRole, userRoles) };
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
    erp,
    sfDriveSection(11),
    sfMeetSection(12),
  ];
}