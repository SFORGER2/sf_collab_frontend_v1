import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Home, Search, Plus, User, Bell, X } from "lucide-react";
import { Button } from "../../ui/button";
import Stories from "./Stories";
import LeftSidebar from "./LeftSidebar";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";
import RightSidebar from "./RightSiderbar";
import { useSelector } from "react-redux";
import { postAPI } from "@/utils/APIs/postAPI";
import { userSocialAPI } from "@/utils/APIs/socialAPI";
import useSocket from "../chat/useSocket";
import PostsTutorial from "./PostsTutorial";
import { toast } from "react-toastify";

// ─── Settings Modal ────────────────────────────────────────────────────────────
const SettingsModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    theme: "dark",
    privacy: "public",
  });

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4">
          {[
            { key: "emailNotifications", label: "Email Notifications" },
            { key: "pushNotifications",  label: "Push Notifications"  },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
              <label className="text-white text-sm">{label}</label>
              <input
                type="checkbox"
                checked={settings[key]}
                onChange={() => setSettings((s) => ({ ...s, [key]: !s[key] }))}
                className="w-4 h-4 cursor-pointer"
              />
            </div>
          ))}
          <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
            <label className="text-white text-sm">Privacy</label>
            <select
              value={settings.privacy}
              onChange={(e) => setSettings((s) => ({ ...s, privacy: e.target.value }))}
              className="bg-zinc-700 text-white text-sm px-2 py-1 rounded"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
            <label className="text-white text-sm">Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => setSettings((s) => ({ ...s, theme: e.target.value }))}
              className="bg-zinc-700 text-white text-sm px-2 py-1 rounded"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <Button onClick={onClose} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
            Save Settings
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1 border-zinc-600 text-white hover:bg-zinc-800">
            Close
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Posts ─────────────────────────────────────────────────────────────────────
const Posts = () => {
  const { user: currentUser, access_token } = useSelector((state) => state.auth);
  const { socket, isConnected } = useSocket();

  const [socialProfile,    setSocialProfile]    = useState(null);
  const [activeTab,        setActiveTab]        = useState("feed");
  const [posts,            setPosts]            = useState([]);
  const [storiesRefreshKey, setStoriesRefreshKey] = useState(0);
  const [showScrollTop,    setShowScrollTop]    = useState(false);
  const [isSettingsOpen,   setIsSettingsOpen]   = useState(false);
  const [loading,          setLoading]          = useState(false);

  // ── Socket listeners ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on("new_post", (payload) => {
      // FIX: allow image/video-only posts (no caption required)
      if (payload && (payload.content !== undefined || payload.mediaUrl || payload.files?.length)) {
        const normalized = {
          ...payload,
          _id: payload._id || payload.id,
          id:  payload.id  || payload._id,
          author: payload.author || {},
        };
        setPosts((prev) => [normalized, ...prev]);
      }
    });

    socket.on("new_content", (payload) => {
      if (payload?.contentType === "story") {
        setStoriesRefreshKey((k) => k + 1);
      }
    });

    return () => {
      socket.off("new_post");
      socket.off("new_content");
    };
  }, [socket, isConnected]);

  // ── Social profile ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;

    const fetchSocialProfile = async () => {
      try {
        const response = await userSocialAPI.getSocialProfile(currentUser.id);
        // FIX: unwrap { success, data: { social } }
        setSocialProfile(response?.data?.social ?? response?.social ?? null);
      } catch (error) {
        const is404 =
          error?.response?.status === 404 ||
          error?.response?.data?.message?.includes("not found");

        if (is404) {
          try {
            await userSocialAPI.createSocialProfile(currentUser.id);
            const retry = await userSocialAPI.getSocialProfile(currentUser.id);
            setSocialProfile(retry?.data?.social ?? retry?.social ?? null);
          } catch (createErr) {
            console.error("Failed to create/fetch social profile:", createErr);
          }
        } else {
          console.error("Failed to fetch social profile:", error);
        }
      }
    };

    fetchSocialProfile();
  }, [currentUser]);

  // ── Fetch posts (feed or favorites) ──────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;

    const fetchPosts = async () => {
      setLoading(true);
      try {
        let posts = [];
        if (activeTab === "favorites") {
          // My Favorites = posts the user has liked
          const res = await userSocialAPI.getLikedPosts({ page: 1, per_page: 20 });
          posts = res?.data?.posts ?? res?.posts ?? [];
        } else {
          const response = await postAPI.getAll({ page: 1, per_page: 10 });
          posts = response?.data?.posts ?? response?.posts ?? [];
        }
        setPosts(posts);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentUser, access_token, activeTab]);

  // ── Scroll-to-top button ──────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Create post / story ───────────────────────────────────────────────────
  const handleCreatePost = async (postData) => {
    try {
      if (postData.destination === "story") {
        // ── Story ──────────────────────────────────────────────────────────
        const firstFile = postData.files?.[0]?.file;
        if (!firstFile) {
          toast.error("Please select a media file for your story.");
          return;
        }

        const formData = new FormData();
        formData.append("media",             firstFile);
        formData.append("type",              firstFile.type.startsWith("video/") ? "video" : "image");
        formData.append("caption",           postData.caption || "");
        formData.append("expires_at",        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());
        // NOTE: user_id / author_id are read from JWT on the backend; sending them
        // here is harmless but the backend will always use the JWT identity.

        await postAPI.createStory(formData);
        setStoriesRefreshKey((k) => k + 1);
        toast.success("Story posted!");

      } else {
        // ── Feed post ──────────────────────────────────────────────────────
        const postType =
          postData.type === "text" ? "professional" : postData.type || "professional";

        const formData = new FormData();
        formData.append("content", postData.caption || "");
        formData.append("type",    postType);
        if (postData.tags?.length) {
          formData.append("tags", JSON.stringify(postData.tags));
        }
        postData.files?.forEach(({ file }) => formData.append("media", file));

        const response = await postAPI.create(formData);

        // FIX: response shape from postAPI.create is the Flask JSON payload
        // (axios interceptor returns response.data).
        // Flask success_response: { success, message, data: { post } }
        const created = response?.data?.post ?? response?.post;

        if (created) {
          // Normalise id field — backend uses integer `id`
          const normalized = { ...created, id: created.id ?? created._id };
          // Prepend to feed so user sees it immediately without refresh
          setPosts((prev) => [normalized, ...prev]);
          toast.success("Post created!");
        } else {
          // Response came back but without post data — re-fetch to be safe
          console.warn("Post created but response had no post object; re-fetching.");
          const refetch = await postAPI.getAll({ page: 1, per_page: 10 });
          const posts   = refetch?.data?.posts ?? refetch?.posts ?? [];
          setPosts(posts);
          toast.success("Post created!");
        }
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error(
        error?.response?.data?.message || "Failed to post. Please try again."
      );
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen text-white w-full">
      <PostsTutorial />

      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        <div className="absolute top-1/4 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/3 -right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* 3-column grid */}
      <div className="relative w-full mx-auto px-3 py-6">
        <div className="grid grid-cols-12 gap-4">

          {/* Left sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-0 space-y-2">
              <LeftSidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onSettingsClick={() => setIsSettingsOpen(true)}
              />
            </div>
          </div>

          {/* Centre feed */}
          <div className="col-span-12 lg:col-span-6">
            <div className="space-y-6">
              {/* Tab bar */}
              <div className="feed flex gap-4 border-b border-zinc-800">
                {["feed", "explore"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-4 font-semibold capitalize transition-all ${
                      activeTab === tab
                        ? "text-blue-400 border-b-2 border-blue-400"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Stories */}
              {activeTab === "feed" && <Stories refreshKey={storiesRefreshKey} />}

              {/* Create Post */}
              {currentUser && activeTab === "feed" && (
                <CreatePost currentUser={currentUser} onPost={handleCreatePost} />
              )}

              {/* Posts */}
              <div className="space-y-6">
                {loading ? (
                  <div className="text-center py-8 text-zinc-400">Loading posts...</div>
                ) : posts.length > 0 ? (
                  posts.map((post, index) => (
                    <motion.div
                      key={post.id ?? post._id ?? index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <PostCard
                        post={post}
                        onPostDeleted={(postId) =>
                          setPosts((prev) =>
                            prev.filter((p) => p.id !== postId && p._id !== postId)
                          )
                        }
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-zinc-400 text-lg">
                      {activeTab === "feed"
                        ? "No posts yet. Be the first to post!"
                        : "No posts available."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-0 space-y-2">
              <RightSidebar socialProfile={socialProfile} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800/50 md:hidden">
        <div className="flex justify-around items-center p-3">
          <Button variant="ghost" size="icon" onClick={() => setActiveTab("feed")}><Home size={24} /></Button>
          <Button variant="ghost" size="icon" onClick={() => setActiveTab("explore")}><Search size={24} /></Button>
          <Button variant="ghost" size="icon"><Plus size={24} /></Button>
          <Button variant="ghost" size="icon"><Bell size={24} /></Button>
          <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}><User size={24} /></Button>
        </div>
      </div>

      {/* Scroll-to-top FAB */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-20 right-8 z-50"
          >
            <Button
              size="icon"
              className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/50"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <ArrowUp size={20} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Posts;