import { useEffect, useMemo, useState } from "react";
import CrowdfundingSection from "./CrowdfundingSection";
import DonationSection from "./DonationSection";
import WaitlistSection from "./WaitlistSection";
import { useSelector } from "react-redux";
import JoinSFSection from "./JoinSFSection";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Zap, Users, FileText, ChevronDown, Mail, Megaphone, Trash2, Edit2 } from "lucide-react";
import InfluencerProfileSection from "./InfluencerSection";
import notificationAPI from "@/utils/APIs/notificationAPI";
import { Link } from "react-router-dom";
import { plotCount } from "@/utils/plotCount";
import { formatFriendlyDate } from "@/utils/formatFriendlyDate";
import DeleteConfirmationModal from "@/utils/confirm";
import { useAnnouncements } from '@/contexts/AnnouncementContext';
import { useNewsletter } from '@/contexts/NewsletterContext';

// Edit Modal Component
function EditAnnouncementModal({ isOpen, onClose, announcement, onSave }) {
  const [formData, setFormData] = useState({ title: '', message: '', linkUrl: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || '',
        message: announcement.message || '',
        linkUrl: announcement.linkUrl || '',
      });
    }
  }, [announcement, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white/10 border border-white/20 rounded-xl p-6 w-full max-w-md backdrop-blur-xl"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Edit Announcement</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition"
              placeholder="Announcement title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition resize-none h-32"
              placeholder="Announcement message"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Link URL (optional)</label>
            <input
              type="text"
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition"
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
              className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function AnnouncementsSection({ userRoles }) {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = useMemo(() => user?.role === 'admin', [user]);

  // Contexts for announcements and newsletters
  const {
    announcements,
    unreadCount: announcementsUnread,
    markAllAsRead: markAnnouncementsRead,
    refresh: refreshAnnouncements,
  } = useAnnouncements();

  const {
    newsletters,
    unreadCount: newsletterUnread,
    markAllAsRead: markNewsletterRead,
    refresh: refreshNewsletter,
  } = useNewsletter();

  // Local UI state (filters, modals, expansion, tabs)
  const [announcementFilter, setAnnouncementFilter] = useState('all');
  const [newsletterFilter, setNewsletterFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, id: null });
  const [editModal, setEditModal] = useState({ isOpen: false, announcement: null });
  const [hideInfluencerInfo, setHideInfluencerInfo] = useState(false);
  const [hideShowJobApplication, setHideJobApplication] = useState(false);

  // Expansion state stored in localStorage (UI preference)
  const [isExpanded, setIsExpanded] = useState(() => {
    const stored = localStorage.getItem('preferences:announcementsExpanded');
    return stored === null ? true : stored === 'true';
  });

  // Active tab stored in localStorage (UI preference)
  const [activeTab, setActiveTab] = useState('crowdfunding');

  // Visited tabs (localStorage) – not essential but kept
  const [visitedTabs, setVisitedTabs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('announcements:visitedTabs')) || {};
    } catch { return {}; }
  });

  // Server-side unread counts for Waitlist / Crowdfunding / Applications
  const [serverUnread, setServerUnread] = useState({ waitlist: 0, crowdfunding: 0, applications: 0 });

  // Fetch server unread counts for other tabs
  useEffect(() => {
    const fetchServerUnread = async () => {
      try {
        const [accessRes, fundingRes, appRes] = await Promise.all([
          notificationAPI.getByCategory('access'),
          notificationAPI.getByCategory('funding'),
          notificationAPI.getByCategory('application'),
        ]);
        const countUnread = (res) => {
          const items = res?.notifications || res?.data?.notifications || [];
          return items.filter(n => !n.is_read).length;
        };
        setServerUnread({
          waitlist: countUnread(accessRes),
          crowdfunding: countUnread(fundingRes),
          applications: countUnread(appRes),
        });
      } catch (err) {
        console.error('Failed to fetch server unread counts', err);
      }
    };
    fetchServerUnread();
  }, []);

  // Persist expansion state and active tab to localStorage
  useEffect(() => {
    localStorage.setItem('preferences:announcementsExpanded', isExpanded);
  }, [isExpanded]);

  useEffect(() => {
    localStorage.setItem('announcements:activeTab', activeTab);
  }, [activeTab]);

  // Auto‑expand if there are unread announcements or newsletters
  useEffect(() => {
    if (announcementsUnread > 0 || newsletterUnread > 0) {
      setIsExpanded(true);
    }
  }, [announcementsUnread, newsletterUnread]);

  // Auto‑switch to the tab that has unread items on mount
  useEffect(() => {
    if (announcementsUnread > 0) {
      setActiveTab('announcements');
    } else if (newsletterUnread > 0) {
      setActiveTab('newsletter');
    } else {
      const stored = localStorage.getItem('announcements:activeTab');
      if (stored) {
        setActiveTab(stored);
      }
    }
  }, [announcementsUnread, newsletterUnread]);

  // Mark a tab as visited
  const markTabVisited = (tabId) => {
    setVisitedTabs(prev => {
      const next = { ...prev, [tabId]: true };
      localStorage.setItem('announcements:visitedTabs', JSON.stringify(next));
      return next;
    });
  };

  // Handle tab click: switch tab and mark all as read for announcements/newsletter
  const handleTabClick = (newTabId) => {
    setActiveTab(newTabId);
    markTabVisited(newTabId);

    if (newTabId === 'announcements') {
      markAnnouncementsRead(); // optimistic mark all read
    } else if (newTabId === 'newsletter') {
      markNewsletterRead();
    } else if (newTabId === 'waitlist') {
      notificationAPI.markAllRead('access').catch(() => {});
      setServerUnread(prev => ({ ...prev, waitlist: 0 }));
    } else if (newTabId === 'crowdfunding') {
      notificationAPI.markAllRead('funding').catch(() => {});
      setServerUnread(prev => ({ ...prev, crowdfunding: 0 }));
    } else if (newTabId === 'applications') {
      notificationAPI.markAllRead('application').catch(() => {});
      setServerUnread(prev => ({ ...prev, applications: 0 }));
    }
  };

  // Tabs definition with badge counts
  const tabs = useMemo(() => [
    { id: 'announcements', label: 'Announcements', icon: Megaphone, badge: announcementsUnread },
    { id: 'newsletter', label: 'Newsletter', icon: Mail, badge: newsletterUnread },
    { id: 'waitlist', label: 'Waitlist', icon: Bell, badge: serverUnread.waitlist },
    { id: 'crowdfunding', label: 'Crowdfunding', icon: Zap, badge: serverUnread.crowdfunding },
    { id: 'applications', label: 'Applications', icon: FileText, badge: serverUnread.applications },
  ], [announcementsUnread, newsletterUnread, serverUnread]);

  // Filtering (by priority) – keep as before
  const filteredAnnouncements = useMemo(() => {
    if (announcementFilter === 'all' || announcementFilter === '') return announcements;
    return announcements.filter(a => a.priority === announcementFilter);
  }, [announcements, announcementFilter]);

  const filteredNewsletter = useMemo(() => {
    if (newsletterFilter === 'all') return newsletters;
    return newsletters.filter(n => n.priority === newsletterFilter);
  }, [newsletters, newsletterFilter]);

  // Group by month
  const groupByMonth = (items) => {
    const grouped = {};
    items.forEach(item => {
      const date = new Date(item.createdAt);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(item);
    });
    return grouped;
  };

  const announcementsByMonth = useMemo(() => groupByMonth(filteredAnnouncements), [filteredAnnouncements]);
  const newsletterByMonth = useMemo(() => groupByMonth(filteredNewsletter), [filteredNewsletter]);

  // Admin handlers – update context after changes
  const handleDeleteAnnouncement = async (id) => {
    try {
      await notificationAPI.deleteAnnouncement(id);
      refreshAnnouncements(); // reload from server
      setDeleteModal({ isOpen: false, type: null, id: null });
    } catch (error) {
      console.error('Failed to delete announcement', error);
    }
  };

  const handleDeleteNewsletter = async (id) => {
    try {
      await notificationAPI.deleteNewsletter(id);
      refreshNewsletter();
      setDeleteModal({ isOpen: false, type: null, id: null });
    } catch (error) {
      console.error('Failed to delete newsletter', error);
    }
  };

  const handleClearAll = async (type) => {
    try {
      if (type === 'announcements') {
        await notificationAPI.clearAllAnnouncements();
        refreshAnnouncements();
      } else if (type === 'newsletter') {
        await notificationAPI.clearAllNewsletters();
        refreshNewsletter();
      }
      setDeleteModal({ isOpen: false, type: null, id: null });
    } catch (error) {
      console.error('Failed to clear all', error);
    }
  };

  const handleEditAnnouncement = async (formData) => {
    try {
      await notificationAPI.updateAnnouncement(editModal.announcement.id, formData);
      refreshAnnouncements();
      setEditModal({ isOpen: false, announcement: null });
    } catch (error) {
      console.error('Failed to update announcement', error);
    }
  };

  // Compute total unread for header badge
  const totalUnread = announcementsUnread + newsletterUnread;

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/10 shadow-lg overflow-hidden">
      {/* Edit Announcement Modal */}
      <EditAnnouncementModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, announcement: null })}
        announcement={editModal.announcement}
        onSave={handleEditAnnouncement}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, type: null, id: null })}
        onConfirm={() => {
          if (deleteModal.type === 'announcement' && deleteModal.id) {
            handleDeleteAnnouncement(deleteModal.id);
          } else if (deleteModal.type === 'newsletter' && deleteModal.id) {
            handleDeleteNewsletter(deleteModal.id);
          } else if (deleteModal.type === 'clearAnnouncements') {
            handleClearAll('announcements');
          } else if (deleteModal.type === 'clearNewsletter') {
            handleClearAll('newsletter');
          }
        }}
        title="Confirm Delete"
        message="Are you sure? This action cannot be undone."
        type="soft"
      />

      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-white/[0.02]">
        <motion.div className="flex items-center gap-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="p-2 bg-white/5 rounded-lg">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white">
            Announcements
          </h2>
          {totalUnread > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2 py-1 bg-white/10 rounded-full"
            >
              <span className="text-xs font-semibold text-white">
                {plotCount(totalUnread)}
              </span>
            </motion.div>
          )}
        </motion.div>
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 0 : -90 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="h-5 w-5 text-white/60" />
          </motion.div>
        </motion.button>
      </div>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 px-6 py-4 border-b border-white/10 bg-white/[0.01] overflow-x-auto">
              {tabs.map(({ id, label, icon: Icon, badge, isNew }) => (
                <motion.button
                  key={id}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTabClick(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap relative ${activeTab === id
                      ? 'bg-linear-to-br from-amber-500 via-pink-600 to-purple-500 text-white border border-white/20 shadow-lg shadow-purple-500/20'
                      : 'bg-white/5 text-white/80 hover:bg-white/10 border border-white/10 hover:border-white/20'
                    }`}
                  layout
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center text-xs font-bold bg-red-500 text-white rounded-full"
                    >
                      {badge > 99 ? '99+' : badge}
                    </motion.span>
                  )}
                  {isNew && !badge && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]"
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 max-h-[800px] overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 'announcements' && (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Search announcements..."
                          onChange={(e) => setAnnouncementFilter(e.target.value)}
                          className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition"
                        />
                        {isAdmin && announcements.length > 0 && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setDeleteModal({ isOpen: true, type: 'clearAnnouncements', id: null })}
                            className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50 transition flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Clear All
                          </motion.button>
                        )}
                      </div>
                      <div className="space-y-8">
                        {Object.keys(announcementsByMonth).length > 0 ? (
                          Object.entries(announcementsByMonth).map(([month, items]) => (
                            <div key={month}>
                              <h3 className="text-sm font-semibold text-white/60 mb-4 pl-3 border-l-2 border-white/20 uppercase tracking-wide">
                                {month}
                              </h3>
                              <div className="space-y-4">
                                {items.map((announcement, idx) => (
                                  <motion.div
                                    key={announcement.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`p-5 rounded-lg border transition-all hover:border-white/30 ${announcement.is_read
                                      ? 'bg-white/[0.03] border-white/10'
                                      : 'bg-white/[0.07] border-white/20 shadow-xl shadow-blue-500/5'
                                      }`}
                                  >
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                      <h3 className="text-base font-semibold text-white flex-1 leading-relaxed">{announcement.title}</h3>
                                      <div className="flex gap-2 flex-shrink-0">
                                        {announcement.linkUrl && (
                                          <Link
                                            to={announcement.linkUrl}
                                            className="text-xs px-3 py-1.5 bg-blue-500/80 hover:bg-blue-500 rounded-full text-white transition-colors"
                                          >
                                            View
                                          </Link>
                                        )}
                                        {isAdmin && (
                                          <>
                                            <motion.button
                                              whileHover={{ scale: 1.1 }}
                                              whileTap={{ scale: 0.95 }}
                                              onClick={() => setEditModal({ isOpen: true, announcement })}
                                              className="p-1.5 rounded-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 transition"
                                            >
                                              <Edit2 className="h-4 w-4" />
                                            </motion.button>
                                            <motion.button
                                              whileHover={{ scale: 1.1 }}
                                              whileTap={{ scale: 0.95 }}
                                              onClick={() => setDeleteModal({ isOpen: true, type: 'announcement', id: announcement.id })}
                                              className="p-1.5 rounded-full bg-red-600/20 hover:bg-red-600/30 text-red-400 transition"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </motion.button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-sm text-white/90 mt-3 leading-relaxed font-medium whitespace-pre-wrap">{announcement.message}</p>
                                    <span className="text-xs text-white/50 block">
                                      {formatFriendlyDate(announcement.createdAt)}
                                    </span>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-white/40 py-12">No announcements at this time.</p>
                        )}
                      </div>
                    </div>
                  )}
                  {activeTab === 'newsletter' && (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Search newsletter..."
                          onChange={(e) => setNewsletterFilter(e.target.value)}
                          className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition"
                        />
                        {isAdmin && newsletters.length > 0 && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setDeleteModal({ isOpen: true, type: 'clearNewsletter', id: null })}
                            className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50 transition flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Clear All
                          </motion.button>
                        )}
                      </div>

                      <div className="space-y-8">
                        {Object.keys(newsletterByMonth).length > 0 ? (
                          Object.entries(newsletterByMonth).map(([month, items]) => (
                            <div key={month}>
                              <h3 className="text-sm font-semibold text-white/60 mb-4 pl-3 border-l-2 border-white/20 uppercase tracking-wide">
                                {month}
                              </h3>
                              <div className="space-y-4">
                                {items.map((item, idx) => (
                                  <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`p-5 rounded-lg border transition-all hover:border-white/30 ${item.is_read
                                      ? 'bg-white/[0.03] border-white/10'
                                      : 'bg-white/[0.07] border-white/20 shadow-xl shadow-purple-500/5'
                                      }`}
                                  >
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                      <h3 className="text-base font-semibold text-white flex-1 leading-relaxed">{item.title}</h3>
                                      {isAdmin && (
                                        <motion.button
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => setDeleteModal({ isOpen: true, type: 'newsletter', id: item.id })}
                                          className="p-1.5 rounded-full bg-red-600/20 hover:bg-red-600/30 text-red-400 transition flex-shrink-0"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </motion.button>
                                      )}
                                    </div>
                                    <p className="text-sm text-white/90 mt-3 leading-relaxed font-medium whitespace-pre-wrap line-clamp-4">{item.message}</p>
                                    <span className="text-xs text-white/50 mt-4 block">{formatFriendlyDate(item.createdAt)}</span>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-white/40 py-12">No newsletter updates at this time.</p>
                        )}
                      </div>
                    </div>
                  )}
                  {activeTab === 'waitlist' && (
                    <div className="space-y-6">
                      <WaitlistSection />
                    </div>
                  )}
                  {activeTab === 'crowdfunding' && (
                    <div className="space-y-6">
                      <CrowdfundingSection />
                      <DonationSection />
                    </div>
                  )}
                  {activeTab === 'applications' && user && (!hideShowJobApplication || !hideInfluencerInfo) && (
                    <div className="space-y-6">
                      {!hideShowJobApplication && (
                        <JoinSFSection setHideJobApplication={setHideJobApplication} />
                      )}
                      {user && !hideInfluencerInfo && (
                        <InfluencerProfileSection userData={user} setHideInfluencerInfo={setHideInfluencerInfo} />
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}