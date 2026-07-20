import React from "react";
import { Clock, CheckCircle, Settings, Archive } from "lucide-react";

const NotificationsHeader = ({
  unreadCount,
  onRefresh,
  onDismissAll,
  disabledDismissAll,
  settings,
  setSettings,
  showSettings,
  setShowSettings,
  isArchivedTab,
  disabledArchiveAction,
  onArchiveVisible,
  onUnarchiveVisible,
  headerSettingsRef,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-xs text-gray-400">
          Stay updated with your projects, team, and system alerts
        </p>
      </div>

      <div className="flex items-center gap-3" ref={headerSettingsRef}>
        <button
          onClick={onRefresh}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          title="Refresh notifications"
        >
          <Clock className="h-5 w-5" />
        </button>
        <button
          onClick={onDismissAll}
          disabled={disabledDismissAll}
          className="p-2 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
          title="Dismiss all notifications"
        >
          <CheckCircle className="h-5 w-5" />
        </button>

        {showSettings && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-lg p-4 z-50">
            <h4 className="text-sm font-semibold mb-3">Notification Settings</h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between text-sm">
                <span>Sound on new notifications</span>
                <input
                  type="checkbox"
                  checked={settings.playSoundOnNew}
                  onChange={(e) => setSettings((s) => ({ ...s, playSoundOnNew: e.target.checked }))}
                />
              </label>
              <label className="flex items-center justify-between text-sm">
                <span>Desktop notifications</span>
                <input
                  type="checkbox"
                  checked={settings.enableDesktop}
                  onChange={(e) => setSettings((s) => ({ ...s, enableDesktop: e.target.checked }))}
                />
              </label>
              <label className="flex items-center justify-between text-sm">
                <span>Auto-archive read notifications</span>
                <input
                  type="checkbox"
                  checked={settings.autoArchiveRead}
                  onChange={(e) => setSettings((s) => ({ ...s, autoArchiveRead: e.target.checked }))}
                />
              </label>
              <label className="flex items-center justify-between text-sm">
                <span>Confirm before clearing all</span>
                <input
                  type="checkbox"
                  checked={settings.confirmBeforeClear}
                  onChange={(e) => setSettings((s) => ({ ...s, confirmBeforeClear: e.target.checked }))}
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsHeader; 