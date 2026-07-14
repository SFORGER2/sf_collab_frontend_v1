// src/components/pages/startupWorkspace/StartupWorkspaceLayout.jsx
//
// The Startup Workspace: "the operational environment for building and
// scaling a company" (spec section 10). Mirrors the ERP layout pattern
// but is scoped to a single startup and surfaces every module listed
// in the spec, linking out to existing pages where they already exist.

import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ChevronLeft, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { startupsAPI } from '@/utils/APIs/startupsAPI';
import { workspaceAPI } from '@/services/workspaceAPI';
import { setUser } from '@/services/auth/authSlice';
import { fetchUserProfile } from '@/services/auth/authThunks';
import { getStartupWorkspaceModules, STARTUP_WORKSPACE_GROUP_ORDER } from './startupWorkspaceLinks';

export default function StartupWorkspaceLayout() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [switching, setSwitching] = useState(false);

  const handleExternalModuleClick = async (mod) => {
    if (!mod.requiresWorkspaceSwitch) {
      navigate(mod.href);
      return;
    }
    setSwitching(true);
    try {
      const res = await axios.get('/api/workspaces/my');
      const workspaces = res?.data?.data ?? res?.data ?? [];
      let match = workspaces.find((w) => String(w.startup_id) === String(id));

      if (!match) {
        // No ERP workspace linked to this startup yet -- create one instead
        // of sending the user to the manual "Create Workspace" form (or
        // silently leaving them on whatever workspace was last active).
        try {
          const createRes = await axios.post('/api/workspaces/create', {
            name: startup?.name ? `${startup.name} Workspace` : 'Startup Workspace',
            startup_id: id,
          });
          match = createRes?.data?.data?.workspace ?? createRes?.data?.workspace ?? null;
        } catch (createErr) {
          console.error('Failed to auto-create linked workspace:', createErr);
        }
      }

      if (match) {
        await workspaceAPI.switchWorkspace(match.id);
        const userData = await dispatch(fetchUserProfile()).unwrap();
        dispatch(setUser(userData));
      }
    } catch (err) {
      console.error('Failed to switch workspace context:', err);
    } finally {
      setSwitching(false);
      navigate(mod.href);
    }
  };

  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const body = await startupsAPI.getById(id);
        const data = body?.data?.startup ?? body?.startup ?? null;
        if (!cancelled) setStartup(data);
      } catch (err) {
        console.error('Failed to load startup for workspace:', err);
        if (!cancelled) {
          const status = err?.response?.status;
          if (status === 403) {
            setError("You don't have access to this startup's workspace.");
          } else if (status === 404) {
            setError('This startup could not be found.');
          } else {
            setError('Something went wrong loading this workspace. Please try again.');
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const modules = useMemo(() => getStartupWorkspaceModules(id), [id]);

  const grouped = useMemo(() => {
    return modules.reduce((acc, mod) => {
      if (!acc[mod.group]) acc[mod.group] = [];
      acc[mod.group].push(mod);
      return acc;
    }, {});
  }, [modules]);

  if (loading) {
    return (
      <div className="h-screen bg-[#09090B] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-[#09090B] flex flex-col items-center justify-center gap-4 text-white px-6 text-center">
        <p className="text-gray-300 max-w-md">{error}</p>
        <button
          onClick={() => navigate('/discover-startups')}
          className="text-xs px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
        >
          Back to Discover Startups
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#09090B] text-white overflow-hidden">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/discover-startups')}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
            {startup?.logo_url ? (
              <img src={startup.logo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              startup?.name?.[0] || 'S'
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">{startup?.name || 'Startup Workspace'}</p>
            <p className="text-gray-500 text-xs truncate">{startup?.industry}</p>
          </div>
        </div>
        <Link
          to={`/startup-details/${id}`}
          className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
        >
          View public page
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={cn(
          'h-full bg-[#111827] border-r border-white/5 transition-all duration-300 flex flex-col shrink-0',
          collapsed ? 'w-16' : 'w-64'
        )}>
          <div className="flex items-center justify-end px-3 py-3 border-b border-white/5">
            <button onClick={() => setCollapsed(!collapsed)} className="text-zinc-400 hover:text-white transition-colors">
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
            {STARTUP_WORKSPACE_GROUP_ORDER.map((groupKey) => (
              grouped[groupKey] && (
                <div key={groupKey}>
                  {!collapsed && (
                    <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      {groupKey}
                    </div>
                  )}
                  <div className="space-y-1">
                    {grouped[groupKey].map((mod) => {
                      const active = mod.internal
                        ? location.pathname === mod.href
                        : false;
                      const Icon = mod.icon;

                      if (mod.requiresWorkspaceSwitch) {
                        return (
                          <button
                            key={mod.id}
                            onClick={() => handleExternalModuleClick(mod)}
                            disabled={switching}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all hover:bg-white/5 text-left disabled:opacity-50',
                              'text-zinc-400 hover:text-white'
                            )}
                            title={`${mod.label} (opens existing module)`}
                          >
                            <span className="w-5 h-5 flex items-center justify-center shrink-0">
                              {switching ? <Loader2 size={16} className="animate-spin" /> : <Icon size={18} />}
                            </span>
                            {!collapsed && <span className="truncate">{mod.label}</span>}
                          </button>
                        );
                      }

                      return (
                        <Link
                          key={mod.id}
                          to={mod.href}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all hover:bg-white/5',
                            active ? 'bg-blue-600/20 text-blue-400' : 'text-zinc-400 hover:text-white'
                          )}
                          title={!mod.internal ? `${mod.label} (opens existing module)` : undefined}
                        >
                          <span className="w-5 h-5 flex items-center justify-center shrink-0">
                            <Icon size={18} />
                          </span>
                          {!collapsed && <span className="truncate">{mod.label}</span>}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )
            ))}
          </nav>
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet context={{ startup, startupId: id }} />
        </main>
      </div>
    </div>
  );
}