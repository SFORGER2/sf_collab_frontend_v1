/**
 * presenceStore.jsx — fixed
 *
 * FIX: The heartbeat interval was emitting BOTH 'heartbeat' AND 'user_activity'
 * every 30 seconds. Since the backend's handle_user_activity also calls
 * record_activity (which now emits user_activity to the user's room), sending
 * both events per tick was redundant. Removed the duplicate user_activity emit
 * from the heartbeat — the server handles that itself when it receives heartbeat.
 */
import {
  createContext, useCallback, useContext, useEffect,
  useMemo, useRef, useState,
} from 'react';
import { useAppSocket } from '@/context/SocketProvider';

const IDLE_THRESHOLD_MS = 5 * 60 * 1000;
const HEARTBEAT_MS      = 30 * 1000;
const TICK_MS           = 60 * 1000;

const PresenceContext = createContext(null);

export function toMs(ts) {
  if (!ts) return null;
  if (typeof ts === 'number') return ts;
  const n = Number(ts);
  if (!Number.isNaN(n) && n > 0) return n;
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
}

export function formatLastSeen(tsMs, nowMs = Date.now()) {
  if (!tsMs) return 'Offline';
  const diffMs = Math.max(0, nowMs - tsMs);
  const mins   = Math.floor(diffMs / 60_000);
  if (mins < 1)  return 'last seen just now';
  if (mins < 60) return mins === 1 ? 'last seen 1 min ago' : `last seen ${mins} mins ago`;
  const d   = new Date(tsMs);
  const now = new Date(nowMs);
  const isSameDay = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.getFullYear() === yesterday.getFullYear() && d.getMonth() === yesterday.getMonth() && d.getDate() === yesterday.getDate();
  const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  if (isSameDay)   return `last seen ${timeStr}`;
  if (isYesterday) return `last seen yesterday, ${timeStr}`;
  return `last seen ${d.getDate()}/${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)} ${timeStr}`;
}

export function derivePresence(entry, nowMs = Date.now()) {
  if (!entry?.online) {
    const lastSeenMs = toMs(entry?.last_seen);
    return { status: 'offline', statusText: lastSeenMs ? formatLastSeen(lastSeenMs, nowMs) : 'Offline' };
  }
  const lastActiveMs = toMs(entry.last_active);
  const idleDiff     = lastActiveMs ? nowMs - lastActiveMs : null;
  if (idleDiff !== null && idleDiff > IDLE_THRESHOLD_MS) {
    return { status: 'idle', statusText: 'Away' };
  }
  return { status: 'online', statusText: 'Online' };
}

export function PresenceProvider({ children }) {
  const { socket } = useAppSocket();
  const [presenceMap, setPresenceMap] = useState({});
  const [nowMs,       setNowMs]       = useState(() => Date.now());

  const patchUser = useCallback((userId, patch) => {
    setPresenceMap(prev => ({
      ...prev,
      [String(userId)]: { ...(prev[String(userId)] ?? {}), ...patch },
    }));
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onUserStatus = ({ user_id, status, last_seen, timestamp }) => {
      const uid = String(user_id);
      if (status === 'offline') {
        patchUser(uid, { online: false, last_seen: toMs(last_seen ?? timestamp), last_active: null });
      } else {
        patchUser(uid, { online: true, last_active: toMs(timestamp) ?? Date.now() });
      }
    };

    const onUserActivity = ({ user_id, ts }) => {
      patchUser(String(user_id), { online: true, last_active: toMs(ts) ?? Date.now() });
    };

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
    socket.emit('get_online_users');

    return () => {
      socket.off('user_status',     onUserStatus);
      socket.off('user_activity',   onUserActivity);
      socket.off('online_users',    onOnlineUsers);
      socket.off('presence_update', onPresenceUpdate);
    };
  }, [socket, patchUser]);

  // FIX: was emitting BOTH 'heartbeat' AND 'user_activity' per tick.
  // Removed user_activity — the backend emits it automatically when it
  // receives heartbeat (via record_activity). Double-emitting caused
  // redundant broadcasts. Heartbeat alone is sufficient to keep presence alive.
  useEffect(() => {
    if (!socket) return;
    const id = setInterval(() => {
      socket.emit('heartbeat', { ts: Date.now() });
      // NOTE: do NOT also emit 'user_activity' here — backend handles it
    }, HEARTBEAT_MS);
    return () => clearInterval(id);
  }, [socket]);

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const value = useMemo(() => ({
    presenceMap,
    nowMs,
    getPresence: (userId) => derivePresence(presenceMap[String(userId)], nowMs),
    isOnline:    (userId) => !!presenceMap[String(userId)]?.online,
  }), [presenceMap, nowMs]);

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
}

export function usePresence() {
  const ctx = useContext(PresenceContext);
  if (!ctx) throw new Error('usePresence must be used inside <PresenceProvider>');
  return ctx;
}

export function useUserPresence(userId) {
  const { presenceMap, nowMs } = usePresence();
  return useMemo(() => {
    const entry   = presenceMap[String(userId)];
    const derived = derivePresence(entry, nowMs);
    return { ...derived, isOnline: !!entry?.online };
  }, [presenceMap, userId, nowMs]);
}