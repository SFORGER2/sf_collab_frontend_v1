// src/components/sections/WorkspaceSwitcher.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ChevronDown, Plus, Check, Building2, X } from "lucide-react";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { createPortal } from 'react-dom';
import { workspaceAPI } from '../../services/workspaceAPI';
import { setUser } from '../../services/auth/authSlice';
import { fetchUserProfile } from '../../services/auth/authThunks';

const WorkspaceSwitcher = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const currentWorkspaceId = user?.active_workspace_id;
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceSlug, setNewWorkspaceSlug] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId);

  const loadWorkspaces = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await workspaceAPI.getMyWorkspaces();
      setWorkspaces(data);
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) loadWorkspaces();
  }, [isOpen, user]);

  useEffect(() => {
    if (newWorkspaceName) {
      const generatedSlug = newWorkspaceName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setNewWorkspaceSlug(generatedSlug);
    }
  }, [newWorkspaceName]);

  const handleSwitch = async (workspaceId) => {
    setLoading(true);
    try {
      await workspaceAPI.switchWorkspace(workspaceId);
      const userData = await dispatch(fetchUserProfile()).unwrap();
      dispatch(setUser(userData));
      window.location.reload();
    } catch (err) {
      console.error('Failed to switch workspace:', err);
      setError('Failed to switch workspace');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

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
      const userData = await dispatch(fetchUserProfile()).unwrap();
      dispatch(setUser(userData));
      setShowCreateModal(false);
      setNewWorkspaceName('');
      setNewWorkspaceSlug('');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create workspace');
    } finally {
      setCreating(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <Tippy
        content={
          <div className="w-64 bg-[#1a1a1a] border border-[#262626] rounded-xl overflow-hidden">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">Your Workspaces</div>
              {loading ? (
                <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
              ) : workspaces.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">No workspaces yet</div>
              ) : (
                workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => handleSwitch(ws.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      ws.id === currentWorkspaceId ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300 hover:bg-[#262626]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 size={16} />
                      <span className="text-sm">{ws.name}</span>
                    </div>
                    {ws.id === currentWorkspaceId && <Check size={14} />}
                  </button>
                ))
              )}
            </div>
            <div className="border-t border-[#262626] p-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:bg-[#262626] rounded-lg transition-colors"
              >
                <Plus size={16} />
                Create New Workspace
              </button>
            </div>
          </div>
        }
        visible={isOpen}
        interactive
        placement="bottom-end"
        onClickOutside={() => setIsOpen(false)}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border border-[#262626] rounded-lg hover:bg-[#262626] transition-colors"
        >
          <Building2 size={16} />
          <span className="text-sm font-medium max-w-[120px] truncate">
            {currentWorkspace?.name || 'Select Workspace'}
          </span>
          <ChevronDown size={14} />
        </button>
      </Tippy>

      {showCreateModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-8 w-full max-w-md shadow-2xl relative z-[99999]">
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
                  className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
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
                  className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
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
                  className="flex-1 py-2 bg-[#262626] text-white rounded-lg hover:bg-[#333] transition-colors"
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
        </div>,
        document.body
      )}
    </>
  );
};

export default WorkspaceSwitcher;