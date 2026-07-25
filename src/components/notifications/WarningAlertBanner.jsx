/**
 * components/notifications/WarningAlertBanner.jsx
 *
 * Persistent banner that appears at the top of the page for
 * critical/warning notifications (moderation, account suspension, etc.)
 *
 * Mount once inside Layout.jsx, above <Outlet />:
 *   import WarningAlertBanner from '@/components/notifications/WarningAlertBanner';
 *   <WarningAlertBanner />
 */

import { useState, useEffect } from "react";
import { AlertTriangle, AlertCircle, X, ExternalLink } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const TYPE_STYLES = {
  critical: {
    bg:     "bg-red-950/90",
    border: "border-red-500/40",
    text:   "text-red-200",
    icon:   AlertCircle,
    iconCls:"text-red-400",
  },
  warning: {
    bg:     "bg-yellow-950/80",
    border: "border-yellow-500/30",
    text:   "text-yellow-200",
    icon:   AlertTriangle,
    iconCls:"text-yellow-400",
  },
};

export default function WarningAlertBanner() {
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const onWarning = (e) => {
      const n = e.detail;
      if (!n) return;
      const severity = n.priority === "critical" ? "critical" : "warning";
      setAlerts(prev => {
        if (prev.some(a => a.id === n.id)) return prev;
        return [{ ...n, severity }, ...prev].slice(0, 3);
      });
    };

    window.addEventListener("sfcollab:warning_alert", onWarning);
    return () => window.removeEventListener("sfcollab:warning_alert", onWarning);
  }, []);

  const dismiss = (id) => setAlerts(prev => prev.filter(a => a.id !== id));

  return (
    <div className="fixed top-[60px] left-0 right-0 z-40 px-4 pt-2 space-y-2 pointer-events-none">
      <AnimatePresence>
        {alerts.map(alert => {
          const style = TYPE_STYLES[alert.severity] ?? TYPE_STYLES.warning;
          const Icon  = style.icon;
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl
                border backdrop-blur-sm shadow-lg ${style.bg} ${style.border}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${style.iconCls}`} />

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${style.text}`}>{alert.title}</p>
                <p className={`text-xs mt-0.5 opacity-80 truncate ${style.text}`}>{alert.message}</p>
              </div>

              {alert.link_url && (
                <button
                  onClick={() => navigate(alert.link_url)}
                  className={`flex items-center gap-1 text-xs ${style.text} opacity-70 hover:opacity-100 flex-shrink-0`}
                >
                  <ExternalLink className="w-3 h-3" />
                  View
                </button>
              )}

              <button
                onClick={() => dismiss(alert.id)}
                className={`p-1 rounded-lg hover:bg-white/10 flex-shrink-0 ${style.text}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}