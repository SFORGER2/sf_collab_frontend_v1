import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ShinyText from "@/components/ui/ShinyText";
import { Textarea } from "@/components/ui/textarea";
import { AnimatePresence, motion } from "framer-motion";
import { ImageIcon, Sparkles, Video, X, Loader2, AlertCircle } from "lucide-react";
import { useRef, useState } from "react";
import { useDraft, useModalDraftGuard } from "@/utils/hooks/useDraft";
import MultiImageGrid from "./MultiImageGrid";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getProfilePicture } from "@/utils/getProfilePicture";

export default function CreatePost({ currentUser, onPost }) {
  // B5 FIX: auto-save post draft to localStorage
  const [{ caption }, setDraftForm, clearPostDraft, hasPostDraft] = useDraft("create_post", { caption: "" });
  const setCaption = (val) => setDraftForm(prev => ({ ...prev, caption: val }));
  const [files,          setFiles]          = useState([]);   // [{ file: File, url: string }]
  const [fileType,       setFileType]       = useState(null);
  const [destination,    setDestination]    = useState("feed"); // "feed" | "story"
  const [isUploading,    setIsUploading]    = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error,          setError]          = useState(null);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // FIX: `if (!currentUser) return null` was placed AFTER useState/useRef hooks
  // but BEFORE the JSX return, which means on some renders React would call fewer
  // hooks than others → "Rendered fewer hooks than expected" crash.
  // Moved the guard to wrap the JSX output instead (hooks always run).

  const handleFileChange = (e, type) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;
    const mapped = selectedFiles.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setFiles((prev) => [...prev, ...mapped]);
    setFileType(type);
    setError(null);
  };

  const removeFile  = (index) => setFiles((prev) => prev.filter((_, i) => i !== index));
  const removeAllFiles = () => {
    setFiles([]);
    setFileType(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handlePost = async () => {
    setError(null);

    // Validation
    if (!caption.trim() && !files.length) return;

    // FIX: story requires at least one media file — give user clear feedback
    if (destination === "story" && !files.length) {
      setError("Please select a photo or video for your story.");
      return;
    }

    const postType = files.length > 1 ? "image" : fileType || "text";
    let progressInterval = null;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulated progress — gives the user visual feedback while the real upload runs
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 20, 85));
      }, 300);

      await onPost(
        { caption, files, type: postType, isMultiImage: files.length > 1, destination },
        (progress) => setUploadProgress(Math.round(progress * 100))
      );

      // Upload succeeded
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Reset form after a short delay so the 100% flash is visible
      setTimeout(() => {
        setCaption("");
        setFiles([]);
        setFileType(null);
        setIsUploading(false);
        setUploadProgress(0);
        if (imageInputRef.current) imageInputRef.current.value = "";
        if (videoInputRef.current) videoInputRef.current.value = "";
      }, 600);

    } catch (err) {
      // FIX: original never cleared the interval on error, leaving it running forever
      if (progressInterval) clearInterval(progressInterval);
      console.error("Failed to post:", err);
      setIsUploading(false);
      setUploadProgress(0);
      setError("Failed to post. Please try again.");
    }
  };

  // Guard here so hooks above always run in the same order
  if (!currentUser) return null;

  const isStory       = destination === "story";
  const canSubmit     = (caption.trim() || files.length > 0) && !isUploading;
  const storyNeedsFile = isStory && !files.length;

  return (
    <Card className="create-post bg-zinc-900/50 backdrop-blur-xl border-zinc-800/50 shadow-xl overflow-hidden">
      <CardHeader>
        <h2 className="text-lg font-bold">
          <ShinyText>Create Post</ShinyText>
        </h2>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Author + caption */}
        <div className="flex gap-4">
          <Avatar className="w-10 h-10 ring-2 ring-blue-400/50">
            <AvatarImage src={getProfilePicture(currentUser)} />
            <AvatarFallback>
              {currentUser.first_name?.charAt(0) || currentUser.firstName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={
              isStory
                ? "Add a caption for your story (optional)..."
                : "What's on your mind?"
            }
            className="flex-1 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none min-h-[80px]"
          />
        </div>

        {/* File previews */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-400">
                  {files.length} {files.length === 1 ? "file" : "files"} selected
                </p>
                <Button
                  onClick={removeAllFiles}
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-red-400 text-xs"
                >
                  Remove all
                </Button>
              </div>

              {files.length === 1 ? (
                <div className="relative rounded-xl overflow-hidden">
                  {fileType === "image" ? (
                    <img
                      src={files[0].url}
                      alt="Preview"
                      className="max-h-80 w-full object-contain rounded-xl"
                    />
                  ) : (
                    <video
                      src={files[0].url}
                      controls
                      className="max-h-80 w-full rounded-xl"
                    />
                  )}
                  <Button
                    onClick={() => removeFile(0)}
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 backdrop-blur-sm"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <MultiImageGrid
                  images={files.map((f) => f.url)}
                  onImageClick={(img) => console.log("Preview:", img)}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
            >
              <AlertCircle size={14} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <Separator className="bg-zinc-800/50" />

        {/* Upload progress */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-400">
                  {isStory ? "Uploading story..." : "Posting..."}
                </p>
                <p className="text-xs text-zinc-400">{uploadProgress}%</p>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action bar */}
        <div className="flex justify-between items-center">
          {/* Media pickers */}
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => imageInputRef.current?.click()}
                    className="text-zinc-400 hover:text-green-400 hover:bg-green-500/10"
                  >
                    <ImageIcon size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add Images</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => videoInputRef.current?.click()}
                    className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Video size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add Video</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Destination picker */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-400">Post to</span>
            <select
              value={destination}
              onChange={(e) => { setDestination(e.target.value); setError(null); }}
              className="bg-zinc-800 text-white text-sm px-2 py-1 rounded"
            >
              <option value="feed">Feed</option>
              <option value="story">Story</option>
            </select>
          </div>

          {/* Submit */}
          <Button
            onClick={handlePost}
            disabled={!canSubmit || storyNeedsFile}
            className="bg-gradient-to-br from-violet-600 via-blue-600 to-blue-500 text-white hover:from-violet-700 hover:via-blue-700 hover:to-blue-600 hover:cursor-pointer disabled:bg-[var(--muted)] disabled:text-[var(--color-dim)] gap-2 group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {isStory ? "Uploading..." : "Posting..."}
                </>
              ) : (
                <>
                  <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
                  {isStory ? "Share Story" : "Post"}
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity bg-[length:200%_100%] animate-shimmer" />
          </Button>
        </div>

        {/* Story hint */}
        {isStory && !files.length && (
          <p className="text-xs text-amber-400/80 text-center">
            ↑ Select a photo or video above to post as a Story
          </p>
        )}

        {/* Hidden file inputs */}
        <input
          type="file"
          ref={imageInputRef}
          className="hidden"
          accept="image/*"
          multiple
          onChange={(e) => handleFileChange(e, "image")}
        />
        <input
          type="file"
          ref={videoInputRef}
          className="hidden"
          accept="video/*"
          onChange={(e) => handleFileChange(e, "video")}
        />
      </CardContent>
    </Card>
  );
}