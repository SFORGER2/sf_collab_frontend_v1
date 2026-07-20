import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  RefreshCw,
  Settings,
  Wifi,
  WifiOff,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import NotificationItem from "./NotificationItem";
import { useNotifications } from "@/contexts/NotificationContext";

export default function NotificationPage() {
  const ctx = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  // Keep compatibility with either naming style
  const notifications = ctx.notifications || [];
  const unreadCount = ctx.unreadCount ?? 0;
  const loading = ctx.loading ?? ctx.isLoading ?? false;
  const hasMore = ctx.hasMore ?? false;
  const isConnected = ctx.isConnected ?? true;

  const refresh = ctx.refresh || (async () => {});
  const loadMore = ctx.loadMore || (async () => {});
  const applyFilters = ctx.applyFilters || (() => {});
  const markAllAsRead = ctx.markAllAsRead || (async () => {});
  const deleteAllRead = ctx.deleteAllRead || (async () => {});
  const deleteNotification = ctx.deleteNotification || (async () => {});
  const markAsRead = ctx.markAsRead || (async () => {});

  const clearAllNotifications = ctx.clearAllNotifications;
  const error = ctx.error;

  const [activeFilter, setActiveFilter] = useState("general");
  const [isClearing, setIsClearing] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);

  // Filter definitions
  const filters = useMemo(
    () => [
      { id: "general", label: "General", icon: null, filter: { category: "general" } },
      { id: "newsletter", label: "Newsletter", icon: null, filter: { category: "newsletter" } },
      { id: "all", label: "All", icon: null, filter: {} },
      { id: "unread", label: "Unread", icon: null, filter: { is_read: "false" } },
      { id: "success", label: "Success", icon: null, filter: { type: "success" } },
      { id: "info", label: "Info", icon: null, filter: { type: "info" } },
      { id: "warning", label: "Warnings", icon: null, filter: { type: "warning" } },
      { id: "error", label: "Errors", icon: null, filter: { type: "error" } },
    ],
    []
  );

  // Local filtering
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    switch (activeFilter) {
      case "general":
        filtered = notifications.filter((n) => n.category !== "newsletter");
        break;
      case "newsletter":
        filtered = notifications.filter((n) => n.category === "newsletter");
        break;
      case "unread":
        filtered = notifications.filter((n) => !n.is_read);
        break;
      case "success":
        filtered = notifications.filter((n) => n.type === "success");
        break;
      case "info":
        filtered = notifications.filter((n) => n.type === "info");
        break;
      case "warning":
        filtered = notifications.filter((n) => n.type === "warning");
        break;
      case "error":
        filtered = notifications.filter((n) => n.type === "error");
        break;
      case "all":
      default:
        break;
    }

    return filtered;
  }, [notifications, activeFilter]);

  // Handle filter change
  const handleFilterChange = useCallback(
    (f) => {
      navigate(`/notifications?tab=${f.id}`);
    },
    [navigate]
  );

  // Handle mark all as read
  const handleMarkAllRead = useCallback(async () => {
    await markAllAsRead();
    // No refresh() — markAllAsRead is optimistic, refresh would race and revert
  }, [markAllAsRead]);

  // Handle delete all read
  const handleDeleteAllRead = useCallback(async () => {
    await deleteAllRead();
    // No refresh() — local state is already updated optimistically
  }, [deleteAllRead]);

  // Handle clear all with custom modal
  const handleClearAll = useCallback(async () => {
    if (!clearAllNotifications) return;

    setConfirmModal({
      title: "Clear all notifications?",
      message: "This will permanently delete all your notifications and cannot be undone.",
      onConfirm: async () => {
        setIsClearing(true);
        try {
          await clearAllNotifications();
        } finally {
          setIsClearing(false);
          setConfirmModal(null);
        }
      },
    });
  }, [clearAllNotifications]);

  // Handle notification delete
  const handleNotificationDelete = useCallback(async (notificationId) => {
    try {
      await deleteNotification(notificationId);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }, [deleteNotification]);

  // Set active filter based on URL ?tab= parameter or fallback to general
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    const targetFilter = filters.find((x) => x.id === tabParam) || filters.find((x) => x.id === "general") || filters[0];
    setActiveFilter(targetFilter.id);
    applyFilters(targetFilter.filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Mark all notifications as read when the user LEAVES the page (unmount).
  // This keeps the unread highlights visible while they are on the page,
  // then clears the bell badge the moment they navigate away.
  useEffect(() => {
    return () => {
      markAllAsRead().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 px-4 py-6">
      {/* ================= HEADER ================= */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-gray-800 border border-gray-700 p-6"
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Bell className="w-5 h-5 text-blue-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Notifications
              </h1>

              <div className="flex items-center gap-1 ml-2">
                {isConnected ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-green-400">Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-500">Offline</span>
                  </>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-400">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                : "You're all caught up"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <HeaderButton icon={RefreshCw} onClick={refresh} loading={loading}>
              Refresh
            </HeaderButton>

            <HeaderButton
              icon={Settings}
              onClick={() => navigate("/user-profile?page=notifications")}
            >
              Settings
            </HeaderButton>

            {notifications.length > 0 && (
              <>
                <HeaderButton
                  icon={CheckCheck}
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0}
                >
                  Mark all read
                </HeaderButton>

                <HeaderButton danger icon={Trash2} onClick={handleDeleteAllRead}>
                  Delete all read
                </HeaderButton>

                {typeof clearAllNotifications === "function" && (
                  <HeaderButton
                    danger
                    icon={isClearing ? Loader2 : AlertCircle}
                    onClick={handleClearAll}
                    loading={isClearing}
                  >
                    Clear all
                  </HeaderButton>
                )}
              </>
            )}
          </div>
        </div>
      </motion.header>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* ================= FILTERS ================= */}
      <motion.section
        layout
        className="rounded-xl bg-white/[0.03] border border-white/10 p-4 flex gap-2 overflow-x-auto"
      >
        {filters.map((f) => {
          const Icon = f.icon;
          return (
            <motion.button
              key={f.id}
              layout
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => handleFilterChange(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2
                ${
                  activeFilter === f.id
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
            >
              {Icon ? <Icon className="w-4 h-4" /> : null}
              {f.label}
              {f.id === "unread" && unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-indigo-500 text-white">
                  {unreadCount}
                </span>
              )}
            </motion.button>
          );
        })}
      </motion.section>

      {/* ================= CONTENT ================= */}
      <section className="space-y-3">
        <AnimatePresence mode="popLayout">
          {loading && notifications.length === 0 && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingState />
            </motion.div>
          )}

          {!loading && filteredNotifications.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState
                label={
                  activeFilter === "newsletter"
                    ? "No newsletter notifications"
                    : activeFilter === "unread"
                    ? "No unread notifications"
                    : "No notifications found"
                }
              />
            </motion.div>
          )}

          {filteredNotifications.map((n) => (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <NotificationItem
                notification={n}
                onMarkAsRead={() => {}}
                onDelete={handleNotificationDelete}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </section>

      {hasMore && activeFilter === "all" && (
        <div className="flex justify-center pt-6">
          <motion.button
            onClick={loadMore}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:border-indigo-500/40 transition disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load more notifications"}
          </motion.button>
        </div>
      )}

      {/* ================= CONFIRMATION MODAL ================= */}
      <ConfirmationModal modal={confirmModal} onClose={() => setConfirmModal(null)} />
    </div>
  );
}

/* ================= SUBCOMPONENTS ================= */

function HeaderButton({ icon: Icon, danger, loading, disabled, onClick, children }) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition
        ${
          danger
            ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
            : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <Icon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
      {children}
    </motion.button>
  );
}

function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[250px] rounded-2xl bg-slate-900/30 border border-slate-800/60 p-8 text-center shadow-inner">
      <div className="p-4 rounded-full bg-slate-800/60 text-slate-500 mb-4 ring-1 ring-slate-700/50 shadow-md">
        <Bell className="w-8 h-8 opacity-60" />
      </div>
      <p className="text-base font-semibold text-slate-300">{label}</p>
      <p className="text-xs text-slate-500 mt-1 max-w-xs">When new notifications match this category, they will automatically appear here.</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] text-white/40">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mb-4" />
      <p className="text-sm">Loading notifications...</p>
    </div>
  );
}

function ConfirmationModal({ modal, onClose }) {
  if (!modal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="rounded-xl bg-gray-800 border border-gray-700 p-6 w-96 shadow-2xl"
        >
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-lg font-bold text-white">{modal.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-300 mb-6">{modal.message}</p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              onClick={modal.onConfirm}
              className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
            >
              Confirm
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}