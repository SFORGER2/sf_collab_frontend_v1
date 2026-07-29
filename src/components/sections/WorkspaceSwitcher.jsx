// src/components/sections/WorkspaceSwitcher.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Building2, Sparkles } from "lucide-react";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
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

  const handleCreateWorkspace = () => {
    // Task 5: Workspace creation is only possible after registering a Vision.
    // Redirect to Vision creation instead of opening the manual workspace form.
    setIsOpen(false);
    navigate('/vision/create');
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
                {/* Task 5: Create Workspace only via Vision — redirect to Vision creator */}
                <button
                  onClick={handleCreateWorkspace}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gold hover:bg-[#262626] rounded-lg transition-colors"
                >
                  <Sparkles size={16} />
                  Create Vision to Unlock Workspace
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

      {/* Custom scrollbar styles */}
      <style>{`
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