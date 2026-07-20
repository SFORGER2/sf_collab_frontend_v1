// src/components/erp/layout/ERPLayout.jsx
import { useState, useEffect, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LayoutDashboard } from 'lucide-react';
import { ERPSidebar } from './ERPSidebar';
import { ERPHeader } from './ERPHeader';
import { CreateWorkspaceForm } from '../CreateWorkspaceForm';
import { workspaceAPI } from '@/services/workspaceAPI';
import { createLinks } from '@/components/pages/sidebars/sidebar/links';
import { createFounderLinks } from '@/components/pages/sidebars/founderSidebar/FounderLinks';
import { createBuilderLinks } from '@/components/pages/sidebars/builderSidebar/BuilderLinks';
import { createInfluencerLinks } from '@/components/pages/sidebars/influencerSidebar/influencerLinks';
import { createInvestorLinks } from '@/components/pages/sidebars/investorSidebar/InvestorLinks';
import { filterERPModules } from '@/components/pages/sidebars/sidebarCommons';

export function ERPLayout({ activeRole, userRoles, user }) {
  const [collapsed, setCollapsed] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasWorkspace, setHasWorkspace] = useState(false);
  const navigate = useNavigate();

  // Compute links based on role (same as Layout)
  const links = useMemo(() => {
    const unread = 0;
    const dummySetActiveRole = () => {};
    switch (activeRole) {
      case 'founder':
        return createFounderLinks(unread, userRoles, dummySetActiveRole, activeRole);
      case 'builder':
        return createBuilderLinks(unread, userRoles, dummySetActiveRole, activeRole);
      case 'influencer':
        return createInfluencerLinks(unread, userRoles, dummySetActiveRole, activeRole);
      case 'investor':
        return createInvestorLinks(unread, userRoles, dummySetActiveRole, activeRole);
      default:
        return createLinks(unread, userRoles, dummySetActiveRole);
    }
  }, [activeRole, userRoles]);

  // Extract ERP section and filter by role
  const erpSection = links.find(link => link.label === 'ERP');
  let modules = erpSection ? filterERPModules(erpSection.subItems, activeRole, userRoles) : [];

  // ── Override the dashboard module ──────────────────────────────────────
  // Remove any existing dashboard modules that point outside ERP
  modules = modules.filter(m => m.id !== 'erp-member-dashboard' && m.id !== 'erp-workspace-dashboard');

  // Add a custom "Dashboard" item that points to /erp
  const dashboardItem = {
    id: 'erp-dashboard',
    label: 'Dashboard',
    href: '/erp',
    icon: <LayoutDashboard size={18} />,
  };

  // Insert dashboard at the beginning
  const sidebarModules = [dashboardItem, ...modules];

  // Load workspaces
  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const data = await workspaceAPI.getMyWorkspaces();
        setWorkspaces(data);
        setHasWorkspace(data.length > 0);
      } catch (err) {
        console.error('Failed to load workspaces', err);
        setHasWorkspace(false);
      } finally {
        setLoading(false);
      }
    };
    loadWorkspaces();
  }, []);

  const workspaceName = user?.activeWorkspace?.name || (workspaces.length > 0 ? workspaces[0].name : 'My Workspace');

  // If loading, show spinner
  if (loading) {
    return (
      <div className="h-screen bg-[#09090B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // If no workspace, show full-screen creation form
  if (!hasWorkspace) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-8">
        <CreateWorkspaceForm onSuccess={() => {
          setHasWorkspace(true);
          navigate('/erp');
        }} />
      </div>
    );
  }

  // Workspace exists – render full ERP layout
  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
      <ERPHeader
        workspaceName={workspaceName}
        onSearch={() => {}}
        onNotifications={() => navigate('/erp/alerts')}
      />
      <div className="flex flex-1 overflow-hidden">
        <ERPSidebar
          modules={sidebarModules}
          workspaceName={workspaceName}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}