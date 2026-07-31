import {
  BarChart3, Bookmark, BookOpen, Bot, BrainCircuit, BriefcaseBusiness,
  Calculator, CaptionsIcon, ClipboardList, Cpu, Database, Earth,
  FileSignature, FileTerminal, FileText, Images, Lightbulb, LightbulbIcon,
  MessageSquare, MessageSquareHeart, Rss, StickyNote, TrendingUp,
  UserPlus, Users, VideoIcon, Wallet, Wand2, CalendarClock, FileStack,
  Bell, DollarSign, BarChart2, Award, Flag, AlertTriangle,
  CheckCircle, LayoutDashboard, Settings, PieChart, Coins, CreditCard, FolderOpen, Video, Clock, Trash2, Star,
  Newspaper   // ✅ Added missing import
} from "lucide-react";
import { Trophy, ShoppingCart, ShoppingBag, GraduationCap, Search, BadgeCheck, Dices, Gem } from "lucide-react";
import { BsGear, BsPeople } from "react-icons/bs";
import { IoChatbubbles } from "react-icons/io5";
import { LuLayoutDashboard } from "react-icons/lu";
import { SiBoardgamegeek } from "react-icons/si";

/**
 * AI tools, filtered to what each role actually uses.
 *
 * A founder has no use for a caption generator in their primary nav, and an
 * investor has no use for a logo generator. Everything remains reachable from
 * /ai-dashboard — this only controls what earns a slot in the sidebar.
 */
const AI_TOOLS_BY_ROLE = {
  // Pitch Deck lives here only — it used to have its own top-level nav entry
  // in the founder sidebar, which is not a navigation destination, it's a tool.
  founder: ["ai-matchmaking", "business-plan", "pitch-deck", "logo-generator", "multimodal-images", "data-scraper"],
  builder: ["ai-matchmaking", "qwen-chat", "data-scraper"],
  influencer: ["caption-generator", "video-generator", "multimodal-images", "ai-matchmaking"],
  investor: ["ai-matchmaking", "data-scraper"],
  mentor: ["ai-matchmaking", "qwen-chat"],
  member: ["ai-matchmaking", "qwen-chat"],
};

// AI News is deliberately absent — it is free, not a tool, and now surfaces as
// a dashboard widget rather than a menu item.
const ALL_AI_TOOLS = [
  { id: "ai-matchmaking", href: "/ai-matchmaking", label: "AI Matchmaking", icon: <BrainCircuit size={18} /> },
  { id: "pitch-deck", href: "/pitch-deck", label: "Pitch Deck", icon: <FileStack size={18} /> },
  { id: "logo-generator", href: "/logo-generator", label: "Logo Generator", icon: <Wand2 size={18} /> },
  { id: "business-plan", href: "/business-plan", label: "Business Plan", icon: <ClipboardList size={18} /> },
  { id: "qwen-chat", href: "/qwen-chat", label: "Qwen Chat", icon: <Bot size={18} /> },
  { id: "data-scraper", href: "/data-scraper", label: "Data Scraper", icon: <Database size={18} /> },
  { id: "multimodal-images", href: "/multimodal-images", label: "Multimodal Images", icon: <Images size={18} /> },
  { id: "video-generator", href: "/video-generator", label: "Video Generator", icon: <VideoIcon size={18} /> },
  { id: "caption-generator", href: "/caption-generator", label: "Caption Generator", icon: <CaptionsIcon size={18} /> },
];

export function aiTools(id, role = "member") {
  const allowed = AI_TOOLS_BY_ROLE[role] || AI_TOOLS_BY_ROLE.member;
  return {
    id,
    icon: <BrainCircuit size={23} />,
    href: "/ai-dashboard",
    label: "AI Tools",
    subItems: [
      { id: "ai-matchmaking", href: "/ai-matchmaking", label: "AI Matchmaking", icon: <BrainCircuit size={18} /> },
      { id: "ai-news", href: "/ai-news", label: "AI News Feed", icon: <Rss size={18} /> },
      { id: "logo-generator", href: "/logo-generator", label: "Logo Generator", icon: <Wand2 size={18} /> },
      { id: "business-plan", href: "/business-plan", label: "Business Plan", icon: <ClipboardList size={18} /> },
      { id: "qwen-chat", href: "/qwen-chat", label: "Qwen Chat", icon: <Bot size={18} /> },
      { id: "data-scraper", href: "/data-scraper", label: "Data Scraper", icon: <Database size={18} /> },
      { id: "multimodal-images", href: "/multimodal-images", label: "Multimodal Images", icon: <Images size={18} /> },
      { id: "video-generator", href: "/video-generator", label: "Video Generator", icon: <VideoIcon size={18} /> },
      { id: "caption-generator", href: "/caption-generator", label: "Caption Generator", icon: <CaptionsIcon size={18} /> },
      { id: "ai-assistant-tools", href: "/ai-assistant-tools", label: "AI Assistant Tools", icon: <FileText size={18} /> },

      ...allowed.map((key) => ALL_AI_TOOLS.find((t) => t.id === key)).filter(Boolean),
      { id: "ai-all", href: "/ai-dashboard", label: "All AI Tools", icon: <Cpu size={18} /> },
    ],
  };
}

