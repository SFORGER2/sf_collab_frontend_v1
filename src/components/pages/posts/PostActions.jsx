/**
 * PostActions.jsx — fixed
 *
 * FIX: CommentDialog was never passed postId, so it couldn't load or submit
 * real comments from the database. Added postId prop passthrough.
 * Also wired like/unlike to the real API via onLikeClick from PostCard.
 */
import { useCallback } from "react";
import { motion } from "framer-motion";
import { Bookmark, Heart, Share2, MessageCircle } from "lucide-react";
import { Button } from "../../ui/button";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "../../ui/tooltip";
import CommentDialog from "./CommentDialog";

const iconVariants = {
  idle:  { scale: 1 },
  tap:   { scale: 0.9 },
  hover: { scale: 1.1, rotate: [0, -10, 10, 0], transition: { duration: 0.3 } },
};

function ShareSheet({ post }) {
  const handleShare = useCallback(async () => {
    const url =
      window.location.origin +
      "/posts" +
      (post?.id || post?._id ? `?postId=${post.id || post._id}` : "");

    if (navigator.share) {
      try { await navigator.share({ title: "Check out this post", text: post?.content || "", url }); }
      catch { /* user cancelled */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      alert("Post link copied to clipboard");
    } catch {
      alert("Unable to copy link.");
    }
  }, [post]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div variants={iconVariants} whileHover="hover" whileTap="tap">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="gap-2 text-zinc-400 hover:text-green-400 hover:bg-green-500/10 transition-all"
            >
              <Share2 size={18} />
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>Share</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function PostActions({
  post,
  liked,
  bookmarked,
  onLikeClick,
  setLiked,
  setBookmarked,
}) {
  const postId = post?.id ?? post?._id;

  const likesCount = Number(post.likes_count ?? post.likes ?? 0);
  const commentsCount = Array.isArray(post.comments)
    ? post.comments.length
    : Number(post.commentsCount ?? post.comments_count ?? post.comments ?? 0);

  const handleLike = () => {
    if (onLikeClick) onLikeClick();
    else setLiked(!liked);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* Like */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div variants={iconVariants} whileHover="hover" whileTap="tap">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`gap-2 transition-all ${
                    liked
                      ? "text-pink-500 bg-pink-500/10 hover:bg-pink-500/20"
                      : "text-zinc-400 hover:text-pink-400 hover:bg-pink-500/10"
                  }`}
                >
                  <Heart size={18} className={liked ? "fill-pink-500" : ""} />
                  <span className="text-xs font-medium">{likesCount}</span>
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>{liked ? "Unlike" : "Like"}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* FIX: pass postId so CommentDialog can load/submit real comments */}
        <CommentDialog
          postId={postId}
          comments={commentsCount}
          postAuthor={post.author}
        />

        <ShareSheet post={post} />
      </div>

      {/* Bookmark */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div variants={iconVariants} whileHover="hover" whileTap="tap">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBookmarked(!bookmarked)}
                className={`gap-2 transition-all ${
                  bookmarked
                    ? "text-blue-400 bg-blue-500/10 hover:bg-blue-500/20"
                    : "text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10"
                }`}
              >
                <Bookmark size={18} className={bookmarked ? "fill-blue-400" : ""} />
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>{bookmarked ? "Unsave" : "Save"}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}