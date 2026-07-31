/**
 * SocketProvider.jsx — Refactored with built-in presence management.
 *
 * ROOT CAUSE OF "always offline" BUG:
 * The old SocketProvider only tracked an `onlineUsers` string array.
 * It never stored last_active or last_seen, so:
 *   - useUserPresence() always got an empty entry → derivePresence() returned "offline"
 *   - PresenceProvider added its own listeners on the same socket instance,
 *     but by the time they ran the events had already been consumed / ignored.
 *
 * FIX:
 * Presence logic is now built directly into SocketProvider so there is only
 * one set of socket listeners.  SocketProvider now exposes `presenceMap` alongside
 * `socket` and `isConnected`.  useUserPresence() reads from that map.
 * PresenceProvider wrapper is no longer needed (but its import in App.jsx is
 * harmless — see bottom of this file for a no-op shim).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getSocketInstance, isSocketTokenValid } from "@/utils/getSocketInstance";

// ─── Constants ────────────────────────────────────────────────────────────────
const IDLE_THRESHOLD_MS  = 5 * 60 * 1000;   // 5 minutes
const HEARTBEAT_MS       = 30 * 1000;        // heartbeat interval
const TICK_MS            = 60 * 1000;        // refresh "last seen X ago" labels

// ─── Helpers (also used by useUserPresence) ───────────────────────────────────

export function toMs(ts) {
  if (!ts) return null;
  if (typeof ts === "number") return ts;
  const n = Number(ts);
  if (!Number.isNaN(n) && n > 0) return n;
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
}

export function formatLastSeen(tsMs, nowMs = Date.now()) {
  if (!tsMs) return "Offline";
  const diffMs = Math.max(0, nowMs - tsMs);
  const mins   = Math.floor(diffMs / 60_000);

  if (mins < 1)  return "last seen just now";
  if (mins < 60) return mins === 1 ? "last seen 1 min ago" : `last seen ${mins} mins ago`;

  const d   = new Date(tsMs);
  const now = new Date(nowMs);

  const isSameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth()    === now.getMonth()    &&
    d.getDate()     === now.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth()    === yesterday.getMonth()    &&
    d.getDate()     === yesterday.getDate();

  const timeStr = d
    .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    .toLowerCase();

  if (isSameDay)   return `last seen ${timeStr}`;
  if (isYesterday) return `last seen yesterday, ${timeStr}`;
  return `last seen ${d.getDate()}/${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)} ${timeStr}`;
}

export function derivePresence(entry, nowMs = Date.now()) {
  if (!entry?.online) {
    const lastSeenMs = toMs(entry?.last_seen);
    return {
      status:     "offline",
      statusText: lastSeenMs ? formatLastSeen(lastSeenMs, nowMs) : "Offline",
    };
  }
  const lastActiveMs = toMs(entry.last_active);
  const idleDiff     = lastActiveMs ? nowMs - lastActiveMs : null;
  if (idleDiff !== null && idleDiff > IDLE_THRESHOLD_MS) {
    return { status: "idle", statusText: "Away" };
  }
  return { status: "online", statusText: "Online" };
}

// ─── Context ──────────────────────────────────────────────────────────────────
const SocketContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SocketProvider({ token, children }) {
  const socketRef = useRef(null);

  const [socket,      setSocket]      = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  /**
   * presenceMap: { [userId: string]: { online, last_active, last_seen } }
   * Single source of truth — replaces the old `onlineUsers` array.
   * Components call useUserPresence(id) to get derived { status, statusText }.
   */
  const [presenceMap, setPresenceMap] = useState({});

  // Minute tick so "last seen X ago" labels re-render automatically
  const [nowMs, setNowMs] = useState(() => Date.now());

  // ── Patch helper ────────────────────────────────────────────────────────────
  const patchUser = useCallback((userId, patch) => {
    setPresenceMap(prev => ({
      ...prev,
      [String(userId)]: { ...(prev[String(userId)] ?? {}), ...patch },
    }));
  }, []);

  // ── Socket setup ────────────────────────────────────────────────────────────
  useEffect(() => {
    const isBadToken = !isSocketTokenValid(token);

    if (isBadToken) {
      if (socketRef.current) { socketRef.current.close(); socketRef.current = null; }
      setSocket(null);
      setIsConnected(false);
      setPresenceMap({});
      return;
    }

    if (socketRef.current) return;   // already connected

    const s = getSocketInstance();
    socketRef.current = s;
    setSocket(s);

    // ── Connect ──────────────────────────────────────────────────────────────
    const onConnect = () => {
      setIsConnected(true);
      s.emit("get_online_users");
    };

    // ── Disconnect ───────────────────────────────────────────────────────────
    const onDisconnect = () => setIsConnected(false);

    // ── Full snapshot: online_users: { user_ids } ─────────────────────────────
    const onOnlineUsers = ({ user_ids = [] }) => {
      const idSet = new Set(user_ids.map(String));
      const now   = Date.now();
      setPresenceMap(prev => {
        const next = { ...prev };
        for (const uid of idSet) {
          next[uid] = { ...(next[uid] ?? {}), online: true, last_active: next[uid]?.last_active ?? now };
        }
        for (const uid of Object.keys(next)) {
          if (next[uid].online && !idSet.has(uid)) {
            next[uid] = { ...next[uid], online: false };
          }
        }
        return next;
      });
    };

    /**
     * user_status: { user_id, status, last_seen?, timestamp }
     * Handles online / offline / idle events from backend.
     */
    const onUserStatus = ({ user_id, status, last_seen, timestamp }) => {
      const uid = String(user_id);
      if (status === "offline") {
        patchUser(uid, {
          online:      false,
          last_seen:   toMs(last_seen ?? timestamp),
          last_active: null,
        });
      } else {
        // online or idle — mark online, update last_active
        patchUser(uid, {
          online:      true,
          last_active: toMs(timestamp) ?? Date.now(),
        });
      }
    };

    /**
     * user_activity: { user_id, ts }
     * Resets idle clock when someone sends a message / heartbeat.
     */
    const onUserActivity = ({ user_id, ts }) => {
      patchUser(String(user_id), {
        online:      true,
        last_active: toMs(ts) ?? Date.now(),
      });
    };

    /**
     * presence_update: { user_id, status, last_seen }
     * Unified event from the refactored backend.
     */
    const onPresenceUpdate = ({ user_id, status, last_seen }) => {
      const uid = String(user_id);
      if (status === "offline") {
        patchUser(uid, { online: false, last_seen: toMs(last_seen) });
      } else {
        patchUser(uid, { online: true, last_active: toMs(last_seen) ?? Date.now() });
      }
    };

    s.on("connect",        onConnect);
    s.on("disconnect",     onDisconnect);
    s.on("online_users",   onOnlineUsers);
    s.on("user_status",    onUserStatus);
    s.on("user_activity",  onUserActivity);
    s.on("presence_update",onPresenceUpdate);

    return () => {
      s.off("connect",        onConnect);
      s.off("disconnect",     onDisconnect);
      s.off("online_users",   onOnlineUsers);
      s.off("user_status",    onUserStatus);
      s.off("user_activity",  onUserActivity);
      s.off("presence_update",onPresenceUpdate);
      s.close();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setPresenceMap({});
    };
  }, [token, patchUser]);

  // ── Heartbeat ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const id = setInterval(() => {
      const ts = Date.now();
      socket.emit("heartbeat",     { ts });
      socket.emit("user_activity", { ts });
    }, HEARTBEAT_MS);
    return () => clearInterval(id);
  }, [socket]);

  // ── Minute tick ──────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  // ── Context value ─────────────────────────────────────────────────────────
  // Keep `onlineUsers` array for any legacy code that still reads it
  const onlineUsers = useMemo(
    () => Object.keys(presenceMap).filter(uid => presenceMap[uid]?.online),
    [presenceMap]
  );

  const value = useMemo(() => ({
    socket,
    isConnected,
    onlineUsers,   // legacy — array of online user id strings
    presenceMap,   // new — full presence data
    nowMs,         // current tick timestamp
  }), [socket, isConnected, onlineUsers, presenceMap, nowMs]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export default SocketProvider;

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAppSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useAppSocket must be used inside <SocketProvider />");
  return ctx;
}

/**
 * useUserPresence(userId)
 * Returns { status, statusText, isOnline } for one user.
 * Reads from the socket provider's presenceMap — single source of truth.
 *
 * status:     'online' | 'idle' | 'offline'
 * statusText: 'Online' | 'Away' | 'last seen X mins ago' | 'Offline'
 */
export function useUserPresence(userId) {
  const { presenceMap, nowMs } = useAppSocket();
  const entry   = presenceMap[String(userId)];
  const derived = derivePresence(entry, nowMs);
  return { ...derived, isOnline: !!entry?.online };
}

// ─── PresenceProvider shim ────────────────────────────────────────────────────
// App.jsx imports <PresenceProvider> — this shim makes that import harmless
// without requiring an App.jsx change.  It simply renders its children.
export function PresenceProvider({ children }) {
  return children;
}