/**
 * Learning & knowledge. Every role needs this — it was previously only wired
 * into the member and influencer sidebars, so founders had no route to the
 * knowledge base from their navigation at all.
 */
export function learningSection(id, role = "member") {
  const roleGuides = {
    founder: { id: "guide-founder", href: "/getting-started", label: "Founder Guide", icon: <Flag size={18} /> },
    builder: { id: "guide-builder", href: "/team-collaboration", label: "Builder Guide", icon: <Flag size={18} /> },
    influencer: { id: "guide-influencer", href: "/getting-started", label: "Influencer Guide", icon: <Flag size={18} /> },
    investor: { id: "guide-investor", href: "/getting-started", label: "Investor Guide", icon: <Flag size={18} /> },
  };

  return {
    id,
    icon: <BookOpen size={22} />,
    href: "/knowledge",
    label: "Learning",
    subItems: [
      { id: "knowledge", href: "/knowledge", label: "Knowledge Base", icon: <BookOpen size={18} /> },
      { id: "video-tutorials", href: "/video-tutorials", label: "Video Tutorials", icon: <VideoIcon size={18} /> },
      roleGuides[role] || { id: "getting-started", href: "/getting-started", label: "Getting Started", icon: <Flag size={18} /> },
      // Announcements deliberately absent — they live on the dashboard as the
      // Announcements / Newsletter widget, not in the Learning menu.
      { id: "help", href: "/help", label: "Help Centre", icon: <MessageSquare size={18} /> },
    ],
  };
}

/**
 * Mentorship, framed by what each role actually wants from a mentor.
 *
 * "My Mentorship Requests" is the mentor's inbox of people asking for their
 * time — it appeared in every role's menu, so builders and founders saw a
 * screen that only makes sense if you are a mentor. It is now mentor-only.
 *
 * The mentor search differs by role too, because "a good mentor" means
 * something different depending on what you're trying to do:
 *   founder    → mentors who have built and exited companies
 *   builder    → mentors with deep craft skill in your discipline
 *   influencer → mentors with genuine audience reach
 *   investor   → mentors with portfolio and diligence experience
 */
const MENTOR_LENS = {
  founder: {
    label: "Successful Founders",
    href: "/mentors?lens=proven",
    hint: "People who have built and scaled companies",
  },
  builder: {
    label: "Deep Skill Mentors",
    href: "/mentors?lens=skills",
    hint: "Craft and technical depth",
  },
  influencer: {
    label: "High-Reach Mentors",
    href: "/mentors?lens=audience",
    hint: "Proven audience growth",
  },
  investor: {
    label: "Investor Mentors",
    href: "/mentors?lens=portfolio",
    hint: "Portfolio and diligence",
  },
};

export function mentorshipSection(id, role = "member") {
  // Mentors run an inbox; they don't shop for mentors.
  if (role === "mentor") {
    return {
      id,
      icon: <GraduationCap size={22} />,
      href: "/mentor-dashboard",
      label: "Mentorship",
      subItems: [
        { id: "mentor-dashboard", href: "/mentor-dashboard", label: "My Mentees", icon: <Users size={18} /> },
        { id: "mentor-requests", href: "/my-mentorship-requests", label: "Incoming Requests", icon: <Star size={18} /> },
        { id: "mentor-seeking", href: "/mentors?seeking=1", label: "People Seeking Mentors", icon: <Search size={18} /> },
      ],
    };
  }

  const lens = MENTOR_LENS[role];

  return {
    id,
    icon: <GraduationCap size={22} />,
    href: "/mentors",
    label: "Mentorship",
    subItems: [
      ...(lens ? [{ id: "mentors-lens", href: lens.href, label: lens.label, icon: <BadgeCheck size={18} /> }] : []),
      { id: "mentors", href: "/mentors", label: "All Mentors", icon: <Search size={18} /> },
      // Deliberately no "My Requests" here — that is the mentor's inbox.
    ],
  };
}

