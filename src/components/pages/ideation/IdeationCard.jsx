import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { getStageColor } from "./getStageColor";
import {
  Bookmark, Clock, Heart, MessageCircle, Share2,
  Users, UserPlus, X, Send, CheckCircle, Clock3,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ideaAPI } from "@/utils/APIs/ideaAPI";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { ConnectionButton } from "@/components/connection/ConnectionButton";
import { toast } from "react-toastify";
import { getProfilePicture } from "@/utils/getProfilePicture";
import axios from "axios";

// ── Collab Request Modal ──────────────────────────────────────────────────────
function CollabRequestModal({ idea, onClose, onSuccess, accessToken }) {
  const [message, setMessage] = useState("");
  const [role,    setRole]    = useState("co-developer");
  const [loading, setLoading] = useState(false);

  const roles = ["co-developer","designer","marketer","business analyst","advisor","other"];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `/api/ideas/${idea.id}/collab-requests`,
        { message, role },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success("Request sent! The creator will review it.");
      onSuccess(res?.data?.data?.collab_request?.id);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-gray-900 border border-blue-500/30 rounded-2xl p-6 space-y-5 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Join as Contributor</h2>
            <p className="text-sm text-gray-400 mt-1 line-clamp-1">"{idea?.title}"</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Your role</label>
          <div className="flex flex-wrap gap-2">
            {roles.map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize ${
                  role === r
                    ? "bg-blue-500/20 border-blue-500 text-blue-300"
                    : "bg-white/5 border-gray-700 text-gray-400 hover:border-blue-500/50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">
            Message to creator <span className="text-gray-600">(optional)</span>
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Tell them why you'd be a great fit..."
            rows={4}
            className="w-full bg-white/5 border border-gray-700 focus:border-blue-500/50 rounded-xl p-3 text-sm text-white placeholder-gray-600 outline-none resize-none transition-colors"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            {loading
              ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              : <><Send className="h-4 w-4" />Send Request</>
            }
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

// ── Collab Button ─────────────────────────────────────────────────────────────
function CollabButton({ content, accessToken, isOwnIdea }) {
  const [status,         setStatus]         = useState(null);
  const [requestId,      setRequestId]      = useState(null);
  const [showModal,      setShowModal]      = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [interestedCount,setInterestedCount]= useState(content?.pending_collab_count ?? 0);

  useEffect(() => {
    if (isOwnIdea || !content?.id) return;
    axios
      .get(`/api/ideas/${content.id}/collab-requests/my-status`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(res => {
        const cr = res?.data?.data?.collab_request;
        if (cr) { setStatus(cr.status); setRequestId(cr.id); }
      })
      .catch(() => {});
  }, [content?.id, accessToken, isOwnIdea]);

  const handleCancel = async e => {
    e?.preventDefault?.(); e?.stopPropagation?.();
    if (!requestId) { toast.error("Request ID missing — try refreshing"); return; }
    setLoading(true);
    try {
      await axios.post(
        `/api/ideas/collab-requests/${requestId}/cancel`, {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setStatus(null); setRequestId(null);
      setInterestedCount(c => Math.max(0, c - 1));
      toast.info("Request cancelled");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to cancel request");
    } finally { setLoading(false); }
  };

  const handleLeave = async e => {
    e?.preventDefault?.(); e?.stopPropagation?.();
    setLoading(true);
    try {
      await axios.post(
        `/api/ideas/${content.id}/leave`, {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setStatus(null); setRequestId(null);
      toast.info("You have left the project");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to leave project");
    } finally { setLoading(false); }
  };

  if (isOwnIdea) return null;

  if (status === "approved") {
    return (
      <div className="w-full space-y-1.5">
        <div className="w-full py-2 px-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm flex items-center justify-center gap-2">
          <CheckCircle className="h-4 w-4" /> Contributor ✓
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleLeave} disabled={loading}
          className="w-full py-1.5 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 text-xs font-medium transition-all flex items-center justify-center gap-1.5">
          {loading ? <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" /> : <X className="h-3 w-3" />}
          {loading ? "Leaving..." : "Leave Project"}
        </motion.button>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="w-full space-y-1.5">
        <div className="w-full py-2 px-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm flex items-center justify-center gap-2">
          <Clock3 className="h-4 w-4" /> Request Sent — Awaiting Review
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleCancel} disabled={loading}
          className="w-full py-1.5 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 text-xs font-medium transition-all flex items-center justify-center gap-1.5">
          {loading ? <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" /> : <X className="h-3 w-3" />}
          {loading ? "Cancelling..." : "Cancel Request"}
        </motion.button>
      </div>
    );
  }

  return (
    <>
      {showModal && (
        <CollabRequestModal
          idea={content}
          accessToken={accessToken}
          onClose={() => setShowModal(false)}
          onSuccess={newRequestId => {
            setStatus("pending");
            setRequestId(newRequestId);
            setInterestedCount(c => c + 1);
          }}
        />
      )}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={e => { e?.preventDefault?.(); e?.stopPropagation?.(); setShowModal(true); }}
        className="w-full py-2.5 px-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/60 text-blue-400 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
      >
        <UserPlus className="h-4 w-4" />
        {status === "rejected" ? "Express Interest Again" : "Interested in Contributing"}
        {interestedCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 bg-blue-500/20 border border-blue-500/40 rounded-full text-xs font-bold text-blue-300">
            {interestedCount}
          </span>
        )}
      </motion.button>
    </>
  );
}

// ── Main Card ─────────────────────────────────────────────────────────────────
export default function VisionCard({ content, shouldBlur }) {
  // FIX: useNavigate was missing — caused "navigate is not defined" crash
  const navigate = useNavigate();

  const [likes,     setLikes]     = useState(content?.likes     || 0);
  const [liked,     setLiked]     = useState(content?.hasLiked  || false);
  const [bookmarked,setBookmarked]= useState(content?.hasBookmarked || false);
  const { user, access_token }    = useSelector(state => state?.auth);

  const isOwnIdea = user?.id === (content?.author?.id || content?.creator?.id);
  const author    = useMemo(() => content?.author || content?.creator || {}, [content]);

  const handleLike = useCallback(async e => {
    e?.preventDefault?.(); e?.stopPropagation?.();
    if (!content?.id) return;
    try {
      // Optimistic update
      setLiked(prev => { setLikes(l => prev ? l - 1 : l + 1); return !prev; });
      const res = await ideaAPI?.likeIdea?.(content?.id, access_token);
      // ideaAPI normalises to { data: { idea: { hasLiked, likes } } }
      const ideaData = res?.data?.idea || {};
      if (typeof ideaData.likes    === 'number')  setLikes(ideaData.likes);
      if (typeof ideaData.hasLiked === 'boolean') setLiked(ideaData.hasLiked);
    } catch (err) { console.error(err); }
  }, [content?.id, access_token]);

  const handleBookmark = async e => {
    e?.preventDefault?.(); e?.stopPropagation?.();
    if (!content?.id || !user?.id) { toast.error("Unable to bookmark at this time"); return; }
    try {
      const body = {
        user_id: user?.id, idea_id: content?.id,
        title: content?.title,
        content_preview: content?.description?.substring(0, 100),
        url: `/ideation-details?id=${content?.id}`,
      };
      const response = await ideaAPI?.toggleIdeaBookmark?.(body);
      setBookmarked(response?.data?.isBookmarked);
    } catch { toast.error("Failed to update bookmark"); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="h-full group vision"
    >
      {/* FIX: outer <Link> replaced with <div onClick navigate> to prevent nested <a> tags */}
      <div
        onClick={() => navigate(`/ideation-details?id=${content?.id}`)}
        className="relative block h-full rounded-2xl border border-blue-500/20 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:border-blue-500/50 hover:from-gray-800/80 hover:to-gray-900/80 transition-all duration-300 backdrop-blur-sm overflow-hidden cursor-pointer"
      >
        {shouldBlur && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-md rounded-2xl">
            <div className="text-center">
              <div className="text-5xl mb-3">🔒</div>
              <div className="text-gray-300 text-sm font-medium">Private Vision</div>
              <div className="text-gray-500 text-xs mt-1">Only the creator can view this</div>
            </div>
          </div>
        )}

        <div className={`p-6 space-y-4 h-full flex flex-col ${shouldBlur ? "blur-sm pointer-events-none" : ""}`}>

          {content?.imageUrl && (
            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}
              className="overflow-hidden rounded-xl border border-blue-500/10">
              <img src={content?.imageUrl} alt={content?.title}
                className="h-48 w-full object-cover group-hover:brightness-110 transition-all duration-300" />
            </motion.div>
          )}

          {/* FIX: inner author <Link> replaced with <div> + stopPropagation to prevent nested <a> */}
          <div
            onClick={e => { e.preventDefault(); e.stopPropagation(); navigate(`/user-profile?userId=${author?.id}`); }}
            className="flex items-start justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <img src={getProfilePicture(author)}
                className="h-10 w-10 rounded-full border-2 border-blue-500/30 object-cover"
                alt={author?.name} />
              <div>
                <p className="text-sm font-semibold text-white">{author?.name}</p>
                <p className="text-xs text-gray-400">{author?.role}</p>
              </div>
            </div>
            <span className={`${getStageColor(content?.stage)} text-xs px-3 py-1.5 rounded-full font-semibold`}>
              {content?.stage}
            </span>
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-bold text-white leading-tight line-clamp-2 mb-2">{content?.title}</h2>
            <p className="text-sm text-gray-300 line-clamp-3">{content?.description}</p>
          </div>

          {content?.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {content?.tags?.slice(0, 3)?.map((tag, i) => (
                <motion.span key={i} whileHover={{ scale: 1.05 }}
                  className="text-xs text-blue-300 bg-blue-500/15 border border-blue-500/30 px-3 py-1 rounded-full font-medium">
                  #{tag}
                </motion.span>
              ))}
              {content?.tags?.length > 3 && (
                <span className="text-xs text-gray-500 px-3 py-1">+{content?.tags?.length - 3}</span>
              )}
            </div>
          )}

          <div className="border-t border-gray-700/50 pt-4 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4 text-gray-400">
                <motion.button whileTap={{ scale: 1.25 }} onClick={handleLike}
                  className="flex items-center gap-1.5 hover:text-red-400 transition-colors">
                  <Heart className={`h-4 w-4 ${liked ? "text-red-500 fill-red-500" : ""}`} />
                  <span>{likes}</span>
                </motion.button>
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="h-4 w-4" />{content?.comments}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />{content?.collaborators}
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-gray-500">
                <Clock className="h-3 w-3" />{content?.timeAgo}
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handleBookmark}
                className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  bookmarked
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                    : "bg-white/5 text-gray-400 border border-gray-700/50 hover:border-blue-500/30 hover:text-white"
                }`}>
                <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
                Save
              </motion.button>

              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={e => {
                  e?.preventDefault?.(); e?.stopPropagation?.();
                  if (navigator?.share) {
                    navigator.share({ title: content?.title, text: content?.description, url: window.location.href });
                  } else { toast?.info?.("Share functionality not available"); }
                }}
                className="flex-1 py-2.5 px-3 rounded-lg bg-white/5 border border-gray-700/50 hover:border-blue-500/30 text-gray-400 hover:text-white font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2">
                <Share2 className="h-4 w-4" />Share
              </motion.button>
            </div>

            <div onClick={e => { e?.preventDefault?.(); e?.stopPropagation?.(); }}>
              <CollabButton content={content} accessToken={access_token} isOwnIdea={isOwnIdea} />
            </div>

            <div onClick={e => { e?.preventDefault?.(); e?.stopPropagation?.(); }}>
              <ConnectionButton userId={content?.author?.id || content?.creator?.id} size="sm" className="w-full" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}