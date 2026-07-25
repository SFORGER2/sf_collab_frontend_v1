/**
 * components/notifications/NotificationPreferences.jsx
 *
 * Full notification preferences panel.
 * Rendered at /user-profile?page=notifications
 * or embedded inside a Settings section.
 *
 * Controls:
 *  - Master toggle (all notifications)
 *  - Toast popup toggle
 *  - Per-category mutes
 *  - Quiet hours (start / end)
 *  - Push notification device registration
 */

import { useState, useEffect } from "react";
import { Bell, BellOff, Moon, Zap, Save, Loader2, CheckCircle } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import notificationAPI from "@/utils/APIs/notificationAPI";

const CATEGORIES = [
  { key: "account",     label: "Account & Security",   desc: "Login alerts, password changes" },
  { key: "social",      label: "Social & Connections",  desc: "Follows, friend requests, reactions" },
  { key: "message",     label: "Messages",              desc: "Direct messages, group chats" },
  { key: "task",        label: "Tasks & Reminders",     desc: "Deadlines, overdue tasks, assignments" },
  { key: "idea",        label: "Ideas & Innovation",    desc: "Votes, feedback, collaboration requests" },
  { key: "startup",     label: "Startups & Projects",   desc: "Team updates, milestones" },
  { key: "payment",     label: "Payments & Payouts",    desc: "Transactions, wallet updates" },
  { key: "marketplace", label: "Marketplace",           desc: "Sales, new listings, ratings" },
  { key: "mentorship",  label: "Mentorship",            desc: "Session requests, session summaries" },
  { key: "funding",     label: "Funding & Investment",  desc: "Investor interest, rounds" },
  { key: "moderation",  label: "Moderation Alerts",     desc: "Content reports, warnings" },
  { key: "ai",          label: "AI & Automation",       desc: "AI suggestions, reports" },
  { key: "event",       label: "Events & Calendar",     desc: "Reminders, starting-soon alerts" },
  { key: "system",      label: "System",                desc: "Platform updates, maintenance" },
];

export default function NotificationPreferences() {
  const { prefs, updatePrefs } = useNotifications();

  const [local,   setLocal]   = useState(prefs);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [pushMsg, setPushMsg] = useState(null);

  // Sync if prefs change externally
  useEffect(() => { setLocal(prefs); }, [prefs]);

  const toggle = (key, value) =>
    setLocal(prev => ({ ...prev, [key]: value ?? !prev[key] }));

  const toggleCategory = (cat) => {
    const muted = local.mutedCategories ?? [];
    const next  = muted.includes(cat)
      ? muted.filter(c => c !== cat)
      : [...muted, cat];
    setLocal(prev => ({ ...prev, mutedCategories: next }));
  };

  const setQuietHour = (field, value) =>
    setLocal(prev => ({
      ...prev,
      quietHours: { ...(prev.quietHours ?? {}), [field]: value },
    }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePrefs(local);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  // Register push token (browser Web Push / FCM)
  const handleEnablePush = async () => {
    setPushMsg(null);
    if (!("Notification" in window)) {
      setPushMsg("Push notifications are not supported in this browser.");
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      setPushMsg("Permission denied. Enable notifications in your browser settings.");
      return;
    }
    try {
      const reg = await navigator.serviceWorker?.ready;
      if (!reg) throw new Error("Service worker not available");

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
      });

      await notificationAPI.registerDevice({
        token:    JSON.stringify(sub),
        platform: "web",
      });
      setPushMsg("Push notifications enabled!");
      toggle("pushEnabled", true);
    } catch (e) {
      setPushMsg(`Could not enable push: ${e.message}`);
    }
  };

  const isMuted = (cat) => (local.mutedCategories ?? []).includes(cat);

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-400" />
          Notification Preferences
        </h2>
        <p className="text-sm text-white/50 mt-1">Control what you hear about and when.</p>
      </div>

      {/* ── Master toggles ────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">General</h3>

        <Toggle
          label="Real-time notifications"
          desc="Receive notifications instantly via WebSocket"
          icon={<Zap className="w-4 h-4 text-yellow-400" />}
          checked={local.realtime ?? true}
          onChange={() => toggle("realtime")}
        />

        <Toggle
          label="Toast popups"
          desc="Show a popup banner when a notification arrives"
          icon={<Bell className="w-4 h-4 text-blue-400" />}
          checked={local.toastEnabled ?? true}
          onChange={() => toggle("toastEnabled")}
        />

        <Toggle
          label="Push notifications"
          desc="Receive notifications even when the app is closed"
          icon={<Bell className="w-4 h-4 text-purple-400" />}
          checked={local.pushEnabled ?? false}
          onChange={handleEnablePush}
        />
        {pushMsg && (
          <p className="text-xs text-white/50 pl-12">{pushMsg}</p>
        )}
      </section>

      {/* ── Quiet hours ───────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
          Quiet Hours
        </h3>
        <Toggle
          label="Enable quiet hours"
          desc="Silence toast popups during specified hours"
          icon={<Moon className="w-4 h-4 text-indigo-400" />}
          checked={local.quietHours?.enabled ?? false}
          onChange={() => setQuietHour("enabled", !(local.quietHours?.enabled))}
        />
        {local.quietHours?.enabled && (
          <div className="flex items-center gap-4 pl-12 flex-wrap">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-white/50">From</span>
              <input
                type="time"
                value={local.quietHours?.start ?? "22:00"}
                onChange={e => setQuietHour("start", e.target.value)}
                className="bg-white/[0.06] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-white/50">To</span>
              <input
                type="time"
                value={local.quietHours?.end ?? "08:00"}
                onChange={e => setQuietHour("end", e.target.value)}
                className="bg-white/[0.06] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </label>
          </div>
        )}
      </section>

      {/* ── Per-category mutes ────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
          Categories
        </h3>
        <p className="text-xs text-white/40">Muted categories are stored but not shown as toasts.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => toggleCategory(cat.key)}
              className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                isMuted(cat.key)
                  ? "bg-white/[0.02] border-white/[0.06] opacity-60"
                  : "bg-white/[0.04] border-white/[0.09] hover:border-white/20"
              }`}
            >
              {isMuted(cat.key)
                ? <BellOff className="w-4 h-4 text-white/30 flex-shrink-0 mt-0.5" />
                : <Bell    className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              }
              <div>
                <p className="text-sm font-medium text-white">{cat.label}</p>
                <p className="text-xs text-white/40 mt-0.5">{cat.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Save ──────────────────────────────────────────────────────────── */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30 transition-all font-medium disabled:opacity-50"
      >
        {saving ? (
          <Loader2  className="w-4 h-4 animate-spin" />
        ) : saved ? (
          <CheckCircle className="w-4 h-4 text-green-400" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {saving ? "Saving…" : saved ? "Saved!" : "Save preferences"}
      </button>
    </div>
  );
}

// ─── Toggle row ───────────────────────────────────────────────────────────────
function Toggle({ label, desc, icon, checked, onChange }) {
  return (
    <div
      onClick={onChange}
      className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] cursor-pointer hover:border-white/[0.15] transition-all"
    >
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          {desc && <p className="text-xs text-white/40 mt-0.5">{desc}</p>}
        </div>
      </div>
      {/* Toggle switch */}
      <div className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-indigo-500" : "bg-white/10"}`}>
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </div>
    </div>
  );
}