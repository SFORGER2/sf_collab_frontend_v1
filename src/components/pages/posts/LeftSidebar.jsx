/**
 * LeftSidebar.jsx — fixed
 *
 * FIXES:
 * 1. Follower/following counts: replaced two separate paginated API calls with
 *    one getSocialProfile call (usersAPI.getFollowCounts). Previous calls
 *    read response.pagination?.totalCount which was undefined — always 0.
 *
 * 2. Follow button in search results and suggestions: was calling
 *    userSocialAPI.followUser(user._id) but SF Collab uses integer PKs
 *    (not MongoDB _ids). Changed to user.id.
 *
 * 3. After following from suggestions: setSuggestions filtered on ._id,
 *    changed to .id.
 *
 * 4. Search results: backend returns user.to_dict() which has firstName,
 *    lastName, profile_picture — not result.picture. Fixed field names.
 *
 * 5. Suggestions: backend returns user.to_dict(public=True) which has
 *    firstName, lastName, profile.picture — adjusted rendering.
 */
import {
  Send, Heart, Home, Search,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { BarChart3, Settings } from "./Icons";
import { useSelector } from "react-redux";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getProfilePicture } from "@/utils/getProfilePicture";
import { usersAPI } from "@/utils/APIs/userAPI";
import { userSocialAPI } from "@/utils/APIs/socialAPI";

