import React, { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import { SOCKET_API_URL } from "@/utils/config";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  ChevronRight,
  ArrowUp,
  Home,
  Search,
  Plus,
  User,
  Bell,
  X,
} from "lucide-react";
import { Button } from "../../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";
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

const ShinyText = ({ children, className = "" }) => {
  return (
    <span
      className={`inline-block bg-gradient-to-r from-white via-blue-300 to-white bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%] ${className}`}
    >
      {children}
    </span>
  );
};

// Settings Modal Component
const SettingsModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    theme: "dark",
    privacy: "public",
  });

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

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
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
            <label className="text-white text-sm">Email Notifications</label>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={() => handleToggle("emailNotifications")}
              className="w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
            <label className="text-white text-sm">Push Notifications</label>
            <input
              type="checkbox"
              checked={settings.pushNotifications}
              onChange={() => handleToggle("pushNotifications")}
              className="w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
            <label className="text-white text-sm">Privacy</label>
            <select
              value={settings.privacy}
              onChange={(e) =>
                setSettings({ ...settings, privacy: e.target.value })
              }
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
              onChange={(e) =>
                setSettings({ ...settings, theme: e.target.value })
              }
              className="bg-zinc-700 text-white text-sm px-2 py-1 rounded"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            onClick={onClose}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Settings
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-zinc-600 text-white hover:bg-zinc-800"
          >
            Close
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Posts = () => {
  const { user: currentUser, access_token } = useSelector((state) => state.auth);
  const { socket, isConnected } = useSocket();
  const [socialProfile, setSocialProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("feed");
  const [posts, setPosts] = useState([]);
  const [storiesRefreshKey, setStoriesRefreshKey] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (socket && isConnected) {
      socket.on("new_post", (payload) => {
        if (payload && (payload.content !== undefined || payload.mediaUrl)) {
          const normalized = {
            ...payload,
            _id: payload._id || payload.id,
            id: payload.id || payload._id,
            author: payload.author || {},
          };
          setPosts((prev) => [normalized, ...prev]);
        }
      });

      socket.on("new_content", (payload) => {
        if (payload && payload.contentType === "story") {
          setStoriesRefreshKey((k) => k + 1);
        }
      });
    }

    return () => {
      socket?.off("new_post");
      socket?.off("new_content");
    };
  }, [socket, isConnected]);

  useEffect(() => {
    const fetchSocialProfile = async () => {
      try {
        const response = await userSocialAPI.getSocialProfile(currentUser.id);
        setSocialProfile(response.social);
      } catch (error) {
        const isNotFound =
          error?.message === "User social profile not found" ||
          error?.error === "User social profile not found" ||
          error?.response?.status === 404 ||
          error?.response?.data?.message === "User social profile not found";
        if (isNotFound) {
          try {
            await userSocialAPI.createSocialProfile();
            const retry = await userSocialAPI.getSocialProfile(currentUser.id);
            setSocialProfile(retry.social);
          } catch (createErr) {
            console.error("Failed to create/fetch social profile:", createErr);
          }
        } else {
          console.error("Failed to fetch social profile:", error);
        }
      }
    };
    if (currentUser) {
      fetchSocialProfile();
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await postAPI.getAll({
          page: 1,
          per_page: 10,
          current_user_id: currentUser?.id,
        });
        // Flask backend returns: { success, message, data: { posts, pagination } }
        const data = response?.data;
        setPosts(data?.posts || []);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) {
      fetchPosts();
    }
  }, [currentUser, access_token]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCreatePost = async (postData) => {
    try {
      if (postData.destination === "story") {
        const firstFile = postData.files?.[0]?.file;
        if (!firstFile) {
          console.error("No media file selected for story.");
          return;
        }

        const formData = new FormData();
        formData.append("media", firstFile);
        formData.append("type", firstFile.type.startsWith("video/") ? "video" : "image");
        formData.append("user_id", currentUser.id);
        formData.append("author_id", currentUser.id);
        formData.append(
          "author_first_name",
          currentUser.firstName || currentUser.first_name
        );
        formData.append(
          "author_last_name",
          currentUser.lastName || currentUser.last_name
        );
        formData.append("caption", postData.caption);
        formData.append(
          "expires_at",
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        );

        await postAPI.createStory(formData);
        setStoriesRefreshKey((k) => k + 1);
      } else {
        // Build FormData so media files are included as multipart/form-data
        const postType = postData.type === "text" ? "professional" : (postData.type || "professional");
        const formData = new FormData();
        formData.append("user_id", currentUser.id);
        formData.append("author_id", currentUser.id);
        formData.append("author_first_name", currentUser.firstName || currentUser.first_name);
        formData.append("author_last_name", currentUser.lastName || currentUser.last_name);
        formData.append("content", postData.caption);
        formData.append("type", postType);
        if (postData.tags?.length) {
          formData.append("tags", JSON.stringify(postData.tags));
        }
        // Append each selected media file
        postData.files?.forEach(({ file }) => {
          formData.append("media", file);
        });

        const response = await postAPI.create(formData);
        const created = response?.data?.post;
        if (created) {
          const normalized = { ...created, id: created._id || created.id };
          setPosts((prev) => [normalized, ...prev]);
        }
      }
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };


  return (
    <div className="min-h-screen text-white w-full">
      {/* Animated Background */}
      <PostsTutorial />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        <div className="absolute top-1/4 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute top-1/3 -right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Main 3-Cell Grid Layout */}
      <div className="relative w-full mx-auto px-3 py-6">
        <div className="grid grid-cols-12 gap-4">
          {/* ---- LEFT SIDEBAR ---- */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-0 space-y-2">
              <LeftSidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onSettingsClick={() => setIsSettingsOpen(true)}
              />
            </div>
          </div>

          {/* ---- CENTER FEED ---- */}
          <div className="col-span-12 lg:col-span-6">
            <div className="space-y-6">
              {/* Tab Headers */}
              <div className="feed flex gap-4 border-b border-zinc-800">
                <button
                  onClick={() => setActiveTab("feed")}
                  className={`py-2 px-4 font-semibold transition-all ${activeTab === "feed"
                      ? "text-blue-400 border-b-2 border-blue-400"
                      : "text-zinc-400 hover:text-white"
                    }`}
                >
                  Feed
                </button>
                <button
                  onClick={() => setActiveTab("explore")}
                  className={`py-2 px-4 font-semibold transition-all ${activeTab === "explore"
                      ? "text-blue-400 border-b-2 border-blue-400"
                      : "text-zinc-400 hover:text-white"
                    }`}
                >
                  Explore
                </button>
              </div>

              {/* Stories */}
              {activeTab === "feed" && <Stories refreshKey={storiesRefreshKey} />}

              {/* Create Post */}
              {currentUser && activeTab === "feed" && (
                <CreatePost currentUser={currentUser} onPost={handleCreatePost} />
              )}

              {/* Posts Feed */}
              <div className="space-y-6">
                {loading ? (
                  <div className="text-center py-8 text-zinc-400">
                    Loading posts...
                  </div>
                ) : posts.length > 0 ? (
                  posts.map((post, index) => (
                    <motion.div
                      key={post._id || post.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <PostCard
                        post={post}
                        onPostDeleted={(postId) => {
                          setPosts((prev) =>
                            prev.filter(
                              (p) => p.id !== postId && p._id !== postId
                            )
                          );
                        }}
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

          {/* ---- RIGHT SIDEBAR ---- */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-0 space-y-2">
              <RightSidebar socialProfile={socialProfile} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800/50 md:hidden">
        <div className="flex justify-around items-center p-3">
          <Button variant="ghost" size="icon" onClick={() => setActiveTab("feed")}>
            <Home size={24} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setActiveTab("explore")}>
            <Search size={24} />
          </Button>
          <Button variant="ghost" size="icon">
            <Plus size={24} />
          </Button>
          <Button variant="ghost" size="icon">
            <Bell size={24} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
            <User size={24} />
          </Button>
        </div>
      </div>

      {/* Floating Action Button */}
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
