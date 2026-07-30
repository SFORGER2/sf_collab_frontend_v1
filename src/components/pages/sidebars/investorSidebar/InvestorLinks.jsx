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
  HardDrive,
  Presentation,
} from "lucide-react";
import { FcDocument, FcInvite } from "react-icons/fc";
import {
  aiTools, toolsSection, dashboardLink, socialSection, ideation,
  sfDriveSection, sfMeetSection, learningSection, walletSection,
  erpSection, filterERPModules, mentorshipSection,
} from "../sidebarCommons";


export function createInvestorLinks(unreadMessagesCount, userRoles = [], setActiveRole = () => { }, activeRole = 'investor') {
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
    ideation(3, "investor"),
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
    aiTools(8, "investor"),
    toolsSection(9),
    { id: "section-grow", sectionLabel: "Grow", isSection: true },
    mentorshipSection(15, "investor"),
    learningSection(13, "investor"),
    { id: "section-earn", sectionLabel: "Earn", isSection: true },
    walletSection(10),
    { id: "section-workspace", sectionLabel: "Workspace", isSection: true },
    // Investors get the read-only ERP slice (portfolio analytics, documents,
    // revenue pools) — previously they had no ERP entry at all.
    {
      ...erpSection(14),
      subItems: filterERPModules(erpSection(14).subItems, "investor", userRoles),
    },
    sfMeetSection(11),
    sfDriveSection(12),
  ];
}