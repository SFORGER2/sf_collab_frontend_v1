import { GraduationCap, MessageSquare, Rocket, Star, Users } from "lucide-react";
import {
  aiTools,
  contributionSection,
  dashboardLink,
  erpSection,
  filterERPModules,
  ideation,
  learningSection,
  mentorshipSection,
  sfDriveSection,
  sfMeetSection,
  socialSection,
  toolsSection,
  walletSection,
} from "../sidebarCommons";

/**
 * Mentor navigation.
 *
 * The mentor profile existed in the landing page's five forces and in the role
 * colour map, but had no sidebar, dashboard or ERP slice — it was a role you
 * could not actually be. This is its navigation.
 *
 * A mentor's job is to find projects worth guiding, review decisions, and build
 * reputation through outcomes — so discovery and mentorship lead, and the
 * founder's build/fundraise tooling is absent.
 */
export function createMentorLinks(
  unreadMessagesCount,
  userRoles = [],
  setActiveRole = () => {},
  activeRole = "mentor"
) {
  return [
    dashboardLink(userRoles, setActiveRole),
    mentorshipSection(2, "mentor"),
    {
      id: 3,
      icon: <Rocket size={22} />,
      href: "/discover-startups",
      label: "Discover",
      subItems: [
        { id: "discover-startups", href: "/discover-startups", label: "Startups", icon: <Rocket size={18} /> },
        { id: "discover-users", href: "/discover-users", label: "Founders", icon: <Users size={18} /> },
        { id: "saved-startups", href: "/saved-startups", label: "Saved", icon: <Star size={18} /> },
      ],
    },
    ideation(4, "mentor"),
    socialSection(5),
    aiTools(6, "mentor"),
    toolsSection(7),
    { id: "section-grow", sectionLabel: "Grow", isSection: true },
    learningSection(8, "mentor"),
    contributionSection(9),
    { id: "section-earn", sectionLabel: "Earn", isSection: true },
    walletSection(10),
    { id: "section-workspace", sectionLabel: "Workspace", isSection: true },
    {
      ...erpSection(11),
      subItems: filterERPModules(erpSection(11).subItems, "mentor", userRoles),
    },
    sfDriveSection(12),
    sfMeetSection(13),
  ];
}

export default createMentorLinks;
