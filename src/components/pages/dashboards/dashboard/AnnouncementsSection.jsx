import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Megaphone, Trash2, Edit2, X, ArrowUpRight } from "lucide-react";
import notificationAPI from "@/utils/APIs/notificationAPI";
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
        className="cosmos-panel p-6 w-full max-w-md"
      >
        <h2 className="font-display text-lg text-star mb-4">
          Edit {type === 'announcement' ? 'Announcement' : 'Newsletter'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="cosmos-stat-label block mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-star placeholder-dim focus:outline-none focus:border-violet transition"
              placeholder="Enter title…"
            />
          </div>
          <div>
            <label className="cosmos-stat-label block mb-2">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-star placeholder-dim focus:outline-none focus:border-violet transition resize-none h-32"
              placeholder="Enter content…"
            />
          </div>
          <div>
            <label className="cosmos-stat-label block mb-2">Link URL (optional)</label>
            <input
              type="text"
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-star placeholder-dim focus:outline-none focus:border-violet transition"
              placeholder="https://example.com"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/10 text-star border border-white/10 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-full bg-gradient-to-r from-[#ffcf7d] to-[#ffb547] text-[#241300] font-medium transition disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Save'}
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
        className="relative w-full max-w-2xl cosmos-panel overflow-hidden flex flex-col max-h-[80vh] p-0"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.14em] uppercase text-dim">
              <span>{formatFriendlyDate(item.createdAt)}</span>
              {item.category && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/25" />
                  <span className="text-violet">{item.category}</span>
                </>
              )}
            </div>
            <h2 className="font-display text-xl md:text-2xl text-star leading-tight">
              {item.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-dim hover:text-star transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 text-star/85 space-y-4 scrollbar-visible">
          {(item.message || item.content)?.split("\n\n").map((para, i) => (
            <p key={i} className="leading-relaxed text-sm md:text-base whitespace-pre-wrap">
              {para}
            </p>
          ))}
          {(item.linkUrl || item.link_url) && (
            <div className="pt-4">
              <a
                href={item.linkUrl || item.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#ffcf7d] to-[#ffb547] text-[#241300] text-sm font-medium transition-opacity hover:opacity-90"
              >
                Open Link <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-dim">
            SFCollab {type === 'announcement' ? 'Announcement' : 'Newsletter'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/10 text-star text-sm transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Announcements / Newsletter — the dashboard's "from SF" feed.
 *
 * Exactly two tabs: platform Announcements, and the SF Newsletter. The other
 * notification categories (waitlist, crowdfunding, applications) belong to the
 * notifications page, not here — this widget is the channel through which
 * SFCollab itself speaks to users.
 *
 * Lives on the dashboard only; it was removed from the Learning menu.
 */
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

  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem('announcements:activeTab') || 'announcements'
  );
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, id: null });
  const [editModal, setEditModal] = useState({ isOpen: false, announcement: null, type: 'announcement' });
  const [readModal, setReadModal] = useState({ isOpen: false, item: null, type: 'announcement' });
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    localStorage.setItem('announcements:activeTab', activeTab);
  }, [activeTab]);

  // Jump to whichever tab has unread items when they arrive.
  useEffect(() => {
    if (announcementsUnread > 0) setActiveTab('announcements');
    else if (newsletterUnread > 0) setActiveTab('newsletter');
  }, [announcementsUnread, newsletterUnread]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setShowAll(false);
    if (tabId === 'announcements') markAnnouncementsRead();
    else markNewsletterRead();
  };

  const tabs = [
    { id: 'announcements', label: 'Announcements', icon: Megaphone, badge: announcementsUnread },
    { id: 'newsletter', label: 'Newsletter · from SF', icon: Mail, badge: newsletterUnread },
  ];

  const items = activeTab === 'announcements' ? announcements : newsletters;
  const shown = showAll ? items : items.slice(0, 4);
  const modalType = activeTab === 'announcements' ? 'announcement' : 'newsletter';

  const handleDelete = async (id) => {
    try {
      if (deleteModal.type === 'announcement') {
        await notificationAPI.deleteAnnouncement(id);
        refreshAnnouncements();
      } else {
        await notificationAPI.deleteNewsletter(id);
        refreshNewsletter();
      }
    } catch (error) {
      console.error('Failed to delete item', error);
    } finally {
      setDeleteModal({ isOpen: false, type: null, id: null });
    }
  };

  const handleEdit = async (formData) => {
    try {
      await notificationAPI.updateAnnouncement(editModal.announcement.id, formData);
      refreshAnnouncements();
    } catch (error) {
      console.error('Failed to update announcement', error);
    } finally {
      setEditModal({ isOpen: false, announcement: null, type: 'announcement' });
    }
  };

  return (
    <div className="flex flex-col gap-4" style={{ '--cosmos-accent': '#ffbf5e' }}>
      {/* Two-tab switcher — mono segmented control, same as the calendar's */}
      <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10 self-start">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              aria-pressed={active}
              className={`flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] uppercase px-3 py-1.5 rounded-full transition-colors ${
                active ? 'bg-gold/15 text-gold' : 'text-dim hover:text-star'
              }`}
            >
              <Icon size={12} />
              {tab.label}
              {tab.badge > 0 && (
                <span className="min-w-[16px] h-4 px-1 rounded-full bg-gold text-[#241300] text-[9px] font-bold flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Feed */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="flex flex-col divide-y divide-white/[0.07]"
        >
          {shown.length === 0 && (
            <p className="text-[0.9rem] text-dim py-6 text-center">
              {activeTab === 'announcements'
                ? 'No announcements right now.'
                : 'No newsletters yet — the next SF update lands here.'}
            </p>
          )}

          {shown.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setReadModal({ isOpen: true, item, type: modalType })}
              className="group flex items-start gap-3 py-3 text-left w-full"
            >
              {!item.isRead && (
                <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-2" aria-label="Unread" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-[0.95rem] text-star leading-snug line-clamp-1 group-hover:text-gold transition-colors">
                  {item.title}
                </span>
                <span className="block text-[0.85rem] text-dim line-clamp-1 mt-0.5">
                  {item.message || item.content}
                </span>
                <span className="block font-mono text-[10px] tracking-[0.1em] uppercase text-dim mt-1">
                  {formatFriendlyDate(item.createdAt)}
                </span>
              </span>

              {isAdmin && (
                <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {activeTab === 'announcements' && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditModal({ isOpen: true, announcement: item, type: modalType });
                      }}
                      className="p-1.5 rounded-md text-dim hover:text-cyan hover:bg-cyan/10 transition-colors"
                    >
                      <Edit2 size={13} />
                    </span>
                  )}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteModal({ isOpen: true, type: modalType, id: item.id });
                    }}
                    className="p-1.5 rounded-md text-dim hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 size={13} />
                  </span>
                </span>
              )}
            </button>
          ))}
        </motion.div>
      </AnimatePresence>

      {items.length > 4 && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="self-start font-mono text-[10px] tracking-[0.14em] uppercase text-dim hover:text-gold transition-colors"
        >
          {showAll ? 'Show fewer' : `Show all ${items.length}`}
        </button>
      )}

      {/* Modals */}
      <AnimatePresence>
        {readModal.isOpen && (
          <ReadItemModal
            isOpen={readModal.isOpen}
            onClose={() => setReadModal({ isOpen: false, item: null, type: 'announcement' })}
            item={readModal.item}
            type={readModal.type}
          />
        )}
        {editModal.isOpen && (
          <EditItemModal
            isOpen={editModal.isOpen}
            onClose={() => setEditModal({ isOpen: false, announcement: null, type: 'announcement' })}
            item={editModal.announcement}
            type={editModal.type}
            onSave={handleEdit}
          />
        )}
      </AnimatePresence>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, type: null, id: null })}
        onConfirm={() => handleDelete(deleteModal.id)}
        title={`Delete ${deleteModal.type === 'announcement' ? 'Announcement' : 'Newsletter'}`}
        description="Are you sure? This cannot be undone."
        type="soft"
      />
    </div>
  );
}
