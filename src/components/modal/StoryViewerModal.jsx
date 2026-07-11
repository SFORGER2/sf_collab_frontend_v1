/**
 * StoryViewerModal.jsx — fixed with getMediaUrl/getAvatarUrl
 */
import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Eye, X, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useSelector } from "react-redux";
import { postAPI } from "@/utils/APIs/postAPI";
import { toast } from "react-toastify";
import { getAvatarUrl, getMediaUrl } from "@/utils/getMediaUrl";  // CHANGED

const IMAGE_DURATION = 5000;
const VIDEO_DURATION = 30000;

const StoryViewerModal = ({ isOpen, stories = [], startIndex = 0, onClose }) => {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const [currentIndex,  setCurrentIndex]  = useState(startIndex);
  const [progress,      setProgress]      = useState(0);
  const [viewers,       setViewers]       = useState([]);
  const [showViewers,   setShowViewers]   = useState(false);
  const intervalRef = useRef(null);
  const startRef    = useRef(null);

  const currentStory = stories[currentIndex];
  const duration = currentStory?.type === "video" ? VIDEO_DURATION : IMAGE_DURATION;

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(startIndex);
      setProgress(0);
      setShowViewers(false);
    }
  }, [isOpen, startIndex]);

  useEffect(() => {
    if (!isOpen || !currentStory) return;

    postAPI.viewStory(currentStory.id).catch(() => {});

    const storyOwnerId = String(currentStory.userId ?? currentStory.user_id);
    const myId         = String(user?.id ?? "");

    if (myId && storyOwnerId === myId) {
      postAPI.getStoryViewers(currentStory.id)
        .then((res) => {
          const raw = res?.data?.viewers ?? res?.viewers ?? [];
          const others = raw.filter((v) => {
            const vid = String(v.user_id ?? v.userId ?? v.id ?? "");
            return vid !== myId;
          });
          setViewers(others);
        })
        .catch(() => setViewers([]));
    } else {
      setViewers([]);
      setShowViewers(false);
    }
  }, [isOpen, currentStory?.id]);

  const startTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    setProgress(0);
    startRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (elapsed >= duration) {
        clearInterval(intervalRef.current);
        setCurrentIndex((prev) => {
          if (prev < stories.length - 1) return prev + 1;
          onClose();
          return prev;
        });
      }
    }, 50);
  }, [duration, stories.length, onClose]);

  useEffect(() => {
    if (!isOpen || !currentStory) {
      clearInterval(intervalRef.current);
      return;
    }
    startTimer();
    return () => clearInterval(intervalRef.current);
  }, [isOpen, currentIndex, startTimer]);

  const goNext = (e) => {
    e?.stopPropagation();
    if (currentIndex < stories.length - 1) setCurrentIndex((p) => p + 1);
    else onClose();
  };
  const goPrev = (e) => {
    e?.stopPropagation();
    if (currentIndex > 0) setCurrentIndex((p) => p - 1);
  };

  const handleAuthorClick = (e) => {
    e.stopPropagation();
    const uid = currentStory?.userId ?? currentStory?.user_id;
    if (uid && String(uid) !== String(user?.id)) {
      onClose();
      navigate(`/user-profile?userId=${uid}`);
    }
  };

  const handleViewerClick = (e, viewer) => {
    e.stopPropagation();
    const uid = viewer.user_id ?? viewer.userId ?? viewer.id;
    if (uid) {
      onClose();
      navigate(`/user-profile?userId=${uid}`);
    }
  };

  const handleDeleteStory = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this story?")) return;
    try {
      await postAPI.deleteStory(currentStory.id);
      toast.success("Story deleted");
      onClose();
    } catch (err) {
      console.error("Failed to delete story:", err);
      toast.error("Failed to delete story");
    }
  };

  if (!isOpen || !currentStory) return null;

  const isOwnStory = user &&
    String(currentStory.userId ?? currentStory.user_id) === String(user.id);

  // FIX: Use getMediaUrl for the media source
  const mediaSrc = getMediaUrl(
    currentStory.thumbnail ?? currentStory.mediaUrl ?? currentStory.media_url
  );

  const authorFirstName = currentStory.author?.firstName ?? currentStory.author_first_name ?? "";
  const authorLastName  = currentStory.author?.lastName  ?? currentStory.author_last_name  ?? "";
  const authorName      = [authorFirstName, authorLastName].filter(Boolean).join(" ") ||
                          currentStory.name || "User";
  const authorAvatar    = currentStory.avatar ??
                          currentStory.author?.profilePicture ??
                          currentStory.author?.profile_picture ??
                          getAvatarUrl(currentStory.author);

  return createPortal(
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm h-[85vh] bg-black rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{
                  width: i < currentIndex ? "100%"
                       : i === currentIndex ? `${progress}%`
                       : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header: author + close */}
        <div className="absolute top-5 left-0 right-0 z-20 flex items-center justify-between px-3 pt-3">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleAuthorClick}
          >
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white/50"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center ring-2 ring-white/50">
                <span className="text-white text-sm font-bold">{authorName[0]}</span>
              </div>
            )}
            <div>
              <p className="text-white text-sm font-semibold leading-tight drop-shadow">
                {authorName}
              </p>
              {currentStory.caption && (
                <p className="text-white/70 text-xs truncate max-w-[180px]">
                  {currentStory.caption}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOwnStory && (
              <button
                onClick={handleDeleteStory}
                className="text-white/60 hover:text-red-400 transition"
                title="Delete story"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button onClick={onClose} className="text-white/80 hover:text-white transition">
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Media */}
        {currentStory.type === "video" ? (
          <video
            key={currentStory.id}
            src={mediaSrc}
            autoPlay muted playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            key={currentStory.id}
            src={mediaSrc}
            alt={authorName}
            className="w-full h-full object-cover"
          />
        )}

        {/* Tap zones */}
        <div className="absolute inset-0 flex z-10">
          <div className="w-1/2 h-full cursor-pointer" onClick={goPrev} />
          <div className="w-1/2 h-full cursor-pointer" onClick={goNext} />
        </div>

        {/* Nav arrows */}
        <button
          onClick={goPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 text-white/60 hover:text-white transition opacity-0 hover:opacity-100"
        >
          <ChevronLeft size={28} />
        </button>
        <button
          onClick={goNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-white/60 hover:text-white transition opacity-0 hover:opacity-100"
        >
          <ChevronRight size={28} />
        </button>

        {/* Viewer list — own stories only, excludes self */}
        {isOwnStory && (
          <div className="absolute bottom-4 left-0 right-0 z-20 px-4">
            <button
              onClick={(e) => { e.stopPropagation(); setShowViewers((v) => !v); }}
              className="flex items-center gap-2 text-white/80 hover:text-white text-sm transition"
            >
              <Eye size={16} />
              <span>{viewers.length} viewer{viewers.length !== 1 ? "s" : ""}</span>
            </button>

            {showViewers && (
              <div
                className="mt-2 bg-zinc-900/95 border border-zinc-700 rounded-xl p-3 max-h-[200px] overflow-y-auto space-y-2"
                onClick={(e) => e.stopPropagation()}
              >
                {viewers.length === 0 ? (
                  <p className="text-zinc-400 text-sm text-center py-2">No viewers yet</p>
                ) : (
                  viewers.map((v, i) => {
                    const uid = v.user_id ?? v.userId ?? v.id ?? i;
                    const vFirst = v.firstName ?? v.first_name ?? v.user?.firstName ?? v.user?.first_name ?? "";
                    const vLast  = v.lastName  ?? v.last_name  ?? v.user?.lastName  ?? v.user?.last_name  ?? "";
                    const vName  = [vFirst, vLast].filter(Boolean).join(" ") || v.name || "User";
                    const vPic   = v.profilePicture ?? v.profile_picture ?? v.user?.profilePicture ?? v.avatar;
                    const vPicUrl = getMediaUrl(vPic);

                    return (
                      <div
                        key={uid}
                        className="flex items-center gap-2 rounded p-1.5 cursor-pointer hover:bg-zinc-800/60 transition"
                        onClick={(e) => handleViewerClick(e, v)}
                      >
                        {vPicUrl ? (
                          <img
                            src={vPicUrl}
                            alt={vName}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                            <span className="text-white text-xs font-bold">
                              {vName[0]?.toUpperCase() || "?"}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">{vName}</p>
                        </div>
                        {v.viewed_at && (
                          <span className="text-xs text-zinc-400 shrink-0">
                            {new Date(v.viewed_at).toLocaleTimeString([], {
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default StoryViewerModal;