/** Wallet, credits and plan. Shared by every role. */
export function walletSection(id) {
  return {
    id,
    icon: <Wallet size={22} />,
    href: "/wallet",
    label: "Wallet & Store",
    subItems: [
      { id: "wallet", href: "/wallet", label: "My Wallet", icon: <Coins size={18} /> },
      { id: "earn", href: "/wallet/earn", label: "Earn SF Coins", icon: <TrendingUp size={18} /> },
      { id: "inventory", href: "/wallet/inventory", label: "My Inventory", icon: <ShoppingBag size={18} /> },
      { id: "crystals", href: "/wallet/crystals", label: "Buy Crystals", icon: <Gem size={18} /> },
      { id: "refer", href: "/refer-and-earn", label: "Refer & Earn", icon: <UserPlus size={18} /> },
      { id: "credits", href: "/credits", label: "Buy Credits", icon: <CreditCard size={18} /> },
      { id: "draws", href: "/draws", label: "Draws & Prizes", icon: <Trophy size={18} /> },
      { id: "lottery", href: "/draws?tab=lottery", label: "Lottery", icon: <Dices size={18} /> },
      { id: "jackpot", href: "/draws?tab=jackpot", label: "Jackpot", icon: <Star size={18} /> },
      { id: "plans", href: "/plans", label: "Plans", icon: <Award size={18} /> },
      { id: "store", href: "/store", label: "SF Store", icon: <ShoppingBag size={18} /> },
      { id: "leaderboard", href: "/leaderboard", label: "Leaderboard", icon: <BarChart3 size={18} /> },
      { id: "marketplace", href: "/marketplace", label: "Marketplace", icon: <ShoppingCart size={18} /> },
    ],
  };
}

/**
 * Fundraising — kept separate from Contributions.
 *
 * These were bundled together, but they are different things: fundraising is
 * raising money for your startup, contributions is the ecosystem-wide
 * contribution system that already has its own home.
 */
export function fundraisingSection(id) {
  return {
    id,
    icon: <DollarSign size={22} />,
    href: "/crowdfunding",
    label: "Fundraising",
    subItems: [
      { id: "crowdfunding", href: "/crowdfunding", label: "Crowdfunding", icon: <Coins size={18} /> },
      { id: "donate", href: "/donate", label: "Donations", icon: <DollarSign size={18} /> },
      { id: "revenue", href: "/erp/admin/revenue-pools", label: "Revenue Pools", icon: <PieChart size={18} /> },
    ],
  };
}

export function contributionSection(id) {
  return {
    id,
    icon: <Users size={22} />,
    href: "/contribution",
    label: "Contributions",
    subItems: [
      { id: "contribution", href: "/contribution", label: "Overview", icon: <Users size={18} /> },
      { id: "contribution-ideas", href: "/contribution-ideas", label: "Ideas", icon: <Lightbulb size={18} /> },
      { id: "contribution-polls", href: "/contribution-polls", label: "Polls", icon: <CheckCircle size={18} /> },
    ],
  };
}

export function toolsSection(id) {
  return {
    id,
    icon: <BsGear size={23} />,
    href: "/tools-dashboard",
    label: "Tools",
    subItems: [
      {
        id: "calculator",
        href: "/calculator",
        label: "Calculator",
        icon: <Calculator size={18} />,
      },
      {
        id: "pdf-signing",
        href: "/pdf-signing",
        label: "PDF Signing",
        icon: <FileSignature size={18} />,
      },
      {
        id: "notes",
        href: "/notes",
        label: "Notes",
        icon: <StickyNote size={18} />,
      },
      // { id: "board", href: "/board", label: "Board", icon: <SiBoardgamegeek size={18} /> },
    ],
  };
}
export function dashboardLink(userRoles = [], setActiveRole) {
  return {
    id: 1,
    icon: <LuLayoutDashboard size={22} />,
    href: "/dashboard",
    label: "Dashboard",
    // Anyone with more than one role gets prev/next arrows on this row instead
    // of having to expand it and pick from a list — the sidebar reads these.
    roleSwitch: userRoles || [],
    onRoleSwitch: (role) => setActiveRole?.(role),
    subItems: userRoles
      ? userRoles.map((role) => ({
        id: `${role}-dashboard`,
        onLinkClick: () => {
          setActiveRole(role);
        },
        href: `/dashboard`,
        icon:
          role === "founder" ? (
            <BriefcaseBusiness size={18} />
          ) : role === "investor" ? (
            <BarChart3 size={18} />
          ) : role === "builder" ? (
            <Cpu size={18} />
          ) : role === "influencer" ? (
            <IoChatbubbles size={18} />
          ) : (
            <LuLayoutDashboard size={18} />
          ),
        label: `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`,
      }))
      : [],
  };
}

