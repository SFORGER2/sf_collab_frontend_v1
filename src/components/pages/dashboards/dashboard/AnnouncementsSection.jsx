import { useEffect, useMemo, useState } from "react";
import CrowdfundingSection from "./CrowdfundingSection";
import DonationSection from "./DonationSection";
import WaitlistSection from "./WaitlistSection";
import { useSelector } from "react-redux";
import JoinSFSection from "./JoinSFSection";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Zap, Users, FileText, ChevronDown, Mail, Megaphone, Trash2, Edit2, X, ArrowUpRight } from "lucide-react";
import InfluencerProfileSection from "./InfluencerSection";
import notificationAPI from "@/utils/APIs/notificationAPI";
import { Link } from "react-router-dom";
import { plotCount } from "@/utils/plotCount";
import { formatFriendlyDate } from "@/utils/formatFriendlyDate";
import DeleteConfirmationModal from "@/utils/confirm";
import { useAnnouncements } from '@/contexts/AnnouncementContext';
import { useNewsletter } from '@/contexts/NewsletterContext';

// Edit Modal Component for Announcements & Newsletters
function EditItemModal({ isOpen, onClose, item, type, onSave }) {
  const [formData, setFormData] = useState({ title: '', message: '', linkUrl: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        message: item.message || '',
        linkUrl: item.linkUrl || item.link_url || '',
      });
    }
  }, [item, isOpen]);

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
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md backdrop-blur-xl shadow-2xl"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Edit {type === 'announcement' ? 'Announcement' : 'Newsletter'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition"
              placeholder="Enter title..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition resize-none h-32"
              placeholder="Enter content..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Link URL (optional)</label>
            <input
              type="text"
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition"
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
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// Reading Modal Component for Newsletters / Announcements
function ReadItemModal({ isOpen, onClose, item, type }) {
  if (!isOpen || !item) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#0d0d0d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{formatFriendlyDate(item.createdAt)}</span>
              {item.category && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-700" />
                  <span className="text-purple-400 font-medium uppercase">{item.category}</span>
                </>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
              {item.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 text-gray-300 space-y-4">
          {(item.message || item.content)?.split("\n\n").map((para, i) => (
            <p key={i} className="leading-relaxed text-sm md:text-base font-light whitespace-pre-wrap">
              {para}
            </p>
          ))}
          {(item.linkUrl || item.link_url) && (
            <div className="pt-4">
              <a
                href={item.linkUrl || item.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Open Link <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-white/[0.01] flex items-center justify-between text-xs text-gray-500">
          <span>SFCollab {type === 'announcement' ? 'Announcement' : 'Newsletter'} Update</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}


export default function AnnouncementsSection({ userRoles }) {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = useMemo(() => user?.role === 'admin', [user]);

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

  const [announcementFilter, setAnnouncementFilter] = useState('all');
  const [newsletterFilter, setNewsletterFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, id: null });
  const [editModal, setEditModal] = useState({ isOpen: false, announcement: null });
  const [hideInfluencerInfo, setHideInfluencerInfo] = useState(false);
  const [hideShowJobApplication, setHideJobApplication] = useState(false);

  const [isExpanded, setIsExpanded] = useState(() => {
    const stored = localStorage.getItem('preferences:announcementsExpanded');
    return stored === null ? true : stored === 'true';
  });
  const [userMinimized, setUserMinimized] = useState(() =>
    localStorage.getItem('announcements:userMinimized') === 'true'
  );
  const [lastSeenId, setLastSeenId] = useState(() =>
    localStorage.getItem('announcements:lastSeenId') || null
  );

  // Active tab stored in localStorage (UI preference)
  const [activeTab, setActiveTab] = useState('crowdfunding');

  const [visitedTabs, setVisitedTabs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('announcements:visitedTabs')) || {};
    } catch { return {}; }
  });

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

  useEffect(() => {
    localStorage.setItem('preferences:announcementsExpanded', isExpanded);
  }, [isExpanded]);

  useEffect(() => {
    localStorage.setItem('announcements:activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (announcementsUnread > 0 || newsletterUnread > 0) {
      setIsExpanded(true);
    }
  }, [announcementsUnread, newsletterUnread]);

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

  const handleTabClick = (newTabId) => {
    setActiveTab(newTabId);
    markTabVisited(newTabId);

    if (newTabId === 'announcements') {
      markAnnouncementsRead();
    } else if (newTabId === 'newsletter') {
      markNewsletterRead();
    } else if (newTabId === 'waitlist') {
      notificationAPI.markAllRead('access').catch(() => { });
      setServerUnread(prev => ({ ...prev, waitlist: 0 }));
    } else if (newTabId === 'crowdfunding') {
      notificationAPI.markAllRead('funding').catch(() => { });
      setServerUnread(prev => ({ ...prev, crowdfunding: 0 }));
    } else if (newTabId === 'applications') {
      notificationAPI.markAllRead('application').catch(() => { });
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

const handleDeleteAnnouncement = async (id) => {
  try {
    await notificationAPI.deleteAnnouncement(id);
    refreshAnnouncements();
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

// Toggle the expand/collapse of the whole section (header chevron button).
// If the user manually collapses it, remember that via userMinimized so
// we don't auto re-expand until a genuinely new announcement arrives.
const handleToggleExpanded = () => {
  setIsExpanded((prev) => {
    const next = !prev;
    setUserMinimized(!next);
    localStorage.setItem('announcements:userMinimized', String(!next));
    return next;
  });
};

const totalUnread = announcementsUnread + newsletterUnread;

return (
  <div>placeholder</div>
);
}