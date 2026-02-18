import { BarChart2, BookOpen, ChartNoAxesGanttIcon, Eye, LightbulbIcon, Lock, Rocket, Save } from 'lucide-react';
import { FcDocument } from 'react-icons/fc';
import { aiTools, toolsSection, dashboardLink, socialSection } from '../sidebarCommons';

export function createInvestorLinks(unreadMessagesCount, userRoles = [], setActiveRole) {
  return [
    dashboardLink(userRoles, setActiveRole),
    {
      id: 2,
      icon: <Rocket size={22} />,
      href: "/discover-startups",
      label: "Discover Startups",
      subItems: [
        { id: "discover-startups", href: "/discover-startups", label: "Discover Startups", icon: <Rocket size={18} /> },
        { id: "saved-startups", href: "/saved-startups", label: "Saved Startups", icon: <Save size={18} /> },
      ]

    },
    {
      id: 3,
      icon: <LightbulbIcon size={22} />,
      href: "/ideation",
      label: "Ideation",
      subItems: [
        { id: "Ideation-Board", href: "/ideation", label: "Ideation Board", icon: <LightbulbIcon size={18} /> },
        { id: "knowledge-resources", href: "/knowledge", label: "Knowledge Resources", icon: <BookOpen size={18} /> },
      ]
    },
    {
      id: 4,
      icon: <BarChart2 size={22} />,
      href: "/startup-analytics",
      label: "Startup Analytics",
      isUpcoming: true,
      subItems: []
    },
    {
      id: 5,
      icon: <Eye size={22} />,
      href: "/watchlist",
      label: "Watchlist / Deal Flow",
      isUpcoming: true,
      subItems: []
    },
    socialSection(6),

    aiTools(9),
    toolsSection(10)
  ];
}
