import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useAppSocket } from "@/context/SocketProvider";
import { useChatContacts } from "@/context/ChatContactsProvider";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";


export default function OnlineFriendsPanel() {
  const { onlineUsers } = useAppSocket();
  const { friends } = useChatContacts();
  const [contacts, setContacts] = useState([]);


  const token = useMemo(() => localStorage.getItem("access_token"), []);
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  // "expanded" shows names + search; "collapsed" shows a thin bar with avatars
  const [mode, setMode] = useState(() => localStorage.getItem("ofp_mode") || "expanded");
  const [tab, setTab] = useState("online"); // "online" | "all"
  const [q, setQ] = useState("");

  useEffect(() => {
    localStorage.setItem("ofp_mode", mode);
  }, [mode]);

  const isOnline = useCallback(
    (userId) => (onlineUsers || []).some((id) => String(id) === String(userId)),
    [onlineUsers]
  );

  useEffect(() => {
  const loadContactsFallback = async () => {
    if (!token) return;

    // If friends exist, use them; no need fallback.
    if ((friends || []).length > 0) return;

    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      // Adjust shapes depending on your API
      const users = data?.data?.users || data?.users || [];

      // remove current user
      const cleaned = users.filter((u) => String(u.id) !== String(currentUser?.id));
      setContacts(cleaned);
    } catch {
      setContacts([]);
    }
  };

  loadContactsFallback();
}, [token, friends, currentUser?.id]);


  const filteredFriends = useMemo(() => {
    const baseList = (friends && friends.length > 0) ? friends : contacts;
    const list = (baseList || []).filter((f) => {

      if (!f) return false;

      if (tab === "online" && !isOnline(f.id)) return false;

      if (q) {
        const first = f.firstName ?? f.first_name ?? "";
        const last = f.lastName ?? f.last_name ?? "";
        const name = `${first} ${last}`.trim().toLowerCase();

        if (!name.includes(q.toLowerCase())) return false;
      }
      return true;
    });

    // Sort: online first, then alphabetical
    list.sort((a, b) => {
      const ao = isOnline(a.id) ? 1 : 0;
      const bo = isOnline(b.id) ? 1 : 0;
      if (bo !== ao) return bo - ao;
      const an = `${a.firstName ?? a.first_name ?? ""} ${a.lastName ?? a.last_name ?? ""}`.trim();
      const bn = `${b.firstName ?? b.first_name ?? ""} ${b.lastName ?? b.last_name ?? ""}`.trim();

      return an.localeCompare(bn);
    });

    return list;
  }, [friends, tab, q, isOnline]);

  const ensureDirectConversation = useCallback(
    async (friendId) => {
      if (!token || !friendId) return null;

      // 1) fetch conversations and see if DM exists
      try {
        const res = await fetch(`${API_BASE_URL}/chat/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const convs = data?.data?.conversations || [];

        const existing = convs.find(
          (c) =>
            c.conversation_type === "direct" &&
            (c.participants || []).some((p) => String(p.id) === String(friendId))
        );

        if (existing?.id) return existing;
      } catch {
        // ignore, try create
      }

      // 2) create DM if not found
      try {
        const res = await fetch(`${API_BASE_URL}/chat/conversations`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            participant_ids: [friendId],
            conversation_type: "direct",
          }),
        });
        const data = await res.json();
        return data?.data?.conversation || null;
      } catch {
        return null;
      }
    },
    [token]
  );

  const openChatWithFriend = useCallback(
    async (friend) => {
      if (!friend?.id) return;
      const conv = await ensureDirectConversation(friend.id);

      // fallback: if backend didn’t return a conversation, still open a “best effort”
      const conversationId = conv?.id;
      const title = `${friend.firstName || ""} ${friend.lastName || ""}`.trim() || "Chat";

      if (conversationId) {
        window.dispatchEvent(
          new CustomEvent("chat:openDock", {
            detail: { conversationId, title },
          })
        );
      }
    },
    [ensureDirectConversation]
  );

  // Not logged in: no panel
  if (!token || !currentUser) return null;

  const collapsed = mode === "collapsed";

  return (
    <div className="fixed top-16 right-0 z-[9000] h-[calc(100vh-64px)]">
      <div
        className={`h-full bg-zinc-950/70 backdrop-blur border-l border-zinc-800 shadow-2xl ${
          collapsed ? "w-16" : "w-80"
        }`}
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-3 border-b border-zinc-800">
          {!collapsed ? (
            <>
              <div className="text-sm font-semibold text-white">Contacts</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  onClick={() => setMode("collapsed")}
                  title="Collapse"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              className="mx-auto p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white"
              onClick={() => setMode("expanded")}
              title="Expand"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {/* Body */}
        {!collapsed && (
          <>
            {/* Search */}
            <div className="p-3 border-b border-zinc-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full pl-10 pr-3 py-2 bg-zinc-900 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>

              {/* Tabs: All | Online */}
              <div className="flex gap-2 mt-3">
                {[
                  { id: "online", label: "Online" },
                  { id: "all", label: "All" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                      tab === t.id
                        ? "bg-indigo-500 text-zinc-900"
                        : "bg-zinc-900 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="h-[calc(100%-112px)] overflow-y-auto p-2">
              {filteredFriends.length === 0 ? (
                <div className="p-4 text-sm text-zinc-500">No contacts</div>
              ) : (
                filteredFriends.map((f) => {
                  const online = isOnline(f.id);
                  const first = f.firstName ?? f.first_name ?? "";
                  const last = f.lastName ?? f.last_name ?? "";
                  const name = `${first} ${last}`.trim().toLowerCase();

                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => openChatWithFriend(f)}
                      className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900 text-left"
                    >
                      <div className="relative">
                        <img
                          src={f.profilePicture || f.avatar || "/default-avatar.png"}
                          alt={name}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        {online && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-950" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-white truncate">{name}</div>
                        <div className="text-xs text-zinc-500">
                          {online ? "Online" : "Offline"}
                        </div>
                      </div>

                      {/* Placeholder for unread badge (we’ll wire real unread per convo in Step 4) */}
                      {/* <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-500 text-zinc-900 text-[11px] flex items-center justify-center">1</span> */}
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Collapsed mode: show just avatars (online first) */}
        {collapsed && (
          <div className="p-2 flex flex-col gap-2 overflow-y-auto h-[calc(100%-56px)]">
            {filteredFriends.slice(0, 20).map((f) => {
              const online = isOnline(f.id);
              const name = `${f.firstName ?? f.first_name ?? ""} ${f.lastName ?? f.last_name ?? ""}`.trim() || "User";

              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => openChatWithFriend(f)}
                  className="relative w-12 h-12 mx-auto rounded-2xl hover:bg-zinc-900 flex items-center justify-center"
                  title={name}
                >
                  <img
                    src={f.profilePicture || f.avatar || "/default-avatar.png"}
                    alt={name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  {online && (
                    <span className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-950" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
