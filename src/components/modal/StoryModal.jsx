import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Upload, Loader2 } from "lucide-react";
import { userSocialAPI } from "@/utils/APIs/socialAPI";

const StoryModal = ({ isOpen, onClose }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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

      await userSocialAPI.createStory(formData);

      // Reset and close
      handleRemoveFile();
      onClose();
    } catch (error) {
      console.error("Failed to post story:", error);
      alert("Failed to post story. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-lg shadow-lg w-11/12 max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute top-3 left-3 text-gray-500 hover:text-gray-200"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4 text-white">Upload Story</h2>

        {!selectedFile ? (
          // Upload box
          <div
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-500 rounded-lg p-10 cursor-pointer hover:border-blue-400 transition text-gray-400"
            onClick={handleUploadClick}
          >
            <Upload className="w-8 h-8 mb-2" />
            <span>Upload image or video</span>
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
        ) : (
          // Preview box
          <div className="flex flex-col items-center gap-2">
            {selectedFile.type.startsWith("image/") && (
              <img
                src={previewUrl}
                alt={selectedFile.name}
                className="w-48 h-48 object-cover rounded-md"
              />
            )}
            {selectedFile.type.startsWith("video/") && (
              <video
                src={previewUrl}
                controls
                className="w-48 h-48 object-cover rounded-md"
              />
            )}
            <p className="text-white font-medium truncate w-48 text-center">
              {selectedFile.name}
            </p>
            <div className="flex gap-4">
              <button
                disabled={isUploading}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 disabled:bg-gray-800 disabled:cursor-not-allowed"
                onClick={handleRemoveFile}
              >
                Remove
              </button>
              <button
                disabled={isUploading}
                className="px-4 py-2 bg-gradient-to-br from-gray-600 to-blue-800 text-white rounded hover:from-blue-800 hover:to-gray-600 disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={handlePostStory}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default StoryModal;
