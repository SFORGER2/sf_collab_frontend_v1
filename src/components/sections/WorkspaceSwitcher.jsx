// src/components/sections/WorkspaceSwitcher.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Plus, Building2, X } from "lucide-react";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { createPortal } from 'react-dom';
import { workspaceAPI } from '../../services/workspaceAPI';
import { setUser } from '../../services/auth/authSlice';
import { fetchUserProfile } from '../../services/auth/authThunks';

const WorkspaceSwitcher = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
      setIsOpen(false);
      // Navigate to the workspace dashboard instead of a full reload
      navigate('/erp');
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
      navigate('/erp');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create workspace');
    } finally {
      setCreating(false);
    }
  };

  // Optimistic toggle: UI updates immediately, reverts on error
  const handleToggle = async (ws, newStatus) => {
    // 1. Optimistically update local state
    const previousWorkspaces = workspaces;
    const optimisticWorkspaces = workspaces.map(w =>
      w.id === ws.id ? { ...w, is_active: newStatus } : w
    );
    setWorkspaces(optimisticWorkspaces);

    try {
      // 2. Call the API
      await workspaceAPI.updateWorkspace(ws.id, { is_active: newStatus });

      // 3. (Optional) Re-fetch to ensure consistency with server
      const fresh = await workspaceAPI.getMyWorkspaces();
      setWorkspaces(fresh);

      // 4. If we just disabled the current workspace, switch to another active one
      if (!newStatus && ws.id === currentWorkspaceId) {
        const activeWorkspace = fresh.find(w => w.is_active);
        if (activeWorkspace) {
          await handleSwitch(activeWorkspace.id);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      // 5. Revert to previous state on error
      setWorkspaces(previousWorkspaces);
      console.error('Failed to toggle workspace status:', err);
      setError(err.response?.data?.error || 'Failed to update workspace');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (!user) return null;

  return (
    <>
      <Tippy
        content={
          <div className="w-72 bg-[#1a1a1a] border border-[#262626] rounded-xl shadow-2xl overflow-hidden">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Your Workspaces
              </div>

              {loading ? (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">Loading...</div>
              ) : workspaces.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">No workspaces yet</div>
              ) : (
                <div className="max-h-72 overflow-y-auto custom-scrollbar">
                  {workspaces.map((ws) => (
                    <div
                      key={ws.id}
                      className={`flex items-center px-3 py-2 rounded-lg ${
                        ws.id === currentWorkspaceId
                          ? "bg-blue-600/20 text-blue-400"
                          : "hover:bg-[#262626] text-gray-300"
                      }`}
                    >
                      {/* Workspace name – click to switch */}
                      <button
                        onClick={() => handleSwitch(ws.id)}
                        className="flex flex-1 items-center gap-3 min-w-0 text-left"
                      >
                        <Building2 size={16} className="shrink-0" />
                        <span className="truncate text-sm">{ws.name}</span>
                      </button>

                      {/* Toggle switch – only for owners/admins */}
                      {(ws.is_owner || ws.role === 'admin') && (
                        <label className="relative ml-4 flex-shrink-0 cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={ws.is_active}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleToggle(ws, e.target.checked);
                            }}
                          />
                          <div className="relative w-10 h-6 rounded-full bg-gray-600 transition-colors peer-checked:bg-blue-600
                            after:absolute after:left-[2px] after:top-[2px]
                            after:h-5 after:w-5 after:rounded-full after:bg-white
                            after:transition-transform after:duration-200
                            peer-checked:after:translate-x-4">
                          </div>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
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
        placement="bottom-start"
        offset={[0, 8]}
        onClickOutside={() => setIsOpen(false)}
        appendTo={document.body}
        zIndex={99999}
        popperOptions={{
          modifiers: [
            {
              name: 'flip',
              options: { fallbackPlacements: ['top-start'] },
            },
          ],
        }}
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

      {/* Create workspace modal */}
      {showCreateModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-8 w-full max-w-md shadow-2xl relative z-[99999]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Create New Workspace</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateWorkspace}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Workspace Name *
                  </label>
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
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Slug (URL identifier)
                  </label>
                  <input
                    type="text"
                    value={newWorkspaceSlug}
                    onChange={(e) => setNewWorkspaceSlug(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="my-workspace"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Auto‑generated from name. Can be edited.
                  </p>
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

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #4b5563 transparent;
        }
      `}</style>
    </>
  );
};

export default WorkspaceSwitcher;