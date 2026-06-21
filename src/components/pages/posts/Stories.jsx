/**
 * Stories.jsx
 *
 * Vite proxies /api → http://localhost:5001, so root-relative paths like
 * "/api/stories/media/file.jpeg" work in <img src> without any transformation.
 * Previous versions added resolveUrl() which was wrong — it bypassed the proxy.
 */
import { useEffect, useState, useMemo } from "react";
import { Plus, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import StoryModal from "../../modal/StoryModal";
import StoryViewerModal from "../../modal/StoryViewerModal";
import { postAPI } from "@/utils/APIs/postAPI";
import { useSelector } from "react-redux";
import { getProfilePicture } from "@/utils/getProfilePicture";

export default function Stories({ refreshKey }) {
  const { user: currentUser } = useSelector((s) => s.auth);

  const [isOpen,        setIsOpen]        = useState(false);
  const [viewerOpen,    setViewerOpen]    = useState(false);
  const [viewerStories, setViewerStories] = useState([]);
  const [rawStories,    setRawStories]    = useState([]);

  const fetchStories = async () => {
    try {
      const response = await postAPI.getStories({ page: 1, per_page: 50 });
      const list = response?.data?.stories ?? [];
      const now  = Date.now();
      setRawStories(
        list
          .filter((s) => {
            if (s.isExpired) return false;
            if (s.expiresAt) return new Date(s.expiresAt).getTime() > now;
            return true;
          })
          .map((s) => {
            const author    = s.author || {};
            const firstName = author.firstName || author.first_name || s.author_first_name || "";
            const lastName  = author.lastName  || author.last_name  || s.author_last_name  || "";
            const name      = [firstName, lastName].filter(Boolean).join(" ") || "User";
            const rawAvatar = author.profilePicture || author.profile_picture || author.profile?.picture;
            // Vite proxy handles /api paths — use as-is (no host prepending needed)
            const thumbnail = s.mediaUrl ?? s.media_url ?? null;
            return {
              ...s,
              thumbnail,
              avatar: rawAvatar || null,
              name,
              userId: s.userId ?? s.user_id ?? author.id,
            };
          })
      );
    } catch (err) {
      console.error("Failed to fetch stories:", err);
      setRawStories([]);
    }
  };

  useEffect(() => { fetchStories(); }, [refreshKey]);

  const storyGroups = useMemo(() => {
    const groups = {};
    rawStories.forEach((s) => {
      const uid = String(s.userId ?? "unknown");
      if (!groups[uid]) groups[uid] = [];
      groups[uid].push(s);
    });
    return Object.entries(groups)
      .map(([uid, stories]) => ({
        uid, stories,
        latest: stories[0],
        isOwn:  currentUser && String(uid) === String(currentUser.id),
      }))
      .sort((a, b) => (b.isOwn ? 1 : 0) - (a.isOwn ? 1 : 0));
  }, [rawStories, currentUser]);

  const myGroup     = storyGroups.find((g) => g.isOwn);
  const otherGroups = storyGroups.filter((g) => !g.isOwn);

  const openViewer = (group) => {
    if (!group?.stories?.length) return;
    setViewerStories(group.stories);
    setViewerOpen(true);
  };

  const handleDeleteStory = async (e, storyId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this story?")) return;
    try {
      await postAPI.deleteStory(storyId);
      setRawStories((prev) => prev.filter((s) => s.id !== storyId));
    } catch (err) { console.error("Failed to delete story:", err); }
  };

  const myAvatar = getProfilePicture(currentUser);

  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-4 border border-zinc-800/50 mb-6 mt-10">
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">

        {myGroup ? (
          <div
            className="relative shrink-0 w-[110px] h-[160px] rounded-xl overflow-hidden cursor-pointer group border-2 border-blue-500 bg-zinc-800"
            onClick={() => openViewer(myGroup)}
          >
            {myGroup.latest.thumbnail && (
              <img src={myGroup.latest.thumbnail} alt="Your story"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                onError={(e) => { e.target.style.display = "none"; }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10"
              onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}>
              <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center shadow hover:bg-blue-600 transition">
                <Plus size={16} className="text-white" />
              </div>
            </div>
            <button className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
              onClick={(e) => handleDeleteStory(e, myGroup.latest.id)}>
              <X size={12} className="text-white" />
            </button>
            <div className="absolute bottom-2 left-0 right-0 text-center z-10">
              <span className="text-white text-xs font-medium drop-shadow">Your Story</span>
            </div>
          </div>
        ) : (
          <div onClick={() => setIsOpen(true)}
            className="relative shrink-0 w-[110px] h-[160px] rounded-xl overflow-hidden border-2 border-dashed border-zinc-600 bg-zinc-800/50 hover:border-blue-400 transition cursor-pointer flex flex-col items-center justify-center gap-2">
            <div className="relative">
              {myAvatar ? (
                <img src={myAvatar} alt="You" className="w-12 h-12 rounded-full object-cover border-2 border-zinc-600"
                  onError={(e) => { e.target.style.display = "none"; }} />
              ) : (
                <div className="w-12 h-12 rounded-full bg-zinc-600 flex items-center justify-center">
                  <span className="text-white text-lg font-bold">{(currentUser?.firstName || currentUser?.first_name || "?")[0]}</span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-500 border-2 border-zinc-800 flex items-center justify-center">
                <Plus size={10} className="text-white" />
              </div>
            </div>
            <span className="text-xs text-zinc-400 font-medium">Add Story</span>
          </div>
        )}

        {otherGroups.map((group) => {
          const story = group.latest;
          return (
            <div key={group.uid} onClick={() => openViewer(group)}
              className="relative shrink-0 w-[110px] h-[160px] rounded-xl overflow-hidden cursor-pointer group border-2 border-blue-500 bg-zinc-800">
              {story.thumbnail && (
                <img src={story.thumbnail} alt={story.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  onError={(e) => { e.target.style.display = "none"; }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500">
                  <Avatar className="w-9 h-9 border-2 border-zinc-900">
                    <AvatarImage src={story.avatar} />
                    <AvatarFallback className="text-xs bg-zinc-700 text-white">{story.name[0]}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div className="absolute bottom-2 left-1 right-1 text-center z-10">
                <span className="text-white text-[11px] font-medium drop-shadow truncate block">{story.name.split(" ")[0]}</span>
              </div>
            </div>
          );
        })}

        <StoryModal isOpen={isOpen} onClose={() => { setIsOpen(false); fetchStories(); }} />
        {viewerOpen && viewerStories.length > 0 && (
          <StoryViewerModal isOpen={viewerOpen} stories={viewerStories} startIndex={0}
            onClose={() => { setViewerOpen(false); setViewerStories([]); }} />
        )}
      </div>
    </div>
  );
}