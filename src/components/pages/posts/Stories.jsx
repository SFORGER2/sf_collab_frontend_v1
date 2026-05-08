import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";

import StoryModal from "../../modal/StoryModal";
import StoryViewerModal from "../../modal/StoryViewerModal";
import { postAPI } from "@/utils/APIs/postAPI";

export default function Stories({ refreshKey }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await postAPI.getStories({ page: 1, per_page: 20 });
        // backend returns { success, message, data: { stories, pagination } }
        const data = response?.data;
        if (data && data.stories) {
          setStories(
            data.stories.map((s) => {
              const id = s.id || s._id;
              const thumbnail = s.media_url || s.mediaUrl;
              const author = s.author || {};
              const firstName = author.first_name || author.firstName;
              const lastName = author.last_name || author.lastName;
              const name =
                [firstName, lastName].filter(Boolean).join(" ") ||
                author.name ||
                "User";
              const avatar =
                author.profile?.picture ||
                author.profilePicture ||
                author.avatar ||
                author.picture;

              return {
                id,
                thumbnail,
                avatar,
                name,
                ...s,
              };
            })
          );
        } else {
          setStories([]);
        }
      } catch (error) {
        console.error("Failed to fetch stories:", error);
        setStories([]);
      }
    };

    fetchStories();
  }, [refreshKey]);
  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-4 border border-zinc-800/50 mb-6 mt-10">
      <div className="flex gap-4">
        {/* Add Story Card */}
        <div
          onClick={() => setIsOpen(true)}
          className="relative min-w-[120px] h-[120px] rounded-xl overflow-hidden border border-dashed border-zinc-700 bg-cover bg-center">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-zinc-400 hover:text-blue-400 transition">
            <button
              
              className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center mb-2"
            >
              <Plus size={18} />
            </button>
            <span className="text-xs font-medium">Add Story</span>
          </div>
        </div>
        {/* Stories modal */}
        <StoryModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        {/* Scrollable Stories */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {stories.map((story, index) => (
            <div
              key={story.id}
              onClick={() => {
                setActiveIndex(index);
                setViewerOpen(true);
              }}
              className="group relative min-w-[120px] h-[120px] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition"
            >
              {/* Thumbnail */}
              <img
                src={story.thumbnail}
                alt={story.name}
                className="absolute inset-0 h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              {/* User */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
                <Avatar className="w-7 h-7 border border-white/20">
                  <AvatarImage src={story.avatar} />
                  <AvatarFallback>{story.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-white font-medium truncate">
                  {story.name}
                </span>
              </div>
            </div>
          ))}
        </div>
        {/* status view */}
        <StoryViewerModal
          isOpen={viewerOpen}
          stories={stories}
          startIndex={activeIndex}
          onClose={() => setViewerOpen(false)}
        />
      </div>
    </div>
  );
};