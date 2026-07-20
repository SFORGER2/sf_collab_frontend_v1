import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import {
  Users,
  Mail,
  TrendingUp,
  Download,
  Plus,
  Search,
  Trash2,
  Edit2,
  X,
  ExternalLink,
  Check,
  Filter,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import notificationAPI from '@/utils/APIs/notificationAPI';
import DeleteConfirmationModal from '@/utils/confirm';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Pre-seeded realistic subscriber list
const SEED_SUBSCRIBERS = [
  { id: '1', email: 'alex.rivera@startupforge.dev', dateSubscribed: '2026-01-12', status: 'subscribed', preferences: ['Product Updates', 'Developer Weekly'] },
  { id: '2', email: 'elena.rostova@vc-ventures.com', dateSubscribed: '2026-01-20', status: 'subscribed', preferences: ['Ecosystem', 'Founder Stories'] },
  { id: '3', email: 'marcus.chen@techinnovate.io', dateSubscribed: '2026-02-02', status: 'subscribed', preferences: ['Product Updates', 'Developer Weekly', 'Ecosystem'] },
  { id: '4', email: 'sarah.connor@cyberdyne.net', dateSubscribed: '2026-02-15', status: 'unsubscribed', preferences: ['Product Updates'] },
  { id: '5', email: 'david.kim@founderslabs.co', dateSubscribed: '2026-02-28', status: 'subscribed', preferences: ['Founder Stories', 'Developer Weekly'] },
  { id: '6', email: 'julia.santos@growthhack.br', dateSubscribed: '2026-03-05', status: 'subscribed', preferences: ['Marketing', 'Ecosystem'] },
  { id: '7', email: 'niels.bohr@quantumscale.eu', dateSubscribed: '2026-03-19', status: 'subscribed', preferences: ['Developer Weekly', 'Product Updates'] },
  { id: '8', email: 'ada.lovelace@firstcoder.org', dateSubscribed: '2026-04-01', status: 'subscribed', preferences: ['Product Updates', 'Developer Weekly', 'Founder Stories'] },
  { id: '9', email: 'steve.jobs@nextlevel.com', dateSubscribed: '2026-04-10', status: 'unsubscribed', preferences: ['Product Updates', 'Ecosystem', 'Marketing'] },
  { id: '10', email: 'grace.hopper@compilertech.edu', dateSubscribed: '2026-04-22', status: 'subscribed', preferences: ['Developer Weekly'] },
  { id: '11', email: 'linus.torvalds@kernelspace.org', dateSubscribed: '2026-05-02', status: 'subscribed', preferences: ['Developer Weekly', 'Product Updates'] },
  { id: '12', email: 'katherine.johnson@nasamath.gov', dateSubscribed: '2026-05-18', status: 'subscribed', preferences: ['Ecosystem', 'Founder Stories', 'Product Updates'] }
];

// Modal Component for editing a sent newsletter
function EditNewsletterModal({ isOpen, onClose, newsletter, onSave }) {
  const [formData, setFormData] = useState({ title: '', content: '', linkUrl: '', category: '', tags: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (newsletter) {
      setFormData({
        title: newsletter.title || '',
        content: newsletter.message || newsletter.content || '',
        linkUrl: newsletter.linkUrl || newsletter.link_url || '',
        category: newsletter.category || 'Ecosystem',
        tags: newsletter.tags ? newsletter.tags.join(', ') : '',
      });
    }
  }, [newsletter, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and Content are required');
      return;
    }
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-purple-400" />
            Edit Newsletter Bulletin
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition"
              placeholder="Enter newsletter title..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition"
              >
                <option value="Product Updates">Product Updates</option>
                <option value="Ecosystem">Ecosystem</option>
                <option value="Developer Weekly">Developer Weekly</option>
                <option value="Founder Stories">Founder Stories</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Tags (comma separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition"
                placeholder="weekly, ecosystem, launch"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows="6"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition resize-none"
              placeholder="Enter newsletter body content..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Link URL (optional)</label>
            <input
              type="url"
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition"
              placeholder="https://example.com"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function NewsletterDashboard() {
  const [subscribers, setSubscribers] = useState(() => {
    const saved = localStorage.getItem('newsletter_admin:subscribers');
    return saved ? JSON.parse(saved) : SEED_SUBSCRIBERS;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newEmail, setNewEmail] = useState('');
  const [newPreferences, setNewPreferences] = useState(['Product Updates']);
  
  // Sent newsletters state
  const [newsletters, setNewsletters] = useState([]);
  const [loadingNewsletters, setLoadingNewsletters] = useState(false);
  const [newsletterSearch, setNewsletterSearch] = useState('');
  
  // Modals state
  const [editModal, setEditModal] = useState({ isOpen: false, item: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  // Save subscribers to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('newsletter_admin:subscribers', JSON.stringify(subscribers));
  }, [subscribers]);

  // Fetch newsletters list — stable reference so useEffect dep array stays clean
  const fetchNewsletters = useCallback(async () => {
    setLoadingNewsletters(true);
    try {
      const response = await notificationAPI.getNewsletter();
      setNewsletters(response.newsletter || []);
    } catch (error) {
      console.error('Failed to fetch newsletters', error);
    } finally {
      setLoadingNewsletters(false);
    }
  }, []);

  useEffect(() => {
    fetchNewsletters();
  }, [fetchNewsletters]);

  // Total Metrics
  const metrics = useMemo(() => {
    const total = subscribers.length;
    const active = subscribers.filter(s => s.status === 'subscribed').length;
    const activePercent = total > 0 ? Math.round((active / total) * 100) : 0;
    const unsubscribed = total - active;
    
    return {
      total,
      active,
      activePercent,
      unsubscribed,
      openRate: 64.2, // Simulated analytics
      clickRate: 24.8, // Simulated analytics
    };
  }, [subscribers]);

  // Chart Data — memoized so the chart only re-renders when active count changes
  const chartData = useMemo(() => ({
    labels: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Subscribers Growth',
        data: [780, 850, 940, 1080, 1190, 1190 + metrics.active - 10],
        fill: true,
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        borderColor: '#9333ea',
        borderWidth: 2,
        pointBackgroundColor: '#9333ea',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#9333ea',
        tension: 0.4,
      },
    ],
  }), [metrics.active]);

  // Chart options — stable object, no deps
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(255, 255, 255, 0.5)' },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(255, 255, 255, 0.5)' },
      },
    },
  }), []);

  // Add Subscriber
  const handleAddSubscriber = (e) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      toast.error('Email is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (subscribers.some(s => s.email.toLowerCase() === newEmail.toLowerCase())) {
      toast.error('This email is already registered');
      return;
    }

    const newSub = {
      id: Date.now().toString(),
      email: newEmail.trim(),
      dateSubscribed: new Date().toISOString().split('T')[0],
      status: 'subscribed',
      preferences: newPreferences,
    };

    setSubscribers([newSub, ...subscribers]);
    setNewEmail('');
    toast.success('Subscriber added successfully');
  };

  // Toggle subscriber preference select
  const handleTogglePref = (pref) => {
    setNewPreferences(prev => 
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  // Unsubscribe / Toggle status of subscriber
  const handleToggleStatus = (id) => {
    setSubscribers(subscribers.map(sub => {
      if (sub.id === id) {
        const nextStatus = sub.status === 'subscribed' ? 'unsubscribed' : 'subscribed';
        toast.info(`Status changed for ${sub.email}`);
        return { ...sub, status: nextStatus };
      }
      return sub;
    }));
  };

  // Delete Subscriber (from simulated database)
  const handleDeleteSubscriber = (id) => {
    setSubscribers(subscribers.filter(sub => sub.id !== id));
    toast.success('Subscriber deleted');
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      toast.warning('No subscribers to export');
      return;
    }

    // Define headers
    const headers = ['Email', 'Date Subscribed', 'Status', 'Preferences'];
    const csvRows = [headers.join(',')];

    // Map rows
    subscribers.forEach(sub => {
      const row = [
        `"${sub.email}"`,
        `"${sub.dateSubscribed}"`,
        `"${sub.status}"`,
        `"${sub.preferences.join('; ')}"`
      ];
      csvRows.push(row.join(','));
    });

    // Create Blob — revoke URL after click to prevent memory leak
    const csvContent = '\uFEFF' + csvRows.join('\n'); // BOM for Excel UTF-8 compliance
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sf_newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('CSV file exported successfully');
  };

  // Filtered Subscribers
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter(sub => {
      const matchesSearch = sub.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' ? true : sub.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [subscribers, searchQuery, statusFilter]);

  // Filtered newsletters
  const filteredNewsletters = useMemo(() => {
    return newsletters.filter(nl => 
      nl.title.toLowerCase().includes(newsletterSearch.toLowerCase()) ||
      (nl.message || nl.content || '').toLowerCase().includes(newsletterSearch.toLowerCase())
    );
  }, [newsletters, newsletterSearch]);

  // Newsletter Edit Save
  const handleSaveNewsletterEdit = async (formData) => {
    try {
      await notificationAPI.updateNewsletter(editModal.item.id, {
        title: formData.title,
        message: formData.content, // backend maps content/message
        content: formData.content,
        category: formData.category,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        link_url: formData.linkUrl,
      });
      toast.success('Newsletter updated successfully');
      setEditModal({ isOpen: false, item: null });
      fetchNewsletters(); // Refresh feed
    } catch (error) {
      console.error(error);
      toast.error('Failed to update newsletter');
    }
  };

  // Newsletter delete confirm
  const handleConfirmDeleteNewsletter = async () => {
    if (!deleteModal.id) return;
    try {
      await notificationAPI.deleteNewsletter(deleteModal.id);
      toast.success('Newsletter deleted successfully');
      setDeleteModal({ isOpen: false, id: null });
      fetchNewsletters();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete newsletter');
    }
  };

  return (
    <div className="space-y-8">
      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Subscribers', value: metrics.total, description: `${metrics.activePercent}% Active status`, icon: Users, color: 'from-purple-500/20 to-purple-600/5' },
          { label: 'Active Subscribers', value: metrics.active, description: `${metrics.unsubscribed} Unsubscribed`, icon: Mail, color: 'from-blue-500/20 to-blue-600/5' },
          { label: 'Simulated Open Rate', value: `${metrics.openRate}%`, description: 'Industry avg: 22.4%', icon: TrendingUp, color: 'from-emerald-500/20 to-emerald-600/5' },
          { label: 'Simulated Click Rate', value: `${metrics.clickRate}%`, description: 'Industry avg: 2.8%', icon: Sparkles, color: 'from-amber-500/20 to-amber-600/5' },
        ].map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div key={idx} className={`bg-gradient-to-br ${item.color} backdrop-blur border border-white/10 rounded-2xl p-6 relative overflow-hidden group shadow-lg`}>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">{item.label}</span>
                  <h3 className="text-3xl font-bold text-white">{item.value}</h3>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-white/80 group-hover:scale-110 transition-transform">
                  <IconComp className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900/40 backdrop-blur border border-white/10 rounded-2xl p-6 shadow-xl lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Subscriber Growth Curve</h3>
              <p className="text-xs text-gray-400">Total active subscriptions history (6 months)</p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Growth positive
            </span>
          </div>
          <div className="h-64 relative">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Add Subscriber Panel */}
        <div className="bg-slate-900/40 backdrop-blur border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-400" />
              Subscribe Email Manually
            </h3>
            <p className="text-xs text-gray-400 mb-6">Add an email address straight to the bulletin subscriber database.</p>

            <form onSubmit={handleAddSubscriber} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition text-sm"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Category Subscriptions</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Product Updates', 'Ecosystem', 'Developer Weekly', 'Founder Stories', 'Marketing'].map((pref) => {
                    const isSelected = newPreferences.includes(pref);
                    return (
                      <button
                        type="button"
                        key={pref}
                        onClick={() => handleTogglePref(pref)}
                        className={`text-xs px-3 py-1.5 rounded-full transition-all border ${
                          isSelected
                            ? 'bg-purple-600/30 text-purple-200 border-purple-500/50'
                            : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {pref}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm transition flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Subscribe User
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Subscriber List Table */}
      <div className="bg-slate-900/40 backdrop-blur border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Subscriber Directory</h3>
            <p className="text-xs text-gray-400">Total items: {filteredSubscribers.length}</p>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition text-sm"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-3 pr-8 py-2 rounded-lg bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition text-sm appearance-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="subscribed">Subscribed</option>
                <option value="unsubscribed">Unsubscribed</option>
              </select>
              <Filter className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Export */}
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 text-sm font-medium transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/15 text-gray-400 font-semibold">
                <th className="py-3 px-4">Subscriber Email</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Channel Categories</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.length > 0 ? (
                filteredSubscribers.map((sub) => (
                  <tr key={sub.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-all">
                    <td className="py-3.5 px-4 font-medium text-white">{sub.email}</td>
                    <td className="py-3.5 px-4 text-gray-400">{sub.dateSubscribed}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        sub.status === 'subscribed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sub.status === 'subscribed' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        {sub.status === 'subscribed' ? 'Subscribed' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {sub.preferences.map((pref, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-white/5 border border-white/10 rounded text-gray-300">
                            {pref}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(sub.id)}
                          className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                            sub.status === 'subscribed'
                              ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          }`}
                          title={sub.status === 'subscribed' ? 'Simulate Unsubscribe' : 'Simulate Subscribe'}
                        >
                          {sub.status === 'subscribed' ? 'Unsubscribe' : 'Subscribe'}
                        </button>
                        <button
                          onClick={() => handleDeleteSubscriber(sub.id)}
                          className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition"
                          title="Delete permanently"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No subscribers found matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sent Newsletters List Panel */}
      <div className="bg-slate-900/40 backdrop-blur border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              Manage Sent Newsletter Bulletins
            </h3>
            <p className="text-xs text-gray-400">View, edit, or delete previously created newsletter records.</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Filter sent newsletters..."
              value={newsletterSearch}
              onChange={(e) => setNewsletterSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition text-sm"
            />
          </div>
        </div>

        {loadingNewsletters ? (
          <div className="text-center py-12 text-gray-500">Loading newsletter feed...</div>
        ) : filteredNewsletters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNewsletters.map((nl) => (
              <motion.div
                key={nl.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-white/[0.02] border border-white/10 rounded-xl relative flex flex-col justify-between hover:border-white/20 transition-all group"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 border border-purple-500/20 rounded">
                      {nl.category || 'Newsletter'}
                    </span>
                    <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditModal({ isOpen: true, item: nl })}
                        className="p-1 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition"
                        title="Edit bulletin"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, id: nl.id })}
                        className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition"
                        title="Delete bulletin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-white mb-2 leading-snug line-clamp-1">{nl.title}</h4>
                  <p className="text-sm text-gray-400 line-clamp-3 mb-4 leading-relaxed whitespace-pre-wrap">
                    {nl.message || nl.content}
                  </p>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-white/5">
                  <span>{new Date(nl.createdAt).toLocaleDateString()}</span>
                  {nl.linkUrl || nl.link_url ? (
                    <a
                      href={nl.linkUrl || nl.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 font-medium inline-flex items-center gap-1 hover:underline"
                    >
                      Attached Link <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span>No attach link</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-xl">
            No newsletters found.
          </div>
        )}
      </div>

      {/* Edit Newsletter Modal */}
      <AnimatePresence>
        {editModal.isOpen && (
          <EditNewsletterModal
            isOpen={editModal.isOpen}
            onClose={() => setEditModal({ isOpen: false, item: null })}
            newsletter={editModal.item}
            onSave={handleSaveNewsletterEdit}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleConfirmDeleteNewsletter}
        title="Confirm Delete"
        message="Are you sure you want to permanently delete this newsletter? This cannot be undone."
        type="soft"
      />
    </div>
  );
}
