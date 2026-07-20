import React from "react";
import { useIsMobile } from "../../../../utils/hooks/use-mobile";
import { MyAttendancePage as DesktopMyAttendance, WorkspaceAttendancePage as DesktopWorkspaceAttendance } from "./DesktopAttendance";
import MobileAttendance from "./MobileAttendance";
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "../../../../utils/APIs/interceptors";

// Common API setup
const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

export function MyAttendancePage() {
  const isMobile = useIsMobile();
  const { user } = useSelector((s) => s.auth);
  const workspaceId = user?.id;

  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const flash = (msg, isError = false) => {
    if (isError) setError(msg);
    else setNotice(msg);
    setTimeout(() => { setError(null); setNotice(null); }, 4000);
  };

  const loadToday = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const { data } = await api.get("/attendance/today-status", {
        params: { workspace_id: workspaceId },
      });
      setToday(data);
    } catch (e) {
      flash(e?.response?.data?.error || "Could not load today's status", true);
    }
  }, [workspaceId]);

  const loadHistory = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const { data } = await api.get("/attendance/history", {
        params: { workspace_id: workspaceId, limit: 30 },
      });
      setHistory(data.records || []);
    } catch {/* silent */ }
  }, [workspaceId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadToday(), loadHistory()]).finally(() => setLoading(false));
  }, [loadToday, loadHistory]);

  const clockIn = async () => {
    setActionLoading(true);
    try {
      await api.post("/attendance/clock-in", { workspace_id: workspaceId });
      flash("Clocked in successfully!");
      await loadToday();
    } catch (e) {
      flash(e?.response?.data?.error || "Clock-in failed", true);
    } finally {
      setActionLoading(false);
    }
  };

  const clockOut = async () => {
    setActionLoading(true);
    try {
      await api.post("/attendance/clock-out", { workspace_id: workspaceId });
      flash("Clocked out successfully!");
      await Promise.all([loadToday(), loadHistory()]);
    } catch (e) {
      flash(e?.response?.data?.error || "Clock-out failed", true);
    } finally {
      setActionLoading(false);
    }
  };

  if (isMobile) {
    if (loading) return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-500 gap-4">
        <div className="w-8 h-8 border-2 border-primary-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest">Syncing...</p>
      </div>
    );
    return (
      <MobileAttendance 
        today={today}
        history={history}
        clockIn={clockIn}
        clockOut={clockOut}
        actionLoading={actionLoading}
        notice={notice}
        error={error}
      />
    );
  }

  return <DesktopMyAttendance />;
}

export function WorkspaceAttendancePage() {
  const isMobile = useIsMobile();
  
  // Workspace Attendance (Admin) optimization is less critical for mobile 
  // but we still want it to not break.
  // For now, we'll use Desktop version but we could add a Mobile version later.
  return <DesktopWorkspaceAttendance />;
}
