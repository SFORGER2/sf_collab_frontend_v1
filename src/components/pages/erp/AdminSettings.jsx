import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../utils/APIs/interceptors";
import { Users, Calendar, Settings, Shield, Plus, Search, MoreHorizontal, Trash2, Edit3, Globe, ChevronDown } from "lucide-react";
import { ERPPageHeader } from "../../erp/shared/ERPPageHeader";
import { ERPBannerManager } from "../../erp/shared/ERPBanner";
import { ERPLoadingSkeleton } from "../../erp/shared/ERPLoadingSkeleton";
import { ERPEmptyState } from "../../erp/shared/ERPEmptyState";

const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

export default function AdminSettings() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const workspaceId = user?.active_workspace_id;

  const [activeTab, setActiveTab] = useState("users");
  const [members, setMembers] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newHoliday, setNewHoliday] = useState({ name: "", date: "" });
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceSlug, setWorkspaceSlug] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

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
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load members");
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
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load holidays");
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

  const handleAddHoliday = async () => {
    if (!newHoliday.name || !newHoliday.date) return;
    try {
      await api.post("/holiday/create", { workspace_id: workspaceId, name: newHoliday.name, date: newHoliday.date });
      setNewHoliday({ name: "", date: "" });
      setShowHolidayForm(false);
      loadHolidays();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to add holiday");
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (!window.confirm("Delete this holiday?")) return;
    try {
      await api.delete(`/holiday/${id}`);
      loadHolidays();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to delete holiday");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (memberId === user?.id) { alert("You cannot remove yourself."); return; }
    if (!window.confirm("Remove this member from the workspace?")) return;
    try {
      await api.delete(`/workspace-members/workspaces/${workspaceId}/members/${memberId}`);
      loadMembers();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to remove member");
    }
  };

  const handleSaveWorkspace = async () => {
    if (!workspaceName.trim()) { alert("Workspace name is required"); return; }
    setSaveLoading(true);
    try {
      await api.put(`/workspaces/${workspaceId}`, { name: workspaceName, slug: workspaceSlug });
      alert("Workspace updated successfully");
      loadWorkspaceDetails();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to update workspace");
    } finally {
      setSaveLoading(false);
    }
  };

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

  const filteredMembers = members.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.email.toLowerCase().includes(searchQuery.toLowerCase()));

  const TabButton = ({ id, label, icon: Icon }) => (
    <button onClick={() => setActiveTab(id)} className={`relative flex items-center gap-3 px-6 py-4 transition-colors text-[10px] font-bold uppercase tracking-widest ${activeTab === id ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
      <Icon size={14} />
      <span>{label}</span>
      {activeTab === id && <motion.div layoutId="admin-settings-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_-4px_12px_rgba(99,102,241,0.5)]" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ERPPageHeader
          icon={<Settings size={20} />}
          title="Admin Settings"
          description="Manage your workspace members, holidays, and configuration."
          breadcrumbs={[{ label: "ERP" }, { label: "Admin" }, { label: "Settings" }]}
        />

        {error && <ERPBannerManager error={error} onDismissError={() => setError(null)} />}

        <div className="flex border-b border-white/5 mb-8 overflow-x-auto">
          <TabButton id="users" label="User Management" icon={Users} />
          <TabButton id="holidays" label="Holidays" icon={Calendar} />
          <TabButton id="general" label="Configuration" icon={Settings} />
        </div>

        <div className="max-w-4xl">
          <AnimatePresence mode="wait">
            {activeTab === "users" && (
              <motion.div key="users" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div className="relative flex-1 max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input type="text" placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#111115] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500/50 transition-colors" />
                  </div>
                </div>
                
                <div className="bg-[#111115] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                  {loading ? (
                    <div className="p-10"><ERPLoadingSkeleton /></div>
                  ) : filteredMembers.length === 0 ? (
                    <ERPEmptyState icon={<Users size={24} />} title="No members found" sub="Try adjusting your search query." />
                  ) : (
                    <table className="w-full text-left text-sm">
                      <thead className="bg-black/20 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-white/5">
                        <tr>
                          <th className="px-6 py-4">Member</th>
                          <th className="px-6 py-4">Role</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Joined</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredMembers.map(member => (
                          <motion.tr whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }} key={member.id} className="transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white shrink-0">
                                  {member.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold text-white">{member.name}</div>
                                  <div className="text-[10px] font-bold text-zinc-500">{member.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {member.role === 'Admin' ? <Shield size={14} className="text-purple-400" /> : <Users size={14} className="text-blue-400" />}
                                <span className={`text-xs font-bold uppercase tracking-widest ${member.role === 'Admin' ? 'text-purple-400' : 'text-blue-400'}`}>{member.role}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${member.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                {member.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-zinc-500">{member.joined}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-colors" title="Edit Role"><Edit3 size={16} /></button>
                                <button onClick={() => handleRemoveMember(member.id)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors" title="Remove User"><Trash2 size={16} /></button>
                                <button className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-colors"><MoreHorizontal size={16} /></button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "holidays" && (
              <motion.div key="holidays" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-white">Workspace Holidays</h2>
                  <button onClick={() => setShowHolidayForm(!showHolidayForm)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors">
                    <Plus size={14} /> Add Holiday
                  </button>
                </div>

                <AnimatePresence>
                  {showHolidayForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                      <div className="bg-[#111115] border border-white/5 rounded-3xl p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input type="text" placeholder="Holiday name" value={newHoliday.name} onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })} className="w-full bg-[#1a1a20] border border-white/5 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-indigo-500/50" />
                          <input type="date" value={newHoliday.date} onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })} className="w-full bg-[#1a1a20] border border-white/5 rounded-xl py-3 px-4 text-sm font-semibold text-zinc-300 focus:outline-none focus:border-indigo-500/50" />
                        </div>
                        <button onClick={handleAddHoliday} className="bg-white hover:bg-zinc-200 text-black px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors">Save Holiday</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {loading ? (
                  <div className="py-10"><ERPLoadingSkeleton /></div>
                ) : holidays.length === 0 ? (
                  <ERPEmptyState icon={<Calendar size={24} />} title="No holidays" sub="No holidays added yet." compact />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {holidays.map(holiday => (
                      <div key={holiday.id} className="bg-[#111115] border border-white/5 rounded-2xl p-4 flex justify-between items-center group hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 shrink-0">
                            <Calendar size={18} />
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{holiday.name}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">{holiday.date}</div>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteHoliday(holiday.id)} className="p-2 text-zinc-500 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "general" && (
              <motion.div key="general" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="max-w-2xl">
                <div className="bg-[#111115] border border-white/5 rounded-3xl p-8 mb-8">
                  <h2 className="text-base font-bold text-white mb-6">Workspace Configuration</h2>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Workspace Name <span className="text-red-500">*</span></label>
                      <input type="text" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} className="w-full bg-[#1a1a20] border border-white/5 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-indigo-500/50 transition-colors" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Company Website</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input type="text" value={workspaceSlug} onChange={(e) => setWorkspaceSlug(e.target.value)} className="w-full bg-[#1a1a20] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm font-semibold focus:outline-none focus:border-indigo-500/50 transition-colors" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Default Currency</label>
                        <div className="relative">
                          <select className="w-full bg-[#1a1a20] border border-white/5 rounded-xl py-3 px-4 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer">
                            <option>USD ($)</option>
                            <option>EUR (€)</option>
                            <option>GBP (£)</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Timezone</label>
                        <div className="relative">
                          <select className="w-full bg-[#1a1a20] border border-white/5 rounded-xl py-3 px-4 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer">
                            <option>UTC (GMT+0)</option>
                            <option>EST (GMT-5)</option>
                            <option>IST (GMT+5:30)</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-white/5">
                    <button onClick={handleSaveWorkspace} disabled={saveLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50">
                      {saveLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>

                <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8">
                  <h2 className="text-base font-bold text-red-500 mb-2">Danger Zone</h2>
                  <p className="text-sm font-semibold text-zinc-400 mb-6">Permanently remove all data, users, and tasks. This action cannot be undone.</p>
                  <button onClick={handleDeleteWorkspace} className="bg-red-500 hover:bg-red-600 text-white py-3.5 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors w-full">
                    Delete Workspace
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
