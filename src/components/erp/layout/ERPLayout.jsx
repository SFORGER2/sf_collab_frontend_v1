// src/components/erp/layout/ERPLayout.jsx
import { useState, useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AdSlot } from '@/components/cosmos';
import { placementFor, wantsTopAd } from '@/components/cosmos/adPlacements';
import { useSelector } from 'react-redux';
import { LayoutDashboard, Sparkles } from 'lucide-react';
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

// ── Animated background particles (optional decorative element) ──────────
const BackgroundGlow = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
    <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
    <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/5 rounded-full blur-3xl animate-pulse delay-500" />
  </div>
);

export function ERPLayout({ activeRole, userRoles, user }) {
  const [collapsed, setCollapsed] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasWorkspace, setHasWorkspace] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // ── Links (unchanged) ──────────────────────────────────────────────────────
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

  const erpSection = links.find(link => link.label === 'ERP');
  let modules = erpSection ? filterERPModules(erpSection.subItems, activeRole, userRoles) : [];
  modules = modules.filter(m => m.id !== 'erp-member-dashboard' && m.id !== 'erp-workspace-dashboard');
  const dashboardItem = {
    id: 'erp-dashboard',
    label: 'Dashboard',
    href: '/erp/member-dashboard',
    icon: <LayoutDashboard size={18} />,
  };
  const sidebarModules = [dashboardItem, ...modules];

  // ── Workspace loading (unchanged) ─────────────────────────────────────────
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

  const workspaceName = useMemo(() => {
    if (!workspaces.length) return 'My Workspace';
    const activeId = user?.active_workspace_id;
    if (activeId) {
      const activeWorkspace = workspaces.find(w => w.id === activeId);
      if (activeWorkspace) return activeWorkspace.name;
    }
    return workspaces[0].name;
  }, [workspaces, user?.active_workspace_id]);

  // ── Loading state with enhanced spinner ──────────────────────────────────
  if (loading) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-zinc-700 border-t-indigo-500 shadow-lg shadow-indigo-500/20"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 text-zinc-500 text-sm font-medium tracking-wider"
        >
          Loading workspace…
        </motion.p>
      </div>
    );
  }

  // ── No workspace ──────────────────────────────────────────────────────────
  if (!hasWorkspace) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CreateWorkspaceForm
            onSuccess={() => {
              setHasWorkspace(true);
              navigate('/erp');
            }}
          />
        </motion.div>
      </div>
    );
  }

  // ── Main Layout ────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a] text-white overflow-hidden relative">
      {/* Decorative background glow */}
      <BackgroundGlow />

      {/* Header with glass effect */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-20"
      >
        <ERPHeader
          workspaceName={workspaceName}
          onSearch={() => {}}
          onNotifications={() => navigate('/erp/alerts')}
        />
      </motion.div>

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Sidebar with entrance animation */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="shrink-0"
        >
          <ERPSidebar
            modules={sidebarModules}
            workspaceName={workspaceName}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
        </motion.div>

        {/* Main content area with glass-morphism and page transitions */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent relative">
          {/* Subtle glass overlay on the background */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent opacity-30" />

          {/* Ad slot with animation */}
          {wantsTopAd(location.pathname) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-5"
            >
              <AdSlot
                placement={placementFor(location.pathname)}
                format="strip"
                className="rounded-2xl overflow-hidden shadow-lg shadow-indigo-500/5"
              />
            </motion.div>
          )}

          {/* Page content with route transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative z-10"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>

          {/* Decorative sparkle in corner (graphical touch) */}
          <div className="fixed bottom-8 right-8 pointer-events-none opacity-10">
            <Sparkles size={80} className="text-indigo-400" />
          </div>
        </main>
      </div>
    </div>
  );
}