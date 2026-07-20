/**
 * CommentDialog.jsx — fixed
 *
 * ROOT CAUSE of "comments disappear on refresh":
 * The entire comment list was local state initialised with two hardcoded
 * comments (Alex Chen, Maya Patel). No API call was made to load real
 * comments from the backend, and handleAddComment only updated local state.
 * On refresh the local state reset to the hardcoded defaults.
 *
 * FIXES:
 * 1. On dialog open, fetch real comments from GET /api/post-comments?post_id=N
 * 2. handleAddComment POSTs to /api/post-comments and prepends the returned
 *    comment object to the list
 * 3. Keyboard shortcut: Ctrl/Cmd+Enter submits
 * 4. Loading and error states added
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogPortal, DialogOverlay,
} from "../../ui/dialog";
import { Textarea } from "../../ui/textarea";
import { ScrollArea } from "../../ui/scroll-area";
import ShinyText from "@/components/ui/ShinyText";
import { postAPI } from "@/utils/APIs/postAPI";
import { useSelector } from "react-redux";
import { getProfilePicture } from "@/utils/getProfilePicture";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function CommentDialog({ postId, comments: commentCount, postAuthor }) {
  const { user: currentUser } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [open,         setOpen]         = useState(false);
  const [commentList,  setCommentList]  = useState([]);
  const [newComment,   setNewComment]   = useState("");
  const [loading,      setLoading]      = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState(null);

  // FIX: fetch real comments when dialog opens
  useEffect(() => {
    if (!open || !postId) return;
    let cancelled = false;

    const fetchComments = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await postAPI.getComments(postId, { per_page: 50 });
        // response shape: { success, data: { comments, pagination } }
        const list = res?.data?.comments ?? res?.comments ?? [];
        if (!cancelled) setCommentList(list);
      } catch (err) {
        console.error("Failed to load comments:", err);
        if (!cancelled) setError("Failed to load comments.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchComments();
    return () => { cancelled = true; };
  }, [open, postId]);

  // FIX: POST to backend and prepend returned comment
  const handleAddComment = async () => {
    if (!newComment.trim() || submitting || !postId) return;
    setSubmitting(true);
    try {
      const author = currentUser
        ? {
            author_id:         currentUser.id,
            author_first_name: currentUser.firstName || currentUser.first_name,
            author_last_name:  currentUser.lastName  || currentUser.last_name,
          }
        : {};

      const res = await postAPI.addComment(postId, newComment.trim(), author);
      // response shape: { success, data: { comment } }
      const created = res?.data?.comment ?? res?.comment;
      if (created) {
        setCommentList((prev) => [created, ...prev]);
      } else {
        // Optimistic fallback if backend didn't return the comment object
        setCommentList((prev) => [{
          id:         Date.now(),
          content:    newComment.trim(),
          author_id:  currentUser?.id,
          author_first_name: currentUser?.firstName || currentUser?.first_name || "You",
          author_last_name:  currentUser?.lastName  || currentUser?.last_name  || "",
          created_at: new Date().toISOString(),
        }, ...prev]);
      }
      setNewComment("");
    } catch (err) {
      console.error("Failed to post comment:", err);
      setError("Failed to post comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
        >
          <MessageCircle size={18} />
          <span className="text-xs font-medium">{commentCount}</span>
        </Button>
      </DialogTrigger>

      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/60 z-50" />
        <DialogContent className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] flex flex-col bg-zinc-950 border border-zinc-800 text-white">
          <DialogHeader className="shrink-0">
            <DialogTitle>
              <ShinyText className="text-xl">Comments</ShinyText>
            </DialogTitle>
          </DialogHeader>

          {/* Comment list */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 py-2">
              {loading && (
                <div className="flex justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-zinc-500" />
                </div>
              )}

              {!loading && error && (
                <p className="text-red-400 text-sm text-center py-4">{error}</p>
              )}

              {!loading && !error && commentList.length === 0 && (
                <p className="text-zinc-500 text-sm text-center py-8">
                  No comments yet. Be the first!
                </p>
              )}

              <AnimatePresence initial={false}>
                {commentList.map((comment) => {
                  const firstName = comment.author_first_name || comment.author?.firstName || comment.author?.first_name || "User";
                  const lastName  = comment.author_last_name  || comment.author?.lastName  || comment.author?.last_name  || "";
                  const avatar    = comment.author?.profilePicture || comment.author?.profile_picture || comment.author?.profile?.picture;
                  const text      = comment.content || comment.text || "";
                  const ts        = comment.createdAt || comment.created_at;

                  const authorId = comment.author_id ?? comment.author?.id;
                  const canNavigate = authorId && authorId !== currentUser?.id;

                  return (
                    <motion.div
                      key={comment.id || comment._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-3"
                    >
                      {/* Clickable avatar → author profile */}
                      <Avatar
                        className={`w-8 h-8 ring-2 ring-blue-500/20 shrink-0 ${canNavigate ? "cursor-pointer hover:ring-blue-400" : ""}`}
                        onClick={() => canNavigate && navigate(`/user-profile?userId=${authorId}`)}
                      >
                        <AvatarImage src={avatar} />
                        <AvatarFallback>{firstName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="bg-zinc-900/50 rounded-xl p-3 border border-zinc-800/50">
                          {/* Clickable name → author profile */}
                          <p
                            className={`text-sm font-semibold ${canNavigate ? "cursor-pointer hover:text-blue-400 transition-colors" : ""}`}
                            onClick={() => canNavigate && navigate(`/user-profile?userId=${authorId}`)}
                          >
                            {firstName} {lastName}
                          </p>
                          <p className="text-sm text-zinc-300 mt-1 break-words">{text}</p>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1 ml-3">{timeAgo(ts)}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </ScrollArea>

          {/* Input footer */}
          <div className="flex gap-2 pt-4 border-t border-zinc-800/50 shrink-0">
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarImage src={getProfilePicture(currentUser)} />
              <AvatarFallback>
                {currentUser?.firstName?.[0] || currentUser?.first_name?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write your comment… (Ctrl+Enter to send)"
              className="bg-zinc-900/50 border-zinc-800 text-white resize-none flex-1"
              rows={2}
              disabled={submitting}
            />
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || submitting}
              className="bg-blue-600 hover:bg-blue-700 self-end disabled:opacity-50"
              size="icon"
            >
              {submitting
                ? <Loader2 size={18} className="animate-spin" />
                : <Send size={18} />
              }
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}