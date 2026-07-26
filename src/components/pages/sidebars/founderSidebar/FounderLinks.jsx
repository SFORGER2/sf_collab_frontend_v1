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
  DollarSign,
  ShoppingCart,
  ShoppingBag,
  Coins,
  Trophy,
  Wallet,
  GraduationCap,
  Search,
  Star,
  Mail,
  CalendarClock,
  Activity,
  ShieldCheck,
  Video,
  FileStack,
  FolderOpen,
  Presentation,
} from "lucide-react";

import { Lightbulb } from "lucide-react";
import {
  aiTools,
  dashboardLink,
  ideation,
  socialSection,
  toolsSection,
  erpSection,
  filterERPModules,
  sfDriveSection,
  sfMeetSection,
  learningSection,
  mentorshipSection,
  walletSection,
} from "../sidebarCommons";
import { GiChecklist } from "react-icons/gi";

/**
 * Creates navigation links for the Founder sidebar
 * @param {number} unreadMessagesCount - Number of unread messages to display in badge
 * @returns {Array} Array of link objects for sidebar navigation
 */
// eslint-disable-next-line no-unused-vars
export function createFounderLinks(
  unreadMessagesCount,
  userRoles = [],
  setActiveRole = () => { },
  activeRole = "founder",
) {
  const erp = {
    ...erpSection(11),
    subItems: filterERPModules(erpSection(11).subItems, activeRole, userRoles),
  };
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
          // Request-only — the label shouldn't promise instant self-service.
          label: "Request Registration",
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
    ideation(3, "founder"),
    // Team management is not a top-level nav item — applications, team and
    // tasks all live in ERP, which is the workspace for running the company.
    // Keeping a second "Team" section here duplicated those destinations.
    socialSection(5),
    // Pitch Deck used to have its own top-level entry here. It is a generator,
    // not a destination, so it now lives inside AI Tools with the others.
    aiTools(6, "founder"),
    toolsSection(7),
    { id: "section-grow", sectionLabel: "Grow", isSection: true },
    mentorshipSection(8, "founder"),
    learningSection(9, "founder"),
    { id: "section-earn", sectionLabel: "Earn", isSection: true },
    // Fundraising and Contributions are deliberately absent from the scrolling
    // nav — they are pinned at the foot of the sidebar (BottomLinks), visible
    // to founders and builders only.
    walletSection(10),
    // ── SECTION BREAK: Workspace ──────────────────────────────────────────────
    { id: "section-workspace", sectionLabel: "Workspace", isSection: true },
    // ERP — founder gets full admin access
    erp,
    sfDriveSection(12),
    sfMeetSection(13),
  ];
}
