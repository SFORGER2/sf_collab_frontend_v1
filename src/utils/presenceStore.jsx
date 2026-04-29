/**
 * presenceStore.js
 *
 * SINGLE SOURCE OF TRUTH for all user presence data.
 * Both OnlineContactsSidebar and ChatHeader read from here.
 * Nothing calculates status independently anymore.
 *
 * Place at: src/utils/presenceStore.js
 *
 * Usage:
 *   import { PresenceProvider }  from '@/utils/presenceStore';   // wrap app
 *   import { useUserPresence }   from '@/utils/presenceStore';   // in any component
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAppSocket } from '@/context/SocketProvider';

// ─── Constants ────────────────────────────────────────────────────────────────
const IDLE_THRESHOLD_MS  = 5 * 60 * 1000;  // 5 minutes inactive => idle
const HEARTBEAT_MS       = 30 * 1000;       // client heartbeat interval
const TICK_MS            = 60 * 1000;       // re-render "X ago" labels every minute

// ─── Context ──────────────────────────────────────────────────────────────────
const PresenceContext = createContext(null);

// ─── Helpers (exported so components can use them standalone) ─────────────────

/** Convert any timestamp to milliseconds, or null. */
export function toMs(ts) {
  if (!ts) return null;
  if (typeof ts === 'number') return ts;
  const n = Number(ts);
  if (!Number.isNaN(n) && n > 0) return n;
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
}

/**
 * Format a UTC timestamp as a human-readable "last seen" string.
 * Always uses relative time — never a stale fixed clock value.
 */
export function formatLastSeen(tsMs, nowMs = Date.now()) {
  if (!tsMs) return 'Offline';
  const diffMs = Math.max(0, nowMs - tsMs);
  const mins   = Math.floor(diffMs / 60_000);

  if (mins < 1)  return 'last seen just now';
  if (mins < 60) return mins === 1 ? 'last seen 1 min ago' : `last seen ${mins} mins ago`;

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
    .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    .toLowerCase();

  if (isSameDay)   return `last seen ${timeStr}`;
  if (isYesterday) return `last seen yesterday, ${timeStr}`;
  return `last seen ${d.getDate()}/${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)} ${timeStr}`;
}

/**
 * Derive { status, statusText } from a presence entry.
 * This is the ONLY place status is calculated — never in individual components.
 *
 * @param {object|undefined} entry  - { online, last_active, last_seen }
 * @param {number}           nowMs  - current timestamp for idle math
 */
