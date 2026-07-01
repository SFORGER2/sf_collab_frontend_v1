// src/components/pages/erp/ERPLandingPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, ChevronDown, Check, Plus, X, 
  BriefcaseBusiness, ArrowRight
} from 'lucide-react';
import { workspaceAPI } from '../../../services/workspaceAPI';
import { setUser } from '../../../services/auth/authSlice';
import { fetchUserProfile } from '../../../services/auth/authThunks';

// Import link builders (same as Layout)
import { createLinks } from '@/components/pages/sidebars/sidebar/links';
import { createFounderLinks } from '@/components/pages/sidebars/founderSidebar/FounderLinks';
import { createBuilderLinks } from '@/components/pages/sidebars/builderSidebar/BuilderLinks';
import { createInfluencerLinks } from '@/components/pages/sidebars/influencerSidebar/influencerLinks';
import { createInvestorLinks } from '@/components/pages/sidebars/investorSidebar/InvestorLinks';

// Helper to get ERP section
const getERPSection = (links) => links.find(link => link.label === 'ERP');

const ERPLandingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // ── Get active role (same as Layout) ──
  const activeRole = localStorage.getItem('activeRole') || 'general';
  const userRoles = user?.roles || [];

  // ── Build links ──
  const links = useMemo(() => {
    const unread = 0;
    const dummySetActiveRole = () => {};
    switch (activeRole) {
      case 'founder':
        return createFounderLinks(unread, userRoles, dummySetActiveRole);
      case 'builder':
        return createBuilderLinks(unread, userRoles, dummySetActiveRole);
      case 'influencer':
        return createInfluencerLinks(unread, userRoles, dummySetActiveRole);
      case 'investor':
        return createInvestorLinks(unread, userRoles, dummySetActiveRole);
      default:
        return createLinks(unread, userRoles, dummySetActiveRole);
    }
  }, [activeRole, userRoles]);

  // ── Extract ERP modules ──
  const erpSection = getERPSection(links);
  const modules = erpSection?.subItems || [];

  // ── Workspace state ──
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceSlug, setNewWorkspaceSlug] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // ── Load workspaces ──
  const loadWorkspaces = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await workspaceAPI.getMyWorkspaces();
      setWorkspaces(data);
      const activeId = user.active_workspace_id;
      if (activeId && data.some(w => w.id === activeId)) {
        setSelectedWorkspaceId(activeId);
      } else if (data.length > 0) {
        setSelectedWorkspaceId(data[0].id);
      } else {
        setSelectedWorkspaceId(null);
      }
    } catch (err) {
      console.error('Failed to load workspaces', err);
      setError('Could not load workspaces');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  // ── Workspace switch ──
  const handleSwitchWorkspace = async (workspaceId) => {
    try {
      await workspaceAPI.switchWorkspace(workspaceId);
      const userData = await dispatch(fetchUserProfile()).unwrap();
      dispatch(setUser(userData));
      setSelectedWorkspaceId(workspaceId);
      setIsDropdownOpen(false);
    } catch (err) {
      console.error('Failed to switch workspace', err);
      setError('Failed to switch workspace');
    }
  };

  // ── Workspace creation ──
  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) {
      setError('Workspace name is required');
      return;
    }
    const slug = newWorkspaceSlug.trim() || newWorkspaceName.toLowerCase().replace(/\s+/g, '-');
    setCreating(true);
    setError('');
    try {
      await workspaceAPI.createWorkspace(newWorkspaceName, slug);
      await loadWorkspaces();
      const updatedWorkspaces = await workspaceAPI.getMyWorkspaces();
      const newWorkspace = updatedWorkspaces.find(w => w.name === newWorkspaceName);
      if (newWorkspace) {
        await handleSwitchWorkspace(newWorkspace.id);
      }
      setShowCreateModal(false);
      setNewWorkspaceName('');
      setNewWorkspaceSlug('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create workspace');
    } finally {
      setCreating(false);
    }
  };

  const currentWorkspace = workspaces.find(w => w.id === selectedWorkspaceId);

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-zinc-500">Loading workspaces...</div>
      </div>
    );
  }

  // ── No workspace: show creation form ──
  if (workspaces.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white px-2 md:px-4 py-8 flex items-center justify-center">
        {/* Animated background */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
          <div className="absolute top-1/4 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
              <BriefcaseBusiness className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-blue-300 uppercase tracking-widest">
              ERP Suite
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Workspace Required
            </h1>
            <p className="text-gray-400 text-lg mt-2">
              Create your first workspace to access ERP modules
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <form onSubmit={handleCreateWorkspace}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Workspace Name *</label>
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="My Workspace"
                  autoFocus
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Slug (URL identifier)</label>
                <input
                  type="text"
                  value={newWorkspaceSlug}
                  onChange={(e) => setNewWorkspaceSlug(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="my-workspace"
                />
                <p className="text-xs text-gray-500 mt-1">Auto‑generated from name. Can be edited.</p>
              </div>
              {error && (
                <div className="mb-4 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={creating || !newWorkspaceName.trim()}
                className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {creating ? 'Creating...' : 'Create Workspace'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Workspace exists: show full dashboard with modules ──
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  // Gradient array for cards
  const gradients = [
    'from-blue-600 to-cyan-600',
    'from-purple-600 to-indigo-600',
    'from-pink-600 to-rose-600',
    'from-emerald-600 to-green-600',
    'from-orange-600 to-amber-600',
    'from-red-600 to-pink-600',
    'from-yellow-600 to-orange-600',
    'from-slate-600 to-gray-600',
  ];

  return (
    <div className="min-h-screen bg-black text-white px-2 md:px-4 py-8">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        <div className="absolute top-1/4 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
            <BriefcaseBusiness className="w-6 h-6 text-white" />
          </div>
          <span className="text-sm font-semibold text-blue-300 uppercase tracking-widest">
            ERP Suite
          </span>
        </div>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-center items-center gap-4">
            <div>
              <h1 className="text-center text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Workspace ERP
              </h1>
              <p className="text-gray-400 text-lg mt-2 text-center">
                Manage attendance, tasks, documents, and more
              </p>
            </div>
          </div>
        </motion.div>

        {/* Workspace & Stats Card (with dropdown) */}
        <motion.div
          className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-2xl mx-auto relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Active Workspace</p>
                <p className="text-xl font-bold text-white">{currentWorkspace?.name || 'None'}</p>
              </div>
            </div>

            {/* Workspace & Stats Card (with dropdown) */}
<motion.div
  className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-2xl mx-auto relative"
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.4 }}
>
  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
        <Building2 className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-sm text-slate-400 font-medium">Active Workspace</p>
        <p className="text-xl font-bold text-white">{currentWorkspace?.name || 'None'}</p>
      </div>
    </div>

    {/* Workspace Selector (dropdown) - high z-index */}
    <div className="relative z-[9999]">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
      >
        <span className="text-sm font-medium">Switch</span>
        <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-[99999] overflow-hidden">
          <div className="p-2">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => handleSwitchWorkspace(ws.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                  ws.id === selectedWorkspaceId
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <span className="text-sm">{ws.name}</span>
                {ws.id === selectedWorkspaceId && <Check size={14} />}
              </button>
            ))}
          </div>
          <div className="border-t border-white/10 p-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Plus size={16} />
              Create New Workspace
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
</motion.div>
          </div>
        </motion.div>

        {/* 🚀 REMOVED Feature Highlights Section – no longer present */}

        {/* Modules Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {modules.map((module, index) => {
            const gradient = gradients[index % gradients.length];
            return (
              <motion.div
                key={module.id}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="ai-tool"
              >
                <div
                  onClick={() => navigate(module.href)}
                  className="group relative block rounded-2xl overflow-hidden transition-all duration-300 h-full cursor-pointer"
                >
                  {/* Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-2xl border border-white/10 group-hover:border-white/20 transition-colors" />

                  {/* Animated Gradient Overlay */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${gradient} blur-2xl`} />

                  {/* Border Glow */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

                  {/* Content */}
                  <div className="relative z-10 p-6 sm:p-8 h-full flex flex-col">
                    {/* Icon */}
                    <div className="mb-4">
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        {module.icon}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-lg sm:text-xl text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 group-hover:bg-clip-text transition-all duration-300">
                      {module.label}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-300 text-sm flex-1 mb-6 group-hover:text-white transition-colors duration-300">
                      Manage your {module.label.toLowerCase()}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <span className="text-white opacity-70 group-hover:opacity-100 transition-opacity">
                        Launch
                      </span>
                      <ArrowRight className="w-4 h-4 text-white opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>

                  {/* Corner Accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* ── Create Workspace Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Create New Workspace</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateWorkspace}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Workspace Name *</label>
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="My Workspace"
                  autoFocus
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Slug (URL identifier)</label>
                <input
                  type="text"
                  value={newWorkspaceSlug}
                  onChange={(e) => setNewWorkspaceSlug(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="my-workspace"
                />
                <p className="text-xs text-gray-500 mt-1">Auto‑generated from name. Can be edited.</p>
              </div>
              {error && (
                <div className="mb-4 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newWorkspaceName.trim()}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ERPLandingPage;