import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  requestInterceptor,
  responseInterceptor,
  responseErrorInterceptor,
} from "../../../utils/APIs/interceptors";
import { 
  Users, Calendar, Settings, Shield, 
  Plus, Search, MoreHorizontal, 
  Trash2, Edit3, Globe, 
  Lock, Bell, Mail
} from "lucide-react";

const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const AdminSettings = () => {
  const { user } = useSelector((s) => s.auth);
  const workspaceId = user?.id;

  const [activeTab, setActiveTab] = useState("users");
  const [members, setMembers]     = useState([]);
  const [holidays, setHolidays]   = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading]     = useState(false);
  const [newHoliday, setNewHoliday] = useState({ name: "", start_date: "", end_date: "" });
  const [showHolidayForm, setShowHolidayForm] = useState(false);

  // Load members — users who share this workspace (via UserActivity)
  const loadMembers = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      // Use friend list as workspace members for now — swap for workspace-member endpoint when available
      const res = await api.get("/friend-requests/friends");
      const raw = res.data?.data?.friends || res.data?.friends || res.data || [];
      const normalised = (Array.isArray(raw) ? raw : []).map((m) => ({
        id:     m.id,
        name:   `${m.firstName || ""} ${m.lastName || ""}`.trim() || `User #${m.id}`,
        email:  m.email || "—",
        role:   "member",
        status: "Active",
        joined: m.friendSince ? new Date(m.friendSince).toLocaleDateString() : "—",
      }));
      // Also include self
      setMembers([
        { id: user.id, name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "You", email: user.email || "—", role: "Admin", status: "Active", joined: "—" },
        ...normalised,
      ]);
    } catch { setMembers([]); }
    finally  { setLoading(false); }
  }, [workspaceId, user]);

  // Load holidays
  const loadHolidays = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const res = await api.get("/attendance/holidays", { params: { workspace_id: workspaceId } });
      const raw = res.data?.data || res.data || [];
      setHolidays(Array.isArray(raw) ? raw : []);
    } catch { setHolidays([]); }
    finally  { setLoading(false); }
  }, [workspaceId]);

  useEffect(() => {
    if (activeTab === "users")    loadMembers();
    if (activeTab === "holidays") loadHolidays();
  }, [activeTab, loadMembers, loadHolidays]);

  const handleAddHoliday = async () => {
    if (!newHoliday.name || !newHoliday.start_date) return;
    try {
      await api.post("/attendance/holidays", {
        ...newHoliday,
        workspace_id: workspaceId,
        end_date: newHoliday.end_date || newHoliday.start_date,
      });
      setNewHoliday({ name: "", start_date: "", end_date: "" });
      setShowHolidayForm(false);
      loadHolidays();
    } catch { /* silent */ }
  };

  const handleDeleteHoliday = async (id) => {
    try {
      await api.delete(`/attendance/holidays/${id}`);
      setHolidays((prev) => prev.filter((h) => h.id !== id));
    } catch { /* silent */ }
  };

  const handleRemoveMember = async (memberId) => {
    if (memberId === user?.id) { alert("You cannot remove yourself."); return; }
    if (!window.confirm("Remove this member from your workspace view?")) return;
    // Remove from local state — backend removal requires a startup membership endpoint
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const TabButton = ({ id, label, icon: Icon }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-6 py-3 border-b-2 transition-all ${
        activeTab === id 
        ? "border-white text-white bg-white/5" 
        : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/2"
      }`}
    >
      <Icon size={18} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your workspace members, policies, and configuration.</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#262626] mb-8 overflow-x-auto scrollbar-hide">
        <TabButton id="users" label="User Management" icon={Users} />
        <TabButton id="holidays" label="Holidays" icon={Calendar} />
        <TabButton id="general" label="Workspace Settings" icon={Settings} />
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto">
        
        {activeTab === "users" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by name or email..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              <a href="/people" className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm">
                <Plus size={18} />
                Invite Member
              </a>
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
                            <div className="font-medium text-white">{member.name}</div>
                            <div className="text-xs text-gray-500">{member.email}</div>
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
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          member.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
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
          </div>
        )}

        {activeTab === "holidays" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-3xl">
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
                    <input type="date" value={newHoliday.start_date}
                      onChange={(e) => setNewHoliday({ ...newHoliday, start_date: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">End Date (optional)</label>
                    <input type="date" value={newHoliday.end_date}
                      onChange={(e) => setNewHoliday({ ...newHoliday, end_date: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>
                <button onClick={handleAddHoliday} className="bg-white text-black px-4 py-2 rounded-lg font-medium text-sm">Save Holiday</button>
              </div>
            )}

            {loading ? (
              <p className="text-gray-500 text-sm py-8 text-center">Loading…</p>
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
                        <div className="text-xs text-gray-500">
                          {holiday.start_date}{holiday.end_date && holiday.end_date !== holiday.start_date ? ` → ${holiday.end_date}` : ""}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteHoliday(holiday.id)} className="text-gray-500 hover:text-red-400 p-2 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl flex gap-3">
              <Calendar className="text-blue-400 shrink-0" size={20} />
              <p className="text-xs text-blue-200/70 leading-relaxed">
                Holidays added here will automatically disable attendance tracking alerts for all workspace members on those specific dates.
              </p>
            </div>
          </div>
        )}

        {activeTab === "general" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl">
            <h2 className="text-xl font-semibold mb-6">Workspace Configuration</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Workspace Name</label>
                <input 
                  type="text" 
                  defaultValue="SF Collab Main"
                  className="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Company Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input 
                    type="text" 
                    defaultValue="sfcollab.com"
                    className="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Default Currency</label>
                  <select className="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer">
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                    <option>INR (₹)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Workspace Timezone</label>
                  <select className="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer">
                    <option>UTC (GMT+0)</option>
                    <option>EST (GMT-5)</option>
                    <option>PST (GMT-8)</option>
                    <option>IST (GMT+5:30)</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-[#262626] flex gap-4">
                <button className="flex-1 bg-white text-black py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors">
                  Save Changes
                </button>
                <button className="flex-1 bg-[#1a1a1a] border border-[#262626] text-white py-3 rounded-lg font-bold hover:bg-[#262626] transition-colors">
                  Discard
                </button>
              </div>
            </div>

            <div className="mt-12 space-y-4">
              <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
              <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-xl flex justify-between items-center">
                <div>
                  <div className="font-bold text-white text-sm">Delete Workspace</div>
                  <div className="text-xs text-red-200/50 mt-1">Permanently remove all data, users, and tasks.</div>
                </div>
                <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;