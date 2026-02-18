import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const IMAGE_DURATION = 5000;
const VIDEO_DURATION = 30000;

const StoryViewerModal = ({ isOpen, stories, startIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(startIndex);
      setProgress(0);
    }
  }, [isOpen, startIndex]);
  
  const currentStory = stories[currentIndex];
  const duration =
    currentStory?.type === "video" ? VIDEO_DURATION : IMAGE_DURATION;

  useEffect(() => {
    if (!isOpen) return;

    setProgress(0);

    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min((elapsed / duration) * 100, 100));

      if (elapsed >= duration) {
        nextStory();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [currentIndex, isOpen]);

  const nextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md h-[80vh] bg-black rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-white transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Story Content */}
        {currentStory.type === "image" ? (
          <img
            src={currentStory.thumbnail}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            src={currentStory.thumbnail}
            autoPlay
            muted
            className="w-full h-full object-cover"
          />
        )}

        <div className="absolute inset-0 flex">
          <div className="w-1/2" onClick={prevStory} />
          <div className="w-1/2" onClick={nextStory} />
        </div>

        <button
          className="absolute top-4 left-4 text-white text-xl"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </div>,
    document.body
  );
};

export default StoryViewerModal;