export default function LeftSidebar({ activeTab, onTabChange, onSettingsClick }) {
  const { user, access_token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [suggestions,   setSuggestions]   = useState([]);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [followingIds,  setFollowingIds]  = useState(new Set());

  // FIX: show connections count (accepted FriendRequest records) instead of
  // follow counts. Followers/Following in SF Collab are the connections system.
  useEffect(() => {
    if (!user || !access_token) return;

    const fetchCounts = async () => {
      try {
        // GET /api/connections/counts → { connections, incoming, outgoing }
        const token = localStorage.getItem("access_token");
        const base  = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
        const res   = await fetch(`${base}/connections/counts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json  = await res.json();
        const data  = json?.data ?? json;
        setFollowersCount(data?.connections ?? 0);  // accepted connections
        setFollowingCount(data?.incoming    ?? 0);  // pending incoming requests
      } catch (err) {
        console.error("Error fetching connection counts:", err);
      }
    };

    // Also fetch which users we're already following so buttons show correct state
    const fetchFollowingIds = async () => {
      try {
        const res = await userSocialAPI.getSocialProfile(user.id);
        const social = res?.data?.social ?? res?.social;
        const ids = new Set((social?.followingIds || []).map(Number));
        setFollowingIds(ids);
      } catch { /* silent */ }
    };

    fetchCounts();
    fetchFollowingIds();
  }, [user, access_token]);

  useEffect(() => {
    if (!user || !access_token) return;

    const fetchSuggestions = async () => {
      try {
        const res = await userSocialAPI.getSuggestions(5);
        // response = { success, data: { suggestions } }
        const list = res?.data?.suggestions ?? res?.suggestions ?? [];
        setSuggestions(list);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    };
    fetchSuggestions();
  }, [user, access_token]);

  // FIX: removed Live TV (id: "tv") and Stats (id: "stats") — not real features
  const [showFollowModal, setShowFollowModal] = useState(null); // 'followers' | 'following' | null
  const [followList,      setFollowList]      = useState([]);
  const [followListLoading, setFollowListLoading] = useState(false);

  const openFollowModal = async (type) => {
    setShowFollowModal(type);
    setFollowList([]);
    setFollowListLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const base  = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

      if (type === 'connections') {
        const r    = await fetch(`${base}/connections`, { headers: { Authorization: `Bearer ${token}` } });
        const json = await r.json();
        const raw  = json?.data?.connections ?? json?.connections ?? [];
        // Unwrap connected_user: { id, connected_user: { id, first_name, last_name, profile_picture }, connected_at }
        const list = raw.map((item) => {
          const cu = item.connected_user ?? item;
          return { id: cu.id, first_name: cu.first_name, last_name: cu.last_name, profile_picture: cu.profile_picture };
        });
        setFollowList(list);
      } else {
        // pending — incoming requests
        const r    = await fetch(`${base}/connections/requests/incoming`, { headers: { Authorization: `Bearer ${token}` } });
        const json = await r.json();
        const raw  = json?.data?.requests ?? json?.requests ?? [];
        // Unwrap sender: { id, sender: { id, first_name, last_name, profile_picture }, created_at }
        const list = raw.map((item) => {
          const s = item.sender ?? item;
          return { id: s.id, first_name: s.first_name, last_name: s.last_name, profile_picture: s.profile_picture };
        });
        setFollowList(list);
      }
    } catch (err) {
      console.error(`Failed to load ${type}:`, err);
    } finally {
      setFollowListLoading(false);
    }
  };

  const menuItems = [
    { icon: Home,     label: "Feed",         id: "feed"      },
    { icon: Search,   label: "Explore",      id: "explore"   },
    { icon: Heart,    label: "My Favorites", id: "favorites" },
    { icon: Send,     label: "Direct",       id: "direct"    },
    { icon: Settings, label: "Settings",     id: "settings"  },
  ];

  const handleMenuClick = (item) => {
    if (item.id === "settings") { onSettingsClick(); return; }
    if (item.id === "direct")   { navigate("/chat"); return; }
    onTabChange(item.id);
  };

  // FIX: use user.id (integer) not user._id (MongoDB — not used here)
  const handleFollowUser = async (targetUser) => {
    const targetId = targetUser.id ?? targetUser._id;
    if (!targetId) return;
    try {
      await userSocialAPI.followUser(targetId);
      // Optimistic: update local following set and count
      setFollowingIds((prev) => new Set([...prev, Number(targetId)]));
      setFollowingCount((c) => c + 1);
      // Remove from suggestions after following
      setSuggestions((prev) => prev.filter((s) => (s.id ?? s._id) !== targetId));
    } catch (err) {
      console.error("Error following user:", err);
    }
  };

  const handleUnfollowUser = async (targetUser) => {
    const targetId = targetUser.id ?? targetUser._id;
    if (!targetId) return;
    try {
      await userSocialAPI.unfollowUser(targetId);
      setFollowingIds((prev) => {
        const next = new Set(prev);
        next.delete(Number(targetId));
        return next;
      });
      setFollowingCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Error unfollowing user:", err);
    }
  };

  // Debounced search
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    try {
      const res = await userSocialAPI.searchUsers(query, { per_page: 8 });
      // response = { success, data: { users } } or { success, data: [ users ] }
      const users = res?.data?.users ?? res?.users ?? res?.data ?? [];
      setSearchResults(Array.isArray(users) ? users : []);
    } catch (err) {
      console.error("Error searching users:", err);
    }
  }, []);

  return (
    <div className="w-80 space-y-2">
      {/* Search */}
      <Card className="bg-zinc-900/50 backdrop-blur-xl border-zinc-800/50">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-zinc-500" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2 pl-9 text-sm outline-none border border-zinc-700 focus:border-blue-400"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="mt-3 space-y-2 max-h-[200px] overflow-y-auto">
              {searchResults.map((result) => {
                const uid = result.id ?? result._id;
                const isFollowing = followingIds.has(Number(uid));
                return (
                  <div
                    key={uid}
                    className="flex items-center justify-between p-2 hover:bg-zinc-800/30 rounded cursor-pointer"
                    onClick={() => { if (String(uid) !== String(user?.id)) { navigate(`/user-profile?userId=${uid}`); setSearchQuery(""); setSearchResults([]); }}}
                  >
                    <div 
                      className="flex items-center space-x-2 flex-1 min-w-0"
                      onClick={() => { if (String(uid) !== String(user?.id)) { navigate(`/user-profile?userId=${uid}`); setSearchQuery(""); setSearchResults([]); }}}
                    >
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarImage src={result.profile_picture || result.profile?.picture} />
                        <AvatarFallback>{result.firstName?.[0] || result.first_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {result.firstName || result.first_name}{" "}
                          {result.lastName  || result.last_name}
                        </p>
                        <p className="text-xs text-zinc-400 truncate">{result.email}</p>
                      </div>
                    </div>
                    {uid !== user?.id && (
                      <Button
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); isFollowing ? handleUnfollowUser(result) : handleFollowUser(result); }}
                        variant="outline"
                        className={`text-xs ml-2 shrink-0 ${
                          isFollowing
                            ? "border-zinc-600 text-zinc-400 hover:bg-red-600 hover:text-white hover:border-red-600"
                            : "border-blue-400/50 text-gray-200 bg-gray-900 hover:bg-blue-600 hover:text-white"
                        }`}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile card with corrected counts */}
      <Card className="bg-zinc-900/50 backdrop-blur-xl border-zinc-800/50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="w-16 h-16 ring-2 ring-blue-400/50">
              <AvatarImage src={getProfilePicture(user)} />
              <AvatarFallback>{user?.firstName?.[0] || "?"}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-white">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-sm text-zinc-400">
                {user?.profile?.city || user?.location || "Location not set"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center mb-4">
            <button
              onClick={() => openFollowModal('connections')}
              className="hover:bg-zinc-700/50 rounded-lg p-2 transition-colors cursor-pointer"
            >
              <p className="font-bold text-white">{followersCount}</p>
              <p className="text-xs text-zinc-400">Connections</p>
            </button>
            <button
              onClick={() => openFollowModal('pending')}
              className="hover:bg-zinc-700/50 rounded-lg p-2 transition-colors cursor-pointer"
            >
              <p className="font-bold text-white">{followingCount}</p>
              <p className="text-xs text-zinc-400">Pending</p>
            </button>
          </div>

          {/* Followers / Following Modal */}
          {showFollowModal && (
            <div
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
              onClick={() => setShowFollowModal(null)}
            >
              <div
                className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-sm mx-4 p-5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold capitalize">{showFollowModal}</h3>
                  <button onClick={() => setShowFollowModal(null)} className="text-zinc-400 hover:text-white text-xl leading-none">×</button>
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {followListLoading ? (
                    <p className="text-zinc-400 text-sm text-center py-4">Loading…</p>
                  ) : followList.length === 0 ? (
                    <p className="text-zinc-400 text-sm text-center py-4">
                      No {showFollowModal} yet.
                    </p>
                  ) : (
                    followList.map((u) => {
                      const uid  = u.id ?? u._id ?? u.user_id;
                      // backend returns snake_case (first_name, last_name, profile_picture)
                      const name = `${u.first_name || u.firstName || ''} ${u.last_name || u.lastName || ''}`.trim() || u.fullName || "User";
                      const pic  = u.profile_picture || u.profilePicture || u.profile?.picture;
                      return (
                        <div key={uid} className="flex items-center gap-3 cursor-pointer hover:bg-zinc-800/30 rounded p-1.5 transition" onClick={() => { setShowFollowModal(null); navigate(`/user-profile?userId=${uid}`); }}>
                          <Avatar className="w-9 h-9">
                            <AvatarImage src={pic} />
                            <AvatarFallback className="text-sm font-bold">{name?.[0]?.toUpperCase() || "?"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm text-white font-medium">{name}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card className="bg-zinc-900/50 backdrop-blur-xl border-zinc-800/50">
        <CardContent className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.label}
                variant="ghost"
                onClick={() => handleMenuClick(item)}
                className={`w-full justify-start mb-2 ${
                  activeTab === item.id
                    ? "bg-gray-700 text-white border-blue-500/30"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                <Icon size={20} className="mr-3" />
                {item.label}
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card className="bg-zinc-900/50 backdrop-blur-xl border-zinc-800/50">
        <CardHeader>
          <h3 className="font-semibold text-white">Suggestions for you</h3>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {suggestions.length > 0 ? (
              suggestions.map((suggestedUser) => {
                const uid = suggestedUser.id ?? suggestedUser._id;
                const isFollowing = followingIds.has(Number(uid));
                return (
                  <div key={uid} className="flex items-center justify-between">
                    <div
                      className="flex items-center space-x-3 min-w-0 flex-1 cursor-pointer"
                      onClick={() => uid !== user?.id && navigate(`/user-profile?userId=${uid}`)}
                    >
                      <Avatar className="w-8 h-8 shrink-0">
                        {/* FIX: backend public dict has profile_picture or profile.picture */}
                        <AvatarImage
                          src={
                            suggestedUser.profile_picture ||
                            suggestedUser.profile?.picture ||
                            suggestedUser.profilePicture
                          }
                        />
                        <AvatarFallback>
                          {(suggestedUser.firstName || suggestedUser.first_name)?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {suggestedUser.firstName || suggestedUser.first_name}{" "}
                          {suggestedUser.lastName  || suggestedUser.last_name}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {isFollowing ? "Following" : "Not following"}
                        </p>
                      </div>
                    </div>
                    {uid !== user?.id && (
                      <Button
                        size="sm"
                        onClick={() =>
                          isFollowing
                            ? handleUnfollowUser(suggestedUser)
                            : handleFollowUser(suggestedUser)
                        }
                        variant="outline"
                        className={`text-xs ml-2 shrink-0 hover:cursor-pointer ${
                          isFollowing
                            ? "border-zinc-600 text-zinc-400 hover:bg-red-600 hover:text-white hover:border-red-600"
                            : "border-blue-400/50 text-gray-200 bg-gray-900 hover:bg-blue-600 hover:text-white"
                        }`}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </Button>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-zinc-400">No suggestions available.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}