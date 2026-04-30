import {
  BarChart2,
  BookOpen,
  ChartNoAxesGanttIcon,
  Eye,
  LightbulbIcon,
  Lock,
  Rocket,
  Save,
  TrendingUp,
  FolderOpen,
  HardDrive
} from "lucide-react";
import { FcDocument, FcInvite } from "react-icons/fc";
import {
  aiTools,
  toolsSection,
  dashboardLink,
  socialSection,
  ideation,
  wallet,
} from "../sidebarCommons";

export function createInvestorLinks(
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
        {
          id: "my-invitations",
          href: "/invitations",
          label: "My Invitations",
          icon: <FcInvite size={18} />,
        },
      ],
    },
    ideation(3),
    {
      id: 4,
      icon: <BarChart2 size={22} />,
      href: "/startup-analytics",
      label: "Startup Analytics",
      isUpcoming: true,
      subItems: [],
    },
    {
      id: 5,
      icon: <Eye size={22} />,
      href: "/watchlist",
      label: "Watchlist / Deal Flow",
      isUpcoming: true,
      subItems: [],
    },
    socialSection(7),
    aiTools(8),
    toolsSection(9),
    wallet(10),
    {
      id: 11,
      icon: <FolderOpen size={22} />,
      href: "/sf-drive",
      label: "SF Drive",
      subItems: [],
    },
  ];
}
