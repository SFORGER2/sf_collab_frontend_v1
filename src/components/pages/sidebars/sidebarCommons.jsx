import {
  BarChart3, Bookmark, BookOpen, Bot, BrainCircuit, BriefcaseBusiness,
  Calculator, CaptionsIcon, ClipboardList, Cpu, Database, Earth,
  FileSignature, FileTerminal, FileText, Images, Lightbulb, LightbulbIcon,
  MessageSquare, MessageSquareHeart, Rss, StickyNote, TrendingUp,
  UserPlus, Users, VideoIcon, Wallet, Wand2, CalendarClock, FileStack,
  Bell, DollarSign, BarChart2, Award,
  CheckCircle, LayoutDashboard    // ✅ Added missing import
} from "lucide-react";
import { BsGear, BsPeople } from "react-icons/bs";
import { IoChatbubbles } from "react-icons/io5";
import { LuLayoutDashboard } from "react-icons/lu";
import { SiBoardgamegeek } from "react-icons/si";

export function aiTools(id) {
  return {
    id,
    icon: <BrainCircuit size={23} />,
    href: "/ai-dashboard",
    label: "AI Tools",
    subItems: [
      { id: "logo-generator", href: "/logo-generator", label: "Logo Generator", icon: <Wand2 size={18} /> },
      { id: "business-plan", href: "/business-plan", label: "Business Plan", icon: <ClipboardList size={18} /> },
      { id: "qwen-chat", href: "/qwen-chat", label: "Qwen Chat", icon: <Bot size={18} /> },
      { id: "data-scraper", href: "/data-scraper", label: "Data Scraper", icon: <Database size={18} /> },
      { id: "multimodal-images", href: "/multimodal-images", label: "Multimodal Images", icon: <Images size={18} /> },
      { id: "video-generator", href: "/video-generator", label: "Video Generator", icon: <VideoIcon size={18} /> },
      { id: "caption-generator", href: "/caption-generator", label: "Caption Generator", icon: <CaptionsIcon size={18} /> },
    ],
  };
};

export function toolsSection(id) {
  return {
    id,
    icon: <BsGear size={23} />,
    href: "/tools-dashboard",
    label: "Tools",
    subItems: [
      { id: "calculator", href: "/calculator", label: "Calculator", icon: <Calculator size={18} /> },
      { id: "pdf-signing", href: "/pdf-signing", label: "PDF Signing", icon: <FileSignature size={18} /> },
      { id: "notes", href: "/notes", label: "Notes", icon: <StickyNote size={18} /> },
      // { id: "board", href: "/board", label: "Board", icon: <SiBoardgamegeek size={18} /> },
    ],
  }
}
export function dashboardLink(userRoles = [], setActiveRole) {
  return {
    id: 1,
    icon: <LuLayoutDashboard size={22} />,
    href: "/dashboard",
    label: "Dashboard",
    subItems: userRoles ? userRoles.map((role) => ({
      id: `${role}-dashboard`,
      onLinkClick: () => {
        setActiveRole(role)
      },
      href: `/dashboard`,
      icon: role === 'founder' 
        ? <BriefcaseBusiness size={18} />
        : role === 'investor' 
        ? <BarChart3 size={18} />
        : role === 'builder' 
        ? <Cpu size={18} />
        : role === 'influencer' 
        ? <IoChatbubbles size={18} />
        : <LuLayoutDashboard size={18} />,
      label: `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`,
    })) : [],
  }
}

export function socialSection(id) {
  return {
      id,
      icon: <Rss size={22} />,
      href: "/posts",
      label: "Social Feed",
      subItems: [
        { id: "posts-feed", href: "/posts", label: "Social Feed", icon: <MessageSquareHeart size={18} /> },
        { id: "connections", href: "/connections", label: "Connections", icon: <UserPlus size={18} /> },
        { id: "discover-users", href: "/discover-users", label: "Discover Users", icon: <Users size={18} /> },
      ],
    }
}

export function erpSection(id) {
  return {
    id,
    icon: <BriefcaseBusiness size={22} />,
    href: "/erp/member-dashboard",   // start with member dashboard (personal)
    label: "ERP",
    subItems: [
      // Personal / member‑facing (core workflow)
      { id: "erp-member-dashboard", href: "/erp/member-dashboard", label: "Member Dashboard", icon: <LayoutDashboard size={18} /> },
      { id: "erp-attendance",    href: "/erp/attendance",    label: "My Attendance",    icon: <CalendarClock size={18} /> },
      { id: "erp-tasks",         href: "/erp/tasks",         label: "Task Board",       icon: <ClipboardList size={18} /> },
      { id: "erp-task-approval", href: "/erp/task-approval", label: "Task Approval",    icon: <CheckCircle size={18} /> },
      { id: "erp-updates",       href: "/erp/updates",       label: "Daily Updates",    icon: <FileStack size={18} /> },
      { id: "erp-points",        href: "/erp/points",        label: "Points Dashboard", icon: <Award size={18} /> },
      { id: "erp-analytics",     href: "/erp/analytics",     label: "Analytics",        icon: <BarChart3 size={18} /> },
      { id: "erp-my-analytics",  href: "/erp/my-analytics",  label: "My Analytics",     icon: <BarChart2 size={18} /> },
      { id: "erp-payouts",       href: "/erp/payouts",       label: "Payouts",          icon: <DollarSign size={18} /> },
      { id: "erp-documents",     href: "/erp/documents",     label: "Documents",        icon: <FileTerminal size={18} /> },
      { id: "erp-alerts",        href: "/erp/alerts",        label: "Alerts",           icon: <Bell size={18} /> },

      // Admin / workspace management (grouped at the end)
      { id: "erp-workspace-dashboard", href: "/erp/workspace-dashboard", label: "Workspace Dashboard", icon: <TrendingUp size={18} /> },
      { id: "erp-admin-settings",      href: "/erp/admin-settings",      label: "Admin Settings",      icon: <Settings size={18} /> },
      { id: "erp-admin-revenue",       href: "/erp/admin/revenue-pools", label: "Revenue Pools",       icon: <Coins size={18} /> },
      { id: "erp-admin-payouts",       href: "/erp/admin/payouts",       label: "Admin Payouts",       icon: <CreditCard size={18} /> },
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
      { id: "wallet", href: "/wallet", label: "My Wallet", icon: <Wallet size={18} /> },
      { id: "store", href: "/store", label: "SF Store", icon: <TrendingUp size={18} /> },
      { id: "leaderboard", href: "/leaderboard", label: "Leaderboard", icon: <TrendingUp size={18} /> },
    ]
  }
}

export function ideation(id) {
  return {
      id,
      icon: <LightbulbIcon size={22} />,
      href: "/ideation",
      label: "Vision",
      subItems: [
        { id: "vision-board", href: "/ideation", label: "Vision Board", icon: <LightbulbIcon size={18} /> },
        { id: "saved-visions", href: "/saved-ideas", label: "Saved Visions", icon: <Bookmark size={18} /> },
        { id: "knowledge-resources", href: "/knowledge", label: "Knowledge Resources", icon: <BookOpen size={18} /> },
      ]
    }
}