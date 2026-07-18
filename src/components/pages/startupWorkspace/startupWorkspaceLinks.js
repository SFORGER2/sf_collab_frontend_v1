// src/components/pages/startupWorkspace/startupWorkspaceLinks.js
//
// Module list for the Startup Workspace (spec section 10):
//   Startup Dashboard, Startup Scoring, CRM, ERP, Hiring, Marketplace,
//   Financial Management, Investor Portal, Crowdfunding, Analytics,
//   Advanced Team Management, Business Intelligence, Automation, Integrations
//
// `internal: true`  -> rendered inside the Startup Workspace layout (nested route)
// `internal: false` -> an existing top-level module elsewhere in the app

import {
  LayoutDashboard, Gauge, Contact, Building2, UserPlus2, ShoppingBag,
  Wallet, Handshake, Rocket, BarChart3, Users2, BrainCircuit, Bot, Plug,
  Sparkles, Users
} from 'lucide-react';

export const getStartupWorkspaceModules = (startupId) => [
  {
    id: 'sw-dashboard',
    label: 'Startup Dashboard',
    icon: LayoutDashboard,
    href: `/startup-workspace/${startupId}`,
    internal: true,
    group: 'Overview',
  },
  {
    id: 'sw-scoring',
    label: 'Startup Scoring',
    icon: Gauge,
    href: `/startup-workspace/${startupId}/scoring`,
    internal: true,
    group: 'Overview',
  },
  {
    id: 'sw-crm',
    label: 'CRM',
    icon: Contact,
    href: `/startup-workspace/${startupId}/crm`,
    internal: true,
    group: 'Growth',
  },
  {
    id: 'sw-erp',
    label: 'ERP',
    icon: Building2,
    href: `/erp`,
    internal: false,
    requiresWorkspaceSwitch: true,
    group: 'Operations',
  },
  {
    id: 'sw-hiring',
    label: 'Hiring',
    icon: UserPlus2,
    href: `/startup-workspace/${startupId}/hiring`,
    internal: true,
    group: 'Growth',
  },
  {
    id: 'sw-mentors',
    label: 'Mentors',
    icon: Sparkles,
    href: `/startup-workspace/${startupId}/mentors`,
    id: 'sw-candidates',
    label: 'Candidates',
    icon: Users,
    href: `/startup-workspace/${startupId}/candidates`,
    internal: true,
    group: 'Growth',
  },
  {
    id: 'sw-marketplace',
    label: 'Marketplace',
    icon: ShoppingBag,
    href: `/marketplace`,
    internal: false,
    group: 'Growth',
  },
  {
    id: 'sw-financial',
    label: 'Financial Management',
    icon: Wallet,
    href: `/startup-workspace/${startupId}/financials`,
    internal: true,
    group: 'Operations',
  },
  {
    id: 'sw-investor-portal',
    label: 'Investor Portal',
    icon: Handshake,
    href: `/startup-workspace/${startupId}/investor-portal`,
    internal: true,
    group: 'Growth',
  },
  {
    id: 'sw-crowdfunding',
    label: 'Crowdfunding',
    icon: Rocket,
    href: `/crowdfunding`,
    internal: false,
    group: 'Growth',
  },
  {
    id: 'sw-analytics',
    label: 'Analytics',
    icon: BarChart3,
    href: `/erp/admin-analytics`,
    internal: false,
    requiresWorkspaceSwitch: true,
    group: 'Insights',
  },
  {
    id: 'sw-team',
    label: 'Advanced Team Management',
    icon: Users2,
    href: `/founder/my-team`,
    internal: false,
    group: 'Operations',
  },
  {
    id: 'sw-bi',
    label: 'Business Intelligence',
    icon: BrainCircuit,
    href: `/startup-workspace/${startupId}/business-intelligence`,
    internal: true,
    group: 'Insights',
  },
  {
    id: 'sw-automation',
    label: 'Automation',
    icon: Bot,
    href: `/startup-workspace/${startupId}/automation`,
    internal: true,
    group: 'Insights',
  },
  {
    id: 'sw-integrations',
    label: 'Integrations',
    icon: Plug,
    href: `/startup-workspace/${startupId}/integrations`,
    internal: true,
    group: 'Insights',
  },
];

export const STARTUP_WORKSPACE_GROUP_ORDER = ['Overview', 'Operations', 'Growth', 'Insights'];