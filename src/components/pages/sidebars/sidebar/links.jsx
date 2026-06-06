import React from "react";
import {
  BrainCircuit, BriefcaseBusiness, Lightbulb, PlusSquare, Rocket,
  FileText, Users, Wand2, Database, BookOpen, Earth, MessageSquareHeart,
  Building, Building2, Save, Layers, Wallet, ShoppingBag, Coins,
  Trophy, ShoppingCart, GraduationCap, LayoutDashboard, Search, Star,
} from "lucide-react";
import { LuLayoutDashboard, LuEye } from "react-icons/lu";
import { createInvestorLinks } from "../investorSidebar/InvestorLinks";
import { createBuilderLinks } from "../builderSidebar/BuilderLinks";
import { createFounderLinks } from "../founderSidebar/FounderLinks";
import { createInfluencerLinks } from "../influencerSidebar/influencerLinks";
import { BsPeople } from "react-icons/bs";
import { aiTools, dashboardLink, erpSection, ideation, socialSection, toolsSection } from "../sidebarCommons";
import { aiTools, dashboardLink, erpSection, ideation, socialSection, toolsSection } from "../sidebarCommons";

export const CONTEXT_THEME = {
  1:  { pillBg: "bg-blue-600/20",    pillText: "text-blue-200",   activeBg: "bg-white", activeText: "text-gray-950" },
  2:  { pillBg: "bg-yellow-600/15",  pillText: "text-yellow-100", activeBg: "bg-white", activeText: "text-gray-950" },
  3:  { pillBg: "bg-purple-600/15",  pillText: "text-purple-100", activeBg: "bg-white", activeText: "text-gray-950" },
  5:  { pillBg: "bg-emerald-600/15", pillText: "text-emerald-100",activeBg: "bg-white", activeText: "text-gray-950" },
  6:  { pillBg: "bg-indigo-600/15",  pillText: "text-white-100",  activeBg: "bg-white", activeText: "text-gray-950" },
  10: { pillBg: "bg-amber-600/15",   pillText: "text-amber-100",  activeBg: "bg-white", activeText: "text-gray-950" },
};

export function createLinks(unreadMessagesCount, userRoles = [], setActiveRole) {
  return [
    dashboardLink(userRoles, setActiveRole),
    {
      id: 3,
      icon: <Rocket size={21} />,
      href: "/discover-startups",
      label: "Startups",
      subItems: [
        { id: "discover-startups", href: "/discover-startups", label: "Discover",       icon: <Rocket size={18} /> },
        { id: "my-startups",       href: "/my-startups",       label: "My Startups",    icon: <Building2 size={18} /> },
        { id: "register-startup",  href: "/register-startup",  label: "Register",       icon: <PlusSquare size={18} /> },
        { id: "saved-startups",    href: "/saved-startups",    label: "Saved Startups", icon: <Save size={18} /> },
      ],
    },
    ideation(4),
    erpSection(5),
    socialSection(6),
    {
      id: 7,
      icon: <BookOpen size={22} />,
      href: "/knowledge",
      label: "Learning",
      subItems: [
        { id: "knowledge",              href: "/knowledge",              label: "Knowledge",        icon: <BookOpen size={18} /> },
        { id: "mentors",                href: "/mentors",                label: "Find a Mentor",    icon: <Search size={18} /> },
        { id: "mentor-dashboard",       href: "/mentor-dashboard",       label: "Mentor Dashboard", icon: <GraduationCap size={18} /> },
        { id: "my-mentorship-requests", href: "/my-mentorship-requests", label: "My Requests",      icon: <Star size={18} /> },
      ],
    },
    aiTools(8),
    toolsSection(9),
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
  ];
}

export function getAllRoutes(element) {
  let routes = [];
  if (element.href) routes.push(element.href);
  if (Array.isArray(element.subItems)) {
    for (const item of element.subItems) {
      if (routes.includes(item.href)) continue;
      routes = routes.concat(getAllRoutes(item));
    }
  }
  return routes;
}

export function getCurrentContext(pathname) {
  // FIX: removed duplicate wallet check and duplicate `const links` declaration
  const links = createLinks(0);
  for (const link of links) {
    if (link.href && pathname.startsWith(link.href)) return link.id;
    for (const subItem of link.subItems || []) {
      if (subItem.href && pathname.startsWith(subItem.href)) return link.id;
    }
  }
  return 1;
}

export function getTopNavLinks(pathname, unreadMessagesCount = 0, activeMode = 'general') {
  const contextId = getCurrentContext(pathname);
  let links = [];
  switch (activeMode) {
    case 'investor':   links = createInvestorLinks(unreadMessagesCount); break;
    case 'builder':    links = createBuilderLinks(unreadMessagesCount); break;
    case 'founder':    links = createFounderLinks(unreadMessagesCount); break;
    case 'influencer': links = createInfluencerLinks(unreadMessagesCount); break;
    default:           links = createLinks(unreadMessagesCount);
  }
  const activeLink = links.find((l) => l.id === contextId);
  return activeLink?.subItems || [];
}