export function socialSection(id) {
  return {
    id,
    icon: <Rss size={22} />,
    href: "/posts",
    label: "Community",
    subItems: [
      {
        id: "posts-feed",
        href: "/posts",
        label: "Social Feed",
        icon: <MessageSquareHeart size={18} />,
      },
      {
        id: "connections",
        href: "/connections",
        label: "Connections",
        icon: <UserPlus size={18} />,
      },
      {
        id: "discover-users",
        href: "/discover-users",
        label: "Discover Users",
        icon: <Users size={18} />,
      },
      // AI News removed — it is a free feed, not a community destination, and
      // now appears as a dashboard widget instead.
    ],
  };
}

export function erpSection(id) {
  return {
    id,
    icon: <BriefcaseBusiness size={22} />,
    href: "/erp",
    label: "ERP",
    subItems: [
      { id: "erp-member-dashboard", href: "/erp/member-dashboard", label: "Member Dashboard", icon: <LayoutDashboard size={18} /> },
      { id: "erp-attendance", href: "/erp/attendance", label: "My Attendance", icon: <CalendarClock size={18} /> },
      { id: "erp-tasks", href: "/erp/tasks", label: "Task Board", icon: <ClipboardList size={18} /> },
      { id: "erp-task-approval", href: "/erp/task-approval", label: "Task Approval", icon: <CheckCircle size={18} /> },
      // Team management moved here from the founder sidebar's own "Team"
      // section — running the company belongs in one workspace.
      { id: "erp-team", href: "/founder/my-team", label: "My Team", icon: <Users size={18} /> },
      { id: "erp-applications", href: "/founder/my-applications", label: "Applications", icon: <UserPlus size={18} /> },
      { id: "erp-updates", href: "/erp/updates", label: "Daily Updates", icon: <FileStack size={18} /> },
      { id: "erp-points", href: "/erp/points", label: "Points Dashboard", icon: <Award size={18} /> },
      { id: "erp-analytics", href: "/erp/admin-analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
      { id: "erp-my-analytics", href: "/erp/my-analytics", label: "My Analytics", icon: <BarChart2 size={18} /> },
      { id: "erp-payouts", href: "/erp/payouts", label: "Payouts", icon: <DollarSign size={18} /> },
      { id: "erp-documents", href: "/erp/documents", label: "Documents", icon: <FileTerminal size={18} /> },
      { id: "erp-alerts", href: "/erp/alerts", label: "Alerts", icon: <Bell size={18} /> },
      { id: "erp-warnings", href: "/erp/warnings", label: "Warnings", icon: <AlertTriangle size={18} /> },
      { id: "erp-flags", href: "/erp/flags", label: "Flags (Admin)", icon: <Flag size={18} /> },
      { id: "erp-audit-logs", href: "/erp/audit-logs", label: "Audit Logs", icon: <FileText size={18} /> },
      { id: "erp-workspace-dashboard", href: "/erp/workspace-dashboard", label: "Workspace Dashboard", icon: <TrendingUp size={18} /> },
      { id: "erp-admin-settings", href: "/erp/admin-settings", label: "Admin Settings", icon: <Settings size={18} /> },
      { id: "erp-admin-revenue", href: "/erp/admin/revenue-pools", label: "Revenue Pools", icon: <Coins size={18} /> },
      { id: "erp-admin-payouts", href: "/erp/admin/payouts", label: "Admin Payouts", icon: <CreditCard size={18} /> },
    ],
  };
}


export function wallet(id) {
  return {
    id,
    icon: <Wallet size={22} />,
    href: "/wallet",
    label: "Wallet & Store",
    subItems: [
      {
        id: "wallet",
        href: "/wallet",
        label: "My Wallet",
        icon: <Wallet size={18} />,
      },
      {
        id: "store",
        href: "/store",
        label: "SF Store",
        icon: <TrendingUp size={18} />,
      },
      {
        id: "leaderboard",
        href: "/leaderboard",
        label: "Leaderboard",
        icon: <TrendingUp size={18} />,
      },
    ],
  };
}

/**
 * Visions. Knowledge and newsletters moved out to learningSection() — they
 * were never about visions, and burying the knowledge base under "Vision" is
 * why founders could not find it.
 */
export function ideation(id, role = "member") {
  const founderExtras = [
    { id: "create-vision", href: "/vision/new", label: "Create a Vision", icon: <Lightbulb size={18} /> },
  ];

  return {
    id,
    icon: <LightbulbIcon size={22} />,
    href: "/ideation",
    label: "Visions",
    subItems: [
      ...(role === "founder" ? founderExtras : []),
      { id: "vision-board", href: "/ideation", label: "Explore Visions", icon: <LightbulbIcon size={18} /> },
      { id: "saved-visions", href: "/saved-ideas", label: "Saved Visions", icon: <Bookmark size={18} /> },
    ],
  };
}

export function filterERPModules(modules, role, userRoles = []) {
  const allowedByRole = {
    founder: [
      'Member Dashboard', 'My Attendance', 'Task Board', 'Task Approval',
      'My Team', 'Applications',
      'Daily Updates', 'Points Dashboard', 'Analytics', 'My Analytics',
      'Payouts', 'Documents', 'Alerts', 'Warnings', 'Flags (Admin)',
      'Audit Logs', 'Workspace Dashboard', 'Admin Settings', 'Revenue Pools',
      'Admin Payouts'
    ],
    builder: [
      'Member Dashboard', 'My Attendance', 'Task Board', 'Daily Updates',
      'Points Dashboard', 'My Analytics', 'Payouts', 'Documents', 'Alerts',
      'Warnings'
    ],
    influencer: [
      'Member Dashboard', 'Task Board', 'Daily Updates',
      'Points Dashboard', 'My Analytics', 'Payouts', 'Documents', 'Alerts'
    ],
    investor: [
      'Member Dashboard', 'Workspace Dashboard', 'Analytics',
      'Documents', 'Revenue Pools', 'Alerts'
    ],
  };

  if (!role || role === 'general' || !allowedByRole[role]) {
    return modules;
  }

  let isTeamLead = userRoles.some(r => ['team_lead', 'admin'].includes(r.toLowerCase()));
  let allowed = [...allowedByRole[role]];
  if (role === 'builder' && isTeamLead) {
    if (!allowed.includes('Task Approval')) {
      allowed.push('Task Approval');
    }
  }

  return modules.filter(mod => allowed.includes(mod.label));
}

export function sfDriveSection(id) {
  return {
    id,
    icon: <FolderOpen size={22} />,
    href: "/sf-drive",
    label: "SF Drive",
    subItems: [
      { id: "my-drive", href: "/sf-drive", label: "My Drive", icon: <FolderOpen size={18} /> },
      { id: "shared-with-me", href: "/sf-drive/shared", label: "Shared with me", icon: <Users size={18} /> },
      { id: "recent", href: "/sf-drive/recent", label: "Recent", icon: <Clock size={18} /> },
      { id: "starred", href: "/sf-drive/starred", label: "Starred", icon: <Star size={18} /> },
      { id: "trash", href: "/sf-drive/trash", label: "Trash", icon: <Trash2 size={18} /> },
    ],
  };
}

export function sfMeetSection(id) {
  return {
    id,
    icon: <Video size={22} />,
    href: "/meet",
    label: "SF Meet",
    subItems: [
      // Starting a call is the primary action, so it leads.
      { id: "start-call", href: "/meet?start=1", label: "Start a Call", icon: <VideoIcon size={18} /> },
      { id: "all-meetings", href: "/meet", label: "All Meetings", icon: <Video size={18} /> },
      { id: "upcoming-meetings", href: "/meet/upcoming", label: "Upcoming", icon: <CalendarClock size={18} /> },
      { id: "past-meetings", href: "/meet/past", label: "Past Meetings", icon: <Clock size={18} /> },
      { id: "recordings", href: "/meet/recordings", label: "Recordings", icon: <VideoIcon size={18} /> },
    ],
  };
}