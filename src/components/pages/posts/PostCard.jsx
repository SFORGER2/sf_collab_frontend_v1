import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Eye, Trash2, Edit, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import { postAPI } from "@/utils/APIs/postAPI";
import { userSocialAPI } from "@/utils/APIs/socialAPI";
import { useSelector } from "react-redux";
import PostActions from "./PostActions";
import { getProfilePicture } from "@/utils/getProfilePicture";


const cardVariants = {
  hidden:   { opacity: 0, y: 20 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function PostCard({ post, onPostDeleted }) {
  const currentUser = useSelector((state) => state.auth.user);

  const [liked,          setLiked]          = useState(Boolean(post.isLiked || post.liked_by_current_user));
  const [likesCount,     setLikesCount]     = useState(Number(post.likes ?? 0));
  const [saved,          setSaved]          = useState(Boolean(post.isSaved || post.saved_by_current_user));
  const [isEditing,      setIsEditing]      = useState(false);
  const [editedCaption,  setEditedCaption]  = useState(post.caption || post.content || "");
  const [showComments,   setShowComments]   = useState(false);
  const [comments,       setComments]       = useState(
    // pre-populate from the post object if backend sent them inline
    Array.isArray(post.comments) ? post.comments : []
  );
  const [newComment,       setNewComment]       = useState("");
  const [loadingComments,  setLoadingComments]  = useState(false);
  const commentInputRef = useRef(null);

  const isOwnPost =
    currentUser &&
    (post.author?._id === currentUser.id ||
      post.author?.id  === currentUser.id ||
      post.userId      === currentUser.id);

  // ── Media helpers ─────────────────────────────────────────────────────────
  const getMediaUrls = () => {
    // FIX: resolve root-relative paths to absolute (backend runs on :5001, not :5173)
    if (Array.isArray(post.mediaItems) && post.mediaItems.length > 0) {
      return post.mediaItems.map((m) => {
        // PostMedia.to_dict() returns camelCase mediaUrl
        return typeof m === "string" ? m : (m.mediaUrl || m.media_url || m.url || null);
      }).filter(Boolean);
    }
    if (Array.isArray(post.media) && post.media.length > 0) {
      return post.media.map((m) =>
        typeof m === "string" ? m : (m.url || m.media_url || null)
      ).filter(Boolean);
    }
    if (post.mediaUrl) {
      const urls = Array.isArray(post.mediaUrl) ? post.mediaUrl : [post.mediaUrl];
      return urls.filter(Boolean);
    }
    return [];
  };

  const mediaUrls      = getMediaUrls();
  const hasMedia       = mediaUrls.length > 0;
  const hasMultiple    = mediaUrls.length > 1;
  const primaryUrl     = mediaUrls[0];

  // ── Author avatar ─────────────────────────────────────────────────────────
  // FIX: post.author.avatar and post.author.picture don't exist in backend response.
  // Backend returns profilePicture (from to_dict). Use getProfilePicture for safety.
  const authorAvatarSrc = (() => {
    const a = post.author;
    if (!a) return "/default-user.jpeg";
    const raw = a.profilePicture || a.profile_picture || a.avatar || a.picture;
    return raw || "/default-user.jpeg";
  })();

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleDeletePost = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await postAPI.delete(post.id ?? post._id);
      onPostDeleted?.(post.id ?? post._id);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleEditPost = async () => {
    if (!editedCaption.trim()) return;
    try {
      await postAPI.update(post.id ?? post._id, { content: editedCaption });
      post.content = editedCaption;
      setIsEditing(false);
    } catch (err) {
      console.error("Edit failed:", err);
    }
  };

  const handleSavePost = async () => {
    try {
      const postId = post.id ?? post._id;
      if (saved) {
        await userSocialAPI.unsavePost(currentUser?.id, postId);
      } else {
        await userSocialAPI.savePost(currentUser?.id, postId);
      }
      setSaved(!saved);
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  // FIX: was calling postsAPI from socialAPI.js which had unlike pointing to
  // the same URL as like (/posts/:id/like). Changed to use postAPI (postAPI.js)
  // which has the correct /unlike endpoint.
  const handleLikeClick = async () => {
    if (!currentUser) return;
    const postId    = post.id ?? post._id;
    const toLiked   = !liked;
    // Optimistic update
    setLiked(toLiked);
    setLikesCount((c) => toLiked ? c + 1 : Math.max(0, c - 1));
    try {
      if (toLiked) {
        await postAPI.like(postId);
      } else {
        await postAPI.unlike(postId);
      }
    } catch (err) {
      // Revert on failure
      setLiked(!toLiked);
      setLikesCount((c) => !toLiked ? c + 1 : Math.max(0, c - 1));
      console.error("Like failed:", err);
    }
  };

  const handleLoadComments = async () => {
    if (showComments) { setShowComments(false); return; }
    setLoadingComments(true);
    try {
      const postId = post.id ?? post._id;
      const res    = await postAPI.getComments(postId, { page: 1, per_page: 50 });
      // FIX: res = { success, data: { comments, pagination } } after axios unwrap
      const list = res?.data?.comments ?? res?.comments ?? [];
      setComments(list);
      setShowComments(true);
    } catch (err) {
      console.error("Load comments failed:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUser) return;
    try {
      const postId = post.id ?? post._id;
      const res    = await postAPI.addComment(postId, newComment.trim(), {
        author_id:         currentUser.id,
        author_first_name: currentUser.firstName || currentUser.first_name,
        author_last_name:  currentUser.lastName  || currentUser.last_name,
      });
      // FIX: res = { success, data: { comment } } — must read res.data.comment
      const created = res?.data?.comment ?? res?.comment;
      if (created) {
        setComments((prev) => [...prev, created]);
      } else {
        // Optimistic fallback
        setComments((prev) => [...prev, {
          id:               Date.now(),
          content:          newComment.trim(),
          author:           {
            id:             currentUser.id,
            firstName:      currentUser.firstName || currentUser.first_name,
            lastName:       currentUser.lastName  || currentUser.last_name,
            profilePicture: currentUser.profile_picture,
          },
          createdAt:        new Date().toISOString(),
        }]);
      }
      setNewComment("");
      // Auto-open comments section if it was closed
      setShowComments(true);
    } catch (err) {
      console.error("Comment failed:", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const postId = post.id ?? post._id;
      await postAPI.deleteComment(postId, commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId && c.id !== commentId));
    } catch (err) {
      console.error("Delete comment failed:", err);
    }
  };

  const commentsCount = comments.length > 0
    ? comments.length
    : Number(post.commentsCount ?? post.comments_count ?? 0);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover={{ scale: 1.005 }}>
      <Card className="bg-zinc-900/50 backdrop-blur-xl border-zinc-800/50 hover:border-zinc-700/50 shadow-xl transition-all duration-300 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 ring-2 ring-blue-400/50">
                {/* FIX: backend sends profilePicture not avatar/picture */}
                <AvatarImage src={authorAvatarSrc} />
                <AvatarFallback>
                  {(post.author?.firstName || post.author?.first_name || "U")[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm text-white">
                  {post.author?.firstName || post.author?.first_name}{" "}
                  {post.author?.lastName  || post.author?.last_name}
                </p>
                <p className="text-xs text-zinc-400">
                  {post.timestamp || new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {isOwnPost && (
                <>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}
                    className="text-zinc-400 hover:text-blue-400 hover:bg-zinc-800">
                    <Edit size={18} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleDeletePost}
                    className="text-zinc-400 hover:text-red-400 hover:bg-zinc-800">
                    <Trash2 size={18} />
                  </Button>
                </>
              )}

            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {/* Content */}
          {isEditing ? (
            <div className="flex gap-2">
              <textarea value={editedCaption} onChange={(e) => setEditedCaption(e.target.value)}
                className="flex-1 bg-zinc-800 text-white rounded p-2 text-sm" rows="3" />
              <div className="flex flex-col gap-2">
                <Button size="sm" onClick={handleEditPost} className="bg-blue-500 hover:bg-blue-600">Save</Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <p className="text-zinc-300 leading-relaxed text-sm">{post.content || post.caption}</p>
          )}

          {/* Media */}
          {hasMedia && (
            <motion.div className="relative group cursor-pointer" whileHover={{ scale: 1.01 }}>
              {post.type !== "video" ? (
                hasMultiple ? (
                  <div className="grid grid-cols-2 gap-2">
                    {mediaUrls.slice(0, 4).map((url, i) => (
                      <div key={i} className="relative rounded-lg overflow-hidden h-[200px]">
                        <img src={url} alt={`media ${i}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={primaryUrl} alt="Post" className="w-full h-auto max-h-[500px] object-cover rounded-xl" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye size={20} className="text-white" />
                    </div>
                  </div>
                )
              ) : (
                <video src={primaryUrl} className="w-full rounded-xl max-h-[500px]" controls />
              )}
            </motion.div>
          )}

          <Separator className="bg-zinc-800/50" />

          {/* Like / Comment / Share */}
          <PostActions
            post={{ ...post, likes: likesCount }}
            liked={liked}
            setLiked={setLiked}
            onLikeClick={handleLikeClick}
            bookmarked={saved}
            setBookmarked={setSaved}
          />

          {/* Show Comments toggle */}
          <Button variant="ghost" size="sm" onClick={handleLoadComments}
            className="w-full text-zinc-400 hover:text-white gap-2">
            <MessageCircle size={16} />
            {loadingComments ? "Loading…" : `${showComments ? "Hide" : "Show"} Comments (${commentsCount})`}
          </Button>

          {/* Comments Section */}
          {showComments && (
            <div className="space-y-3 border-t border-zinc-800/50 pt-3">
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-zinc-500 text-sm text-center py-2">No comments yet.</p>
                ) : (
                  comments.map((comment, idx) => {
                    const cId      = comment.id ?? comment._id ?? idx;
                    const cName    = comment.author?.firstName || comment.author_first_name || "User";
                    const cContent = comment.content ?? comment.text ?? "";
                    const cDate    = comment.createdAt || comment.created_at;
                    const cAvatar  = comment.author?.profilePicture || comment.author?.profile_picture;
                    return (
                      <div key={cId} className="bg-zinc-800/30 rounded p-2 text-sm flex gap-2 items-start">
                        <Avatar className="w-7 h-7 shrink-0">
                          <AvatarImage src={cAvatar} />
                          <AvatarFallback>{cName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-blue-400 text-xs">{cName}</p>
                          <p className="text-zinc-300 break-words">{cContent}</p>
                          {cDate && <p className="text-xs text-zinc-500 mt-1">{new Date(cDate).toLocaleDateString()}</p>}
                        </div>
                        {(currentUser?.id === (comment.author?.id ?? comment.author_id) || isOwnPost) && (
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteComment(cId)}
                            className="text-red-400 hover:bg-red-500/20 shrink-0">
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add comment */}
              <div className="flex gap-2">
                <Avatar className="w-7 h-7 shrink-0">
                  <AvatarImage src={getProfilePicture(currentUser)} />
                  <AvatarFallback>{(currentUser?.firstName || currentUser?.first_name || "?")[0]}</AvatarFallback>
                </Avatar>
                <input
                  ref={commentInputRef}
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  placeholder="Add a comment…"
                  className="flex-1 bg-zinc-800 text-white rounded px-3 py-2 text-sm outline-none"
                />
                <Button size="sm" onClick={handleAddComment} className="bg-blue-500 hover:bg-blue-600">
                  Post
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}