export function derivePresence(entry, nowMs = Date.now()) {
  if (!entry?.online) {
    const lastSeenMs = toMs(entry?.last_seen);
    return {
      status:     'offline',
      statusText: lastSeenMs ? formatLastSeen(lastSeenMs, nowMs) : 'Offline',
    };
  }

  // User is connected — check idle
  const lastActiveMs = toMs(entry.last_active);
  const idleDiff     = lastActiveMs ? nowMs - lastActiveMs : null;
  if (idleDiff !== null && idleDiff > IDLE_THRESHOLD_MS) {
    return { status: 'idle', statusText: 'Away' };
  }
  return { status: 'online', statusText: 'Online' };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * Add <PresenceProvider> inside your app, INSIDE <SocketProvider>.
 *
 * Recommended placement in App.jsx / main providers tree:
 *
 *   <SocketProvider token={token}>
 *     <PresenceProvider>
 *       <RouterComponents />
 *     </PresenceProvider>
 *   </SocketProvider>
 */
export function PresenceProvider({ children }) {
  const { socket } = useAppSocket();

  /**
   * presenceMap: { [userId: string]: { online: bool, last_active: ms|null, last_seen: ms|null } }
   *
   * This object is the SINGLE source of truth.
   * Never store presence state anywhere else (no localStorage, no separate hooks).
   */
  const [presenceMap, setPresenceMap] = useState({});

  // Ticks every minute so "last seen X ago" labels re-render automatically
  const [nowMs, setNowMs] = useState(() => Date.now());

  // ── Internal helpers ──────────────────────────────────────────────────────

  const patchUser = useCallback((userId, patch) => {
    setPresenceMap(prev => ({
      ...prev,
      [String(userId)]: { ...(prev[String(userId)] ?? {}), ...patch },
    }));
  }, []);

  // ── Socket event handlers ─────────────────────────────────────────────────

  useEffect(() => {
    if (!socket) return;

    /**
     * user_status: { user_id, status: 'online'|'idle'|'offline', last_seen?, timestamp }
     * Emitted by backend on connect / disconnect / away check.
     */
    const onUserStatus = ({ user_id, status, last_seen, timestamp }) => {
      const uid = String(user_id);
      if (status === 'offline') {
        patchUser(uid, {
          online:      false,
          // Use last_seen if provided; fall back to the event timestamp
          last_seen:   toMs(last_seen ?? timestamp),
          last_active: null,
        });
      } else {
        // 'online' or 'idle' (we derive idle from last_active age — no need to store as flag)
        patchUser(uid, {
          online:      true,
          last_active: toMs(timestamp) ?? Date.now(),
        });
      }
    };

    /**
     * user_activity: { user_id, ts }
     * Emitted when any user sends a message, heartbeat, or interaction.
     * Resets the idle clock for that user.
     */
    const onUserActivity = ({ user_id, ts }) => {
      patchUser(String(user_id), {
        online:      true,
        last_active: toMs(ts) ?? Date.now(),
      });
    };

    /**
     * online_users: { user_ids: string[] }
     * Full snapshot the server sends immediately on connect.
     */
    const onOnlineUsers = ({ user_ids = [] }) => {
      const idSet = new Set(user_ids.map(String));
      const now   = Date.now();
      setPresenceMap(prev => {
        const next = { ...prev };
        // Mark everyone in the list as online
        for (const uid of idSet) {
          next[uid] = {
            ...(next[uid] ?? {}),
            online:      true,
            last_active: next[uid]?.last_active ?? now,
          };
        }
        // Anyone previously online but not in the list is now offline
        for (const uid of Object.keys(next)) {
          if (next[uid].online && !idSet.has(uid)) {
            next[uid] = { ...next[uid], online: false };
          }
        }
        return next;
      });
    };

    /**
     * presence_update: { user_id, status, last_seen }
     * New unified event from the refactored backend (see socket_events.py).
     */
    const onPresenceUpdate = ({ user_id, status, last_seen }) => {
      const uid = String(user_id);
      if (status === 'offline') {
        patchUser(uid, { online: false, last_seen: toMs(last_seen) });
      } else {
        patchUser(uid, { online: true, last_active: toMs(last_seen) ?? Date.now() });
      }
    };

    socket.on('user_status',     onUserStatus);
    socket.on('user_activity',   onUserActivity);
    socket.on('online_users',    onOnlineUsers);
    socket.on('presence_update', onPresenceUpdate);

    // Ask for a full snapshot on mount
    socket.emit('get_online_users');

    return () => {
      socket.off('user_status',     onUserStatus);
      socket.off('user_activity',   onUserActivity);
      socket.off('online_users',    onOnlineUsers);
      socket.off('presence_update', onPresenceUpdate);
    };
  }, [socket, patchUser]);

  // ── Heartbeat — keeps the server's last_active fresh ─────────────────────
  useEffect(() => {
    if (!socket) return;
    const id = setInterval(() => {
      const ts = Date.now();
      socket.emit('heartbeat',      { ts });
      socket.emit('user_activity',  { ts }); // also updates our own last_active on other clients
    }, HEARTBEAT_MS);
    return () => clearInterval(id);
  }, [socket]);

  // ── Minute tick — refreshes "last seen X ago" strings ────────────────────
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  // ── Context value ─────────────────────────────────────────────────────────
  const value = useMemo(() => ({
    presenceMap,
    nowMs,
    /** Derived { status, statusText } for one user. */
    getPresence: (userId) => derivePresence(presenceMap[String(userId)], nowMs),
    /** Quick boolean check. */
    isOnline: (userId) => !!presenceMap[String(userId)]?.online,
  }), [presenceMap, nowMs]);

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Access the full presence store. */
export function usePresence() {
  const ctx = useContext(PresenceContext);
  if (!ctx) throw new Error('usePresence must be used inside <PresenceProvider>');
  return ctx;
}

/**
 * Presence for a SINGLE user.
 * Returns { status, statusText, isOnline }
 *
 * Example:
 *   const { status, statusText } = useUserPresence(otherUser.id);
 */
export function useUserPresence(userId) {
  const { presenceMap, nowMs } = usePresence();
  return useMemo(() => {
    const entry   = presenceMap[String(userId)];
    const derived = derivePresence(entry, nowMs);
    return { ...derived, isOnline: !!entry?.online };
  }, [presenceMap, userId, nowMs]);
}