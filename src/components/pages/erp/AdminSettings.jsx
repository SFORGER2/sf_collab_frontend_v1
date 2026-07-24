import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  requestInterceptor,
  responseInterceptor,
  responseErrorInterceptor,
} from "../../../utils/APIs/interceptors";
import {
  Users, Calendar, Settings, Shield,
  Plus, Search, MoreHorizontal,
  Trash2, Edit3, Globe,
  Lock, Bell, Mail, ChevronDown
} from "lucide-react";

const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const AdminSettings = () => {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const workspaceId = user?.active_workspace_id;

  const [activeTab, setActiveTab] = useState("users");
  const [members, setMembers] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ name: "", date: "" });
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceSlug, setWorkspaceSlug] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  // Load workspace details
  const loadWorkspaceDetails = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const res = await api.get(`/workspaces/${workspaceId}`);
      const data = res.data?.data || res.data;
      const ws = data.workspace || {};
      setWorkspaceName(ws.name || "");
      setWorkspaceSlug(ws.slug || "");
    } catch (err) {
      console.error("Failed to load workspace details", err);
    }
  }, [workspaceId]);

  // Load members
  const loadMembers = useCallback(async () => {
    if (!workspaceId) return;

    setLoading(true);

    try {
      const res = await api.get(`/workspaces/${workspaceId}/users`);
      const data = res.data?.data || res.data;
      const usersList = data.users || [];
      const normalised = usersList.map((m) => ({
        id: m.user?.id || m.user_id,
        name: m.user?.name || (m.user?.first_name + " " + m.user?.last_name).trim() || `User #${m.user_id}`,
        email: m.user?.email || "—",
        role: m.role === "admin" ? "Admin" : "Member",
        status: "Active",
        joined: m.joined_at ? new Date(m.joined_at).toLocaleDateString() : "—",
      }));
      setMembers(normalised);
    } catch (err) {
      console.error("Failed to load members", err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  const loadHolidays = useCallback(async () => {
    if (!workspaceId) return;

    setLoading(true);

    try {
      const res = await api.get("/holiday/list", { params: { workspace_id: workspaceId } });
      const data = res.data?.data || res.data;
      setHolidays(data.holidays || []);
    } catch (err) {
      console.error("Failed to load holidays", err);
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (workspaceId) {
      loadWorkspaceDetails();
      if (activeTab === "users") loadMembers();
      if (activeTab === "holidays") loadHolidays();
    }
  }, [workspaceId, activeTab, loadMembers, loadHolidays, loadWorkspaceDetails]);

  // Create holiday
  const handleAddHoliday = async () => {
    if (!newHoliday.name || !newHoliday.date) return;
    try {
      await api.post("/holiday/create", {
        workspace_id: workspaceId,
        name: newHoliday.name,
        date: newHoliday.date,
      });
      setNewHoliday({ name: "", date: "" });
      setShowHolidayForm(false);
      loadHolidays();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to add holiday");
    }
  };

  // Delete holiday
  const handleDeleteHoliday = async (id) => {
    if (!window.confirm("Delete this holiday?")) return;
    try {
      await api.delete(`/holiday/${id}`);
      loadHolidays();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to delete holiday");
    }
  };

  // Remove member
  const handleRemoveMember = async (memberId) => {
    if (memberId === user?.id) {
      alert("You cannot remove yourself.");
      return;
    }
    if (!window.confirm("Remove this member from the workspace?")) return;
    try {
      await api.delete(`/workspace-members/workspaces/${workspaceId}/members/${memberId}`);
      loadMembers();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to remove member");
    }
  };

  // Save workspace changes (name & slug)
  // Note: Backend does not have a PUT endpoint yet. We'll show a warning.
  const handleSaveWorkspace = async () => {
    if (!workspaceName.trim()) {
      alert("Workspace name is required");
      return;
    }
    setSaveLoading(true);
    try {
      await api.put(`/workspaces/${workspaceId}`, {
        name: workspaceName,
        slug: workspaceSlug,
      });
      alert("Workspace updated successfully");
      loadWorkspaceDetails(); // refresh displayed data
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to update workspace");
    } finally {
      setSaveLoading(false);
    }
  };

  // Delete workspace
  const handleDeleteWorkspace = async () => {
    if (!window.confirm("⚠️ Are you sure you want to delete this workspace? This action cannot be undone.")) return;
    try {
      await api.delete(`/workspaces/${workspaceId}`);
      alert("Workspace deleted. You will be logged out.");
      localStorage.clear();
      window.location.href = "/login";
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to delete workspace");
    }
  };

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`relative flex items-center gap-3 px-6 py-4 transition-colors text-[10px] font-bold uppercase tracking-widest ${activeTab === id ? "text-white" : "text-zinc-500 hover:text-zinc-300"
        }`}
    >
      <Icon size={14} />
      <span>{label}</span>
      {activeTab === id && (
        <motion.div
          layoutId="admin-tab-active"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_-4px_12px_rgba(99,102,241,0.5)]"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your workspace members, holidays, and configuration.</p>
      </div>

      <div className="flex border-b border-[#262626] mb-8 overflow-x-auto scrollbar-hide">
        <TabButton id="users" label="User Management" icon={Users} />
        <TabButton id="holidays" label="Holidays" icon={Calendar} />
        <TabButton id="general" label="Configuration" icon={Settings} />
      </div>

      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-md w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
              <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl overflow-hidden shadow-2xl">
                {loading ? (
                  <p className="text-gray-500 text-sm py-8 text-center">Loading members…</p>
                ) : filteredMembers.length === 0 ? (
                  <p className="text-gray-500 text-sm py-8 text-center">No members found.</p>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#0a0a0a] border-b border-[#262626]">
                      <tr>
                        <th className="px-6 py-4 font-medium text-gray-400">Member</th>
                        <th className="px-6 py-4 font-medium text-gray-400">Role</th>
                        <th className="px-6 py-4 font-medium text-gray-400">Status</th>
                        <th className="px-6 py-4 font-medium text-gray-400">Joined</th>
                        <th className="px-6 py-4 font-medium text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#262626]">
                      {filteredMembers.map(member => (
                        <tr key={member.id} className="hover:bg-[#222] transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-sm">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <div className="font-bold text-white">{member.name}</div>
                                <div className="text-[10px] text-gray-500">{member.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {member.role === 'Admin' ? <Shield size={14} className="text-purple-400" /> : <Users size={14} className="text-blue-400" />}
                              <span className={member.role === 'Admin' ? 'text-purple-400' : 'text-blue-400'}>{member.role}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${member.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                              }`}>
                              {member.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400">{member.joined}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button className="p-1.5 text-gray-500 hover:text-white hover:bg-[#262626] rounded transition-colors" title="Edit Role">
                                <Edit3 size={16} />
                              </button>
                              <button onClick={() => handleRemoveMember(member.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors" title="Remove User">
                                <Trash2 size={16} />
                              </button>
                              <button className="p-1.5 text-gray-500 hover:text-white hover:bg-[#262626] rounded transition-colors">
                                <MoreHorizontal size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "holidays" && (
            <motion.div
              key="holidays"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Workspace Holidays</h2>
                <button onClick={() => setShowHolidayForm(!showHolidayForm)} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm">
                  <Plus size={18} />
                  Add Holiday
                </button>
              </div>

              {showHolidayForm && (
                <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-5 mb-6 space-y-3">
                  <input
                    type="text" placeholder="Holiday name"
                    value={newHoliday.name}
                    onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-blue-500/50"
                  />
                  <input
                    type="date" value={newHoliday.date}
                    onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-blue-500/50"
                  />
                  <button onClick={handleAddHoliday} className="bg-white text-black px-4 py-2 rounded-lg font-medium text-sm">Save Holiday</button>
                </div>
              )}

              {loading ? (
                <p className="text-gray-500 text-sm py-8 text-center">Loading holidays…</p>
              ) : holidays.length === 0 ? (
                <p className="text-gray-500 text-sm py-8 text-center">No holidays added yet.</p>
              ) : (
                <div className="grid gap-3">
                  {holidays.map(holiday => (
                    <div key={holiday.id} className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-4 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-400">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <div className="font-medium text-white">{holiday.name}</div>
                          <div className="text-xs text-gray-500">{holiday.date}</div>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteHoliday(holiday.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "general" && (
            <motion.div key="general" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl">
              <h2 className="text-xl font-semibold mb-6">Workspace Configuration</h2>

              <div className="space-y-6 mt-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                    Workspace Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Company Website</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="text"
                      value={workspaceSlug}
                      onChange={(e) => setWorkspaceSlug(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Default Currency</label>
                    <div className="relative group">
                      <select className="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer">
                        <option>USD ($)</option>
                        <option>EUR (€)</option>
                        <option>GBP (£)</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Timezone</label>
                    <div className="relative group">
                      <select className="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer">
                        <option>UTC (GMT+0)</option>
                        <option>EST (GMT-5)</option>
                        <option>IST (GMT+5:30)</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <button
                    onClick={handleSaveWorkspace}
                    disabled={saveLoading}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all disabled:opacity-50"
                  >
                    {saveLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>

              <div className="mt-16 space-y-4">
                <h2 className="text-xl font-semibold mb-4 text-red-400">Danger Zone</h2>
                <div className="p-6 border border-red-500/20 bg-red-500/5 rounded-2xl flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white text-sm">Delete Workspace</div>
                    <div className="text-[11px] text-red-200/50 mt-1">Permanently remove all data, users, and tasks.</div>
                  </div>
                  <button
                    onClick={handleDeleteWorkspace}
                    className="bg-red-500 hover:bg-red-600 text-white h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
};

export default AdminSettings;
