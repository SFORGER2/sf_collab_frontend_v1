import {
  BookOpen,
  BriefcaseBusiness,
  LightbulbIcon,
  Rocket,
  Save,
  Share2,
  TrendingUp,
  Wallet,
  FolderOpen,
  HardDrive,
} from "lucide-react";
import {
  aiTools,
  toolsSection,
  dashboardLink,
  socialSection,
  wallet,
  ideation,
} from "../sidebarCommons";
import { FcInvite } from "react-icons/fc";

export function createInfluencerLinks(
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

    socialSection(4),

    {
      id: 5,
      icon: <BriefcaseBusiness size={22} />,
      href: "/campaigns",
      label: "Campaigns",
      isUpcoming: true,
      subItems: [
        {
          id: "active-campaigns",
          href: "/campaigns",
          label: "Active Campaigns",
        },
        {
          id: "past-campaigns",
          href: "/campaigns/past",
          label: "Past Campaigns",
        },
      ],
    },
    {
      id: 6,
      icon: <TrendingUp size={22} />,
      href: "/statistics",
      label: "Statistics",
      isUpcoming: true,

      subItems: [
        { id: "performance", href: "/statistics", label: "Performance" },
        { id: "analytics", href: "/statistics/analytics", label: "Analytics" },
      ],
    },
    {
      id: 7,
      icon: <Share2 size={22} />,
      href: "/links-assets",
      label: "Links & Assets",
      isUpcoming: true,

      subItems: [
        { id: "my-links", href: "/links-assets", label: "My Links" },
        { id: "assets", href: "/links-assets/assets", label: "Assets" },
      ],
    },
    // wallet(8),
    aiTools(9),
    toolsSection(10),
   {
      id: 11,
      icon: <FolderOpen size={22} />,
      href: "/sf-drive",
      label: "SF Drive",
      subItems: [],
    },
  ];
}

// Helper to get current context based on pathname
export function getCurrentContext(pathname) {
  if (["/dashboard"].some((path) => pathname.startsWith(path))) {
    return 1;
  }
  if (["/campaigns"].some((path) => pathname.startsWith(path))) {
    return 2;
  }
  if (["/statistics"].some((path) => pathname.startsWith(path))) {
    return 3;
  }
  if (["/links-assets"].some((path) => pathname.startsWith(path))) {
    return 4;
  }
  if (["/wallet"].some((path) => pathname.startsWith(path))) {
    return 5;
  }
  if (["/chat"].some((path) => pathname.startsWith(path))) {
    return 6;
  }
  return 1;
}

// Get top nav links for current context
export function getTopNavLinks(pathname, unreadMessagesCount = 0) {
  const contextId = getCurrentContext(pathname);
  const links = createInfluencerLinks(unreadMessagesCount);
  const activeLink = links.find((link) => link.id === contextId);

  if (activeLink && activeLink.subItems) {
    return activeLink.subItems;
  }

  return links[0].subItems || [];
}

// Backward compatibility
export function createInfluencerDashboardLinks(unreadMessagesCount) {
  return createInfluencerLinks(unreadMessagesCount);
}
