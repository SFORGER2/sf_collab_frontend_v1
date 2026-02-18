import { Link } from "react-router-dom";
import { getStageColor } from "./getStageColor";
import {
  Bookmark,
  Clock,
  Heart,
  MessageCircle,
  Share2,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ideaAPI } from "@/utils/APIs/ideaAPI";
import { useSelector } from "react-redux";
import { API_BASE_URL } from "@/utils/config";
import { motion } from "framer-motion";
import connectionAPI from "@/utils/APIs/connectionAPI";
import { ConnectionButton } from "@/components/connection/ConnectionButton";
import { toast } from "react-toastify";

export default function IdeationCard({ content, shouldBlur }) {
  const [likes, setLikes] = useState(content?.likes || 0);
  const [liked, setLiked] = useState(content?.hasLiked || false);
  const [bookmarked, setBookmarked] = useState(content?.hasBookmarked || false);
  const { user, access_token } = useSelector((state) => state.auth);

  const handleLike = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        setLiked((prev) => {
          setLikes((l) => (prev ? l - 1 : l + 1));
          return !prev;
        });

        const res = await ideaAPI.likeIdea(content.id, access_token);
        setLikes(res.data.idea.likes);
        setLiked(res.data.idea.likedBy.includes(user.id));
      } catch (err) {
        console.error(err);
      }
    },
    [content.id, access_token, user]
  );

  const handleBookmark = async (e) => {
    e.preventDefault();
    e?.stopPropagation?.();

    if (!content.id || !user?.id) {
      toast.error("Unable to bookmark at this time");
      return;
    }

    try {
      const body = {
        user_id: user.id,
        idea_id: content.id,
        title: content.title,
        content_preview: content.description.substring(0, 100),
        url: `/ideation-details?id=${content.id}`,
      };
      const response = await ideaAPI.toggleIdeaBookmark(body);
      setBookmarked(response.data.isBookmarked);

    } catch (error) {
      console.error("Bookmark toggle error:", error);
      toast.error("Failed to update bookmark");
    }
  };

  // Don't show connection button for own ideas
  const isOwnIdea = user.id === content.author.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="h-full group"
    >
      <Link
        to={`/ideation-details?id=${content.id}`}
        className="relative block h-full rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:border-emerald-500/50 hover:from-gray-800/80 hover:to-gray-900/80 transition-all duration-300 backdrop-blur-sm overflow-hidden"
      >
        {/* Blur overlay for private ideas */}
        {shouldBlur && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-md rounded-2xl">
            <div className="text-center">
              <div className="text-5xl mb-3">🔒</div>
              <div className="text-gray-300 text-sm font-medium">
                Private Idea
              </div>
              <div className="text-gray-500 text-xs mt-1">
                Only the creator can view this
              </div>
            </div>
          </div>
        )}

        <div
          className={`p-6 space-y-4 h-full flex flex-col ${shouldBlur ? "blur-sm pointer-events-none" : ""
            }`}
        >
          {/* Image */}
          {content.imageUrl && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden rounded-xl border border-emerald-500/10"
            >
              <img
                src={
                  content.imageUrl.startsWith("http")
                    ? content.imageUrl
                    : `${API_BASE_URL}${content.imageUrl}`
                }
                alt={content.title}
                className="h-48 w-full object-cover group-hover:brightness-110 transition-all duration-300"
              />
            </motion.div>
          )}

          {/* Author + Stage */}
          <Link
            to={`/user-profile?id=${content.author.id}`}
            className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img
                src={content.author.avatar}
                className="h-10 w-10 rounded-full border-2 border-emerald-500/30 object-cover"
                alt={content.author.name}
              />
              <div>
                <p className="text-sm font-semibold text-white">
                  {content.author.name}
                </p>
                <p className="text-xs text-gray-400">{content.author.role}</p>
              </div>
            </div>

            <span
              className={`${getStageColor(
                content.stage
              )} text-xs px-3 py-1.5 rounded-full font-semibold`}
            >
              {content.stage}
            </span>
          </Link>

          {/* Title + Description */}
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white leading-tight line-clamp-2 mb-2">
              {content.title}
            </h2>
            <p className="text-sm text-gray-300 line-clamp-3">
              {content.description}
            </p>
          </div>

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {content.tags?.slice(0, 3).map((tag, i) => (
                <motion.span
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="text-xs text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full font-medium"
                >
                  #{tag}
                </motion.span>
              ))}
              {content.tags?.length > 3 && (
                <span className="text-xs text-gray-500 px-3 py-1">
                  +{content.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="border-t border-gray-700/50 pt-4 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4 text-gray-400">
                <motion.button
                  whileTap={{ scale: 1.25 }}
                  onClick={handleLike}
                  className="flex items-center gap-1.5 hover:text-red-400 transition-colors"
                >
                  <Heart
                    className={`h-4 w-4 ${liked ? "text-red-500 fill-red-500" : ""
                      }`}
                  />
                  <span>{likes}</span>
                </motion.button>

                <span className="flex items-center gap-1.5">
                  <MessageCircle className="h-4 w-4" />
                  {content.comments}
                </span>

                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {content.collaborators}
                </span>
              </div>

              <span className="flex items-center gap-1.5 text-gray-500">
                <Clock className="h-3 w-3" />
                {content.timeAgo}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBookmark}
                className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${bookmarked
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                  : "bg-white/5 text-gray-400 border border-gray-700/50 hover:border-emerald-500/30 hover:text-white"
                  }`}
                aria-pressed={bookmarked}
              >
                <Bookmark
                  className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`}
                />
                Save
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (navigator.share) {
                    navigator.share({
                      title: content.title,
                      text: content.description,
                      url: window.location.href,
                    });
                  } else {
                    toast.info("Share functionality not available");
                  }
                }}
                className="flex-1 py-2.5 px-3 rounded-lg bg-white/5 border border-gray-700/50 hover:border-blue-500/30 text-gray-400 hover:text-white font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </motion.button>

              
            </div>
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <ConnectionButton
                userId={content.author.id}
                size="sm"
                className="w-full"
              />
            </div>
            
          </div>
          
        </div>
        
      </Link>
    </motion.div>
  );
}
