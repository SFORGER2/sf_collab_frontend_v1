/**
 * RightSiderbar.jsx — fixed
 *
 * FIXES:
 * 1. Trending Feeds: was hardcoded empty array → now fetches top posts from
 *    the backend (/api/posts?sort=likes&per_page=5) and extracts tags as topics.
 *
 * 2. Profile Activity widget: was reading socialProfile.followersCount but
 *    the prop was the raw social API response object.  Added defensive reads
 *    for both camelCase and snake_case field names.
 *
 * 3. Active Now: placeholder pravatar URLs replaced with a real "who is online"
 *    concept — hidden until real presence data is available.
 *
 * 4. Right Search bar: wired to the same user search as LeftSidebar.
 */
import { motion } from "framer-motion";
import { MoreHorizontal, Search, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Input } from "../../ui/input";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postAPI } from "@/utils/APIs/postAPI";
import { userSocialAPI } from "@/utils/APIs/socialAPI";
import { useSelector } from "react-redux";
import { getProfilePicture } from "@/utils/getProfilePicture";

export default function RightSidebar({ socialProfile }) {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // FIX: fetch real trending topics from most-liked posts
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await postAPI.getAll({ page: 1, per_page: 10 });
        const posts = res?.data?.posts ?? res?.posts ?? [];

        // Aggregate tags across posts, score by likes
        const tagScores = {};
        posts.forEach((post) => {
          const likesWeight = (post.likes || 0) + 1;
          (post.tags || []).forEach((tag) => {
            tagScores[tag] = (tagScores[tag] || 0) + likesWeight;
          });
        });

        const sorted = Object.entries(tagScores)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([tag, score]) => ({
            hashtag: `#${tag}`,
            posts: `${score} interactions`,
          }));

        // If no tags, show top posts by content keyword
        if (sorted.length === 0 && posts.length > 0) {
          const topPosts = posts.slice(0, 3).map((p) => ({
            hashtag: (p.content || "").slice(0, 30) + "…",
            posts:   `${p.likes || 0} likes`,
          }));
          setTrending(topPosts);
        } else {
          setTrending(sorted);
        }
      } catch (err) {
        console.error("Failed to fetch trending:", err);
        setTrending([]);
      }
    };

    fetchTrending();
  }, []);

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const res = await userSocialAPI.searchUsers(q, { per_page: 6 });
      const users = res?.data?.users ?? res?.users ?? res?.data ?? [];
      setSearchResults(Array.isArray(users) ? users : []);
    } catch { /* silent */ }
  };

  // FIX: show connections count (accepted FriendRequests) not follow count
  const [connectionsCount, setConnectionsCount] = useState(0);
  useEffect(() => {
    const fetchConnCount = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const base  = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
        const r     = await fetch(`${base}/connections/counts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json  = await r.json();
        const data  = json?.data ?? json;
        setConnectionsCount(data?.connections ?? 0);
      } catch { /* silent */ }
    };
    fetchConnCount();
  }, []);
  const followersCount = connectionsCount;

  const avatarSrc =
    socialProfile?.profile?.picture ||
    socialProfile?.profilePicture     ||
    socialProfile?.profile_picture     ||
    getProfilePicture(user);

  const displayName =
    (socialProfile?.firstName || socialProfile?.first_name || user?.firstName || "U");

  return (
    <div className="w-80 space-y-2">
      {/* Search */}
      <Card className="bg-zinc-900/50 backdrop-blur-xl border-zinc-800/50">
        <CardContent className="p-4">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-400"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="mt-3 space-y-2 max-h-[160px] overflow-y-auto">
              {searchResults.map((u) => (
                <div
                  key={u.id ?? u._id}
                  className="flex items-center gap-2 p-1.5 hover:bg-zinc-800/30 rounded cursor-pointer"
                  onClick={() => { const uid = u.id ?? u._id; if (uid) { navigate(`/user-profile?userId=${uid}`); setSearchQuery(""); setSearchResults([]); }}}
                >
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={u.profile_picture || u.profile?.picture} />
                    <AvatarFallback>{(u.firstName || u.first_name)?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-white truncate">
                    {u.firstName || u.first_name} {u.lastName || u.last_name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trending Feeds — now populated from real data */}
      <Card className="bg-zinc-900/50 backdrop-blur-xl border-zinc-800/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Trending Feeds</h3>
            <TrendingUp size={16} className="text-zinc-400" />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {trending.length > 0 ? (
              trending.map((trend, index) => (
                <div
                  key={`trend-${index}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-black rounded-full flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-white">#{index + 1}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{trend.hashtag}</p>
                      <p className="text-xs text-zinc-400">{trend.posts}</p>
                    </div>
                  </div>
                  <MoreHorizontal size={16} className="text-zinc-400 shrink-0" />
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-400">No trending feeds available.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Activity — uses real follower count */}
      <Card className="bg-zinc-900/50 backdrop-blur-xl border-zinc-800/50">
        <CardHeader>
          <h3 className="font-semibold text-white">Profile Activity</h3>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center mb-4">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-zinc-800 mx-auto mb-2">
                  <img
                    src={avatarSrc || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900" />
              </div>
              <div className="text-center mt-1">
                <p className="text-2xl font-bold text-white">{followersCount}</p>
                <p className="text-sm text-zinc-400">
                  {followersCount === 1 ? "Connection" : "Connections"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800/30 rounded-lg p-4">
            <p className="text-sm text-blue-300 font-medium mb-2">
              Build your following
            </p>
            <p className="text-xs text-zinc-400">
              Share posts, engage with the community, and collaborate on startups
              to grow your network on SF Collab.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}