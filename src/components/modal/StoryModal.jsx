import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Upload, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { postAPI } from "@/utils/APIs/postAPI";
import { useSelector } from "react-redux";

const StoryModal = ({ isOpen, onClose }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePostStory = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("media", selectedFile);
      formData.append("type", selectedFile.type.startsWith("video/") ? "video" : "image");
      formData.append("user_id", user.id);
      formData.append("author_id", user.id);
      formData.append("author_first_name", user.firstName);
      formData.append("author_last_name", user.lastName);
      formData.append("expires_at", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());

      await postAPI.createStory(formData);

      toast.success("Story posted successfully!");
      handleRemoveFile();
      onClose();
    } catch (error) {
      console.error("Failed to post story:", error);
      toast.error("Failed to post story. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 rounded-xl shadow-2xl w-11/12 max-w-sm p-8 relative overflow-hidden"
          >
            <motion.button
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X size={20} />
            </motion.button>

            <h2 className="text-2xl font-bold mb-6 text-white">Create Story</h2>

            <AnimatePresence mode="wait">
              {!selectedFile ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={handleUploadClick}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-12 cursor-pointer hover:border-blue-400 hover:bg-gray-800/30 transition text-gray-400"
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Upload className="w-10 h-10 mb-3 text-blue-400" />
                  </motion.div>
                  <span className="text-center">Upload image or video</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center gap-4"
                >
                  <motion.div
                    layoutId="preview"
                    className="relative rounded-lg overflow-hidden"
                  >
                    {selectedFile.type.startsWith("image/") && (
                      <img
                        src={previewUrl}
                        alt={selectedFile.name}
                        className="w-40 h-40 object-cover"
                      />
                    )}
                    {selectedFile.type.startsWith("video/") && (
                      <video
                        src={previewUrl}
                        className="w-40 h-40 object-cover"
                      />
                    )}
                  </motion.div>
                  <p className="text-gray-300 text-sm truncate w-40 text-center">
                    {selectedFile.name}
                  </p>
                  <div className="flex gap-3 w-full">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isUploading}
                      onClick={handleRemoveFile}
                      className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Remove
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isUploading}
                      onClick={handlePostStory}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Posting...
                        </>
                      ) : (
                        "Post"
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default StoryModal;
