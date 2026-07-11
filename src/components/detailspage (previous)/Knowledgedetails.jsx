import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import {
  ArrowLeft, Eye, Download, ThumbsUp, Bookmark, BookmarkCheck,
  Clock, Tag, User, Calendar, FileText, MessageCircle, Send,
  ExternalLink, Loader2, AlertCircle
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const getAuthHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
};

const getProfilePic = (pic) => {
  if (!pic) return null;
  if (pic.startsWith("http")) return pic;
  return `${API_URL}${pic.startsWith("/") ? "" : "/"}${pic}`;
};

// ── Avatar initials fallback ─────────────────────────────────────────────────
const Avatar = ({ src, name, size = 48 }) => {
  const [err, setErr] = useState(false);
  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  if (src && !err) {
    return (
      <img
        src={getProfilePic(src)}
        alt={name}
        onError={() => setErr(true)}
        style={{ width: size, height: size }}
        className="rounded-full object-cover"
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
    >
      {initials}
    </div>
  );
};

// ── Stat badge ───────────────────────────────────────────────────────────────
const StatBadge = ({ icon: Icon, value, label, color = "text-gray-300" }) => (
  <div className="flex items-center gap-2 bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2">
    <Icon className={`w-4 h-4 ${color}`} />
    <span className="text-white font-semibold text-sm">{value}</span>
    <span className="text-gray-400 text-xs">{label}</span>
  </div>
);

// ── Comment card ─────────────────────────────────────────────────────────────
const CommentCard = ({ comment }) => (
  <div className="flex gap-3 p-4 bg-gray-800/40 border border-gray-700/50 rounded-xl">
    <Avatar
      src={comment.author?.profilePicture}
      name={comment.author?.fullName || `${comment.author?.firstName} ${comment.author?.lastName}`}
      size={36}
    />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-white text-sm font-medium">
          {comment.author?.fullName || `${comment.author?.firstName} ${comment.author?.lastName}`}
        </span>
        <span className="text-gray-500 text-xs">{formatDate(comment.createdAt)}</span>
      </div>
      <p className="text-gray-300 text-sm leading-relaxed">{comment.content}</p>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function KnowledgeDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id");
  const { access_token, user } = useSelector((s) => s.auth || {});

  const [post, setPost]           = useState(null);
  const [comments, setComments]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [liked, setLiked]         = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeLoading, setLikeLoading]     = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [commentText, setCommentText]     = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentsPage, setCommentsPage]   = useState(1);
  const [commentsTotalPages, setCommentsTotalPages] = useState(1);

  // ── Fetch post ──────────────────────────────────────────────────────────────
  const fetchPost = useCallback(async () => {
    if (!id) { setError("No resource ID provided"); setLoading(false); return; }
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get(`${API_URL}/knowledge/${id}`);
      if (data.success) {
        setPost(data.data.knowledge_post);
      } else {
        setError("Resource not found");
      }
    } catch (err) {
      setError(err?.response?.status === 404 ? "Resource not found" : "Failed to load resource");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ── Fetch comments ──────────────────────────────────────────────────────────
  const fetchComments = useCallback(async (page = 1) => {
    if (!id) return;
    try {
      const { data } = await axios.get(
        `${API_URL}/knowledge-comments?resource_id=${id}&page=${page}&per_page=10`
      );
      if (data.success) {
        setComments((prev) => page === 1 ? data.data.comments : [...prev, ...data.data.comments]);
        setCommentsTotalPages(data.data.pagination?.pages || 1);
        setCommentsPage(page);
      }
    } catch {
      // non-fatal
    }
  }, [id]);

  useEffect(() => { fetchPost(); fetchComments(1); }, [fetchPost, fetchComments]);

  // ── Like ────────────────────────────────────────────────────────────────────
  const handleLike = async () => {
    if (!access_token) { toast.info("Sign in to like resources"); return; }
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      await axios.post(`${API_URL}/knowledge/${id}/like`, {}, getAuthHeader(access_token));
      setLiked((prev) => !prev);
      setPost((prev) => ({
        ...prev,
        likes: prev.likes + (liked ? -1 : 1),
      }));
    } catch {
      toast.error("Failed to update like");
    } finally {
      setLikeLoading(false);
    }
  };

  // ── Download ────────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!post?.fileUrl) { toast.info("No downloadable file attached to this resource"); return; }
    try {
      await axios.post(`${API_URL}/knowledge/${id}/download`, {});
      setPost((prev) => ({ ...prev, downloads: prev.downloads + 1 }));
      window.open(post.fileUrl, "_blank");
    } catch {
      window.open(post.fileUrl, "_blank");
    }
  };

  // ── Bookmark ────────────────────────────────────────────────────────────────
  const handleBookmark = async () => {
    if (!access_token) { toast.info("Sign in to bookmark resources"); return; }
    if (bookmarkLoading) return;
    setBookmarkLoading(true);
    try {
      if (!bookmarked) {
        await axios.post(
          `${API_URL}/knowledge-bookmarks`,
          { knowledge_id: parseInt(id), user_id: user?.id },
          getAuthHeader(access_token)
        );
        setBookmarked(true);
        toast.success("Resource bookmarked!");
      } else {
        toast.info("Already bookmarked");
      }
    } catch (err) {
      if (err?.response?.status === 409) {
        setBookmarked(true);
        toast.info("Already bookmarked");
      } else {
        toast.error("Failed to bookmark");
      }
    } finally {
      setBookmarkLoading(false);
    }
  };

  // ── Add comment ─────────────────────────────────────────────────────────────
  const handleAddComment = async () => {
    if (!access_token) { toast.info("Sign in to comment"); return; }
    if (!commentText.trim()) { toast.error("Comment cannot be empty"); return; }
    setCommentLoading(true);
    try {
      const { data } = await axios.post(
        `${API_URL}/knowledge-comments`,
        {
          resource_id: parseInt(id),
          content: commentText.trim(),
          author_id: user?.id,
          author_first_name: user?.firstName || user?.first_name || "",
          author_last_name: user?.lastName || user?.last_name || "",
        },
        getAuthHeader(access_token)
      );
      if (data.success) {
        setComments((prev) => [data.data.comment, ...prev]);
        setPost((prev) => ({ ...prev, commentsCount: (prev.commentsCount || 0) + 1 }));
        setCommentText("");
        toast.success("Comment added!");
      }
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto mb-3" />
          <p className="text-gray-400">Loading resource...</p>
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────
  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-white mb-2">{error || "Resource not found"}</h2>
          <button
            onClick={() => navigate("/knowledge")}
            className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Knowledge Base
          </button>
        </div>
      </div>
    );
  }

  const authorName = `${post.author?.firstName || ""} ${post.author?.lastName || ""}`.trim() || "Unknown Author";

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Back + Stats bar ── */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <button
            onClick={() => navigate("/knowledge")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Knowledge Base
          </button>

          <div className="flex items-center gap-3 flex-wrap">
            <StatBadge icon={Eye}      value={post.views}     label="views"     color="text-purple-400" />
            <StatBadge icon={Download} value={post.downloads} label="downloads" color="text-yellow-400" />
            <StatBadge icon={ThumbsUp} value={post.likes}     label="likes"     color="text-green-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT: Author profile ── */}
          <div className="space-y-6">

            {/* Author card */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-400 font-medium">
                <User className="w-4 h-4" />
                Author Profile
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <Avatar src={post.author?.profilePicture} name={authorName} size={72} />
                </div>
                <h3 className="text-white font-bold text-lg">{authorName}</h3>
                {post.author?.company && (
                  <p className="text-gray-400 text-sm mt-1">{post.author.company}</p>
                )}
              </div>
            </div>

            {/* Resource details */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2 text-sm text-gray-400 font-medium">
                <FileText className="w-4 h-4" />
                Resource Details
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Published
                  </span>
                  <span className="text-white">{formatDate(post.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Last Updated
                  </span>
                  <span className="text-white">{formatDate(post.updatedAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Category</span>
                  <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs px-2 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5" />
                    Comments
                  </span>
                  <span className="text-white">{post.commentsCount || 0}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={handleLike}
                disabled={likeLoading}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border font-medium transition-all ${
                  liked
                    ? "bg-green-500/20 border-green-500/50 text-green-400"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:border-green-500/50 hover:text-green-400"
                }`}
              >
                {likeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                {liked ? "Liked" : "Like"} · {post.likes}
              </button>

              <button
                onClick={handleBookmark}
                disabled={bookmarkLoading}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border font-medium transition-all ${
                  bookmarked
                    ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:border-yellow-500/50 hover:text-yellow-400"
                }`}
              >
                {bookmarkLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : bookmarked ? (
                  <BookmarkCheck className="w-4 h-4" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
                {bookmarked ? "Bookmarked" : "Bookmark"}
              </button>

              {post.fileUrl ? (
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Resource
                </button>
              ) : (
                <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-700/50 border border-gray-600 text-gray-500 text-sm cursor-not-allowed">
                  <Download className="w-4 h-4" />
                  No file attached
                </div>
              )}
            </div>
          </div>

          {/* ── CENTER + RIGHT: Main content ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Title & description */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs px-3 py-1 rounded-full">
                  {post.category}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
                {post.title}
              </h1>

              {post.titleDescription && (
                <p className="text-gray-300 text-base leading-relaxed mb-4">{post.titleDescription}</p>
              )}

              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  Content Overview
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {post.contentPreview}
                </p>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-400" />
                    Topics Covered
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-gray-700/60 text-gray-300 border border-gray-600 text-xs px-3 py-1.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* External link */}
              {post.fileUrl && (
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <a
                    href={post.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open resource link
                  </a>
                </div>
              )}
            </div>

            {/* ── Comments section ── */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                Discussion
                <span className="text-sm text-gray-400 font-normal">
                  ({post.commentsCount || comments.length} comments)
                </span>
              </h2>

              {/* Add comment */}
              <div className="mb-6">
                <div className="flex gap-3">
                  {user && (
                    <Avatar
                      src={user?.profilePicture || user?.profile_picture}
                      name={`${user?.firstName || user?.first_name || ""} ${user?.lastName || user?.last_name || ""}`}
                      size={36}
                    />
                  )}
                  <div className="flex-1">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={access_token ? "Share your thoughts..." : "Sign in to comment"}
                      disabled={!access_token || commentLoading}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none text-sm resize-none disabled:opacity-50"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={handleAddComment}
                        disabled={!access_token || !commentText.trim() || commentLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        {commentLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Post Comment
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comment list */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No comments yet. Be the first!</p>
                  </div>
                ) : (
                  <>
                    {comments.map((comment) => (
                      <CommentCard key={comment.id} comment={comment} />
                    ))}

                    {commentsPage < commentsTotalPages && (
                      <button
                        onClick={() => fetchComments(commentsPage + 1)}
                        className="w-full py-2.5 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-xl transition-colors"
                      >
                        Load more comments
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}