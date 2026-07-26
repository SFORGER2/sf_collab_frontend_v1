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
  fundraisingSection,
  contributionSection,
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
    ideation(3, "founder"),
    {
      id: 4,
      icon: <UserCog size={22} />,
      href: "/founder/my-applications",
      label: "Team",
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
          label: "My Team",
          icon: <Users size={18} />,
        },
        {
          id: "find-builders",
          href: "/discover-users",
          label: "Find Builders",
          icon: <Search size={18} />,
        },
        // Task management deliberately omitted — it lives in ERP → Task Board.
        // This entry pointed at the same /erp/tasks route, so the sidebar
        // offered two paths to one screen.
      ],
    },
    socialSection(5),
    // Pitch Deck used to have its own top-level entry here. It is a generator,
    // not a destination, so it now lives inside AI Tools with the others.
    aiTools(6, "founder"),
    toolsSection(7),
    { id: "section-grow", sectionLabel: "Grow", isSection: true },
    mentorshipSection(8, "founder"),
    learningSection(9, "founder"),
    { id: "section-earn", sectionLabel: "Earn", isSection: true },
    // Fundraising and Contributions are separate concerns — fundraising is
    // raising money for your startup, contributions is the ecosystem-wide
    // system that already has its own home. They used to be bundled.
    fundraisingSection(15),
    contributionSection(16),
    walletSection(10),
    // ── SECTION BREAK: Workspace ──────────────────────────────────────────────
    { id: "section-workspace", sectionLabel: "Workspace", isSection: true },
    // ERP — founder gets full admin access
    erp,
    sfDriveSection(12),
    sfMeetSection(13),
  ];
}
