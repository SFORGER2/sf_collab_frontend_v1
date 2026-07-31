import React, { useState } from "react";
import { toast } from "react-toastify";

export default function MessageActions({ content, onRetry }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Response copied to clipboard", {
      position: "bottom-right",
      autoClose: 2000,
      theme: "dark",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type) => {
    if (feedback === type) {
      setFeedback(null);
    } else {
      setFeedback(type);
      toast.info(
        type === "like"
          ? "Thank you for your positive feedback!"
          : "Feedback recorded. We'll improve future responses.",
        {
          position: "bottom-right",
          autoClose: 2000,
          theme: "dark",
        }
      );
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Qwen AI Response",
        text: content,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(content);
      toast.success("Shareable content copied to clipboard", {
        position: "bottom-right",
        autoClose: 2000,
        theme: "dark",
      });
    }
  };

  return (
    <div className="flex items-center gap-1 mt-1.5 pt-0.5 border-0 text-[#6F7B90] font-mono text-ai-subtext select-none">
      <button
        onClick={handleCopy}
        className="flex items-center gap-1 h-7 btn-ai-sm px-2 py-0.5 radius-ai-sm hover:bg-[#1D2636] hover:text-[#F7F8FA] focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none transition-all cursor-pointer active:scale-95"
        title="Copy response"
        aria-label="Copy response"
      >
        <span className="material-symbols-outlined icon-ai-sm">
          {copied ? "check" : "content_copy"}
        </span>
        <span className="text-ai-caption font-sans">{copied ? "Copied" : "Copy"}</span>
      </button>

      <button
        onClick={() => handleFeedback("like")}
        className={`w-7 h-7 btn-ai-sm flex items-center justify-center radius-ai-sm focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none transition-all cursor-pointer active:scale-95 ${
          feedback === "like"
            ? "bg-[#3DDC97]/10 text-[#3DDC97]"
            : "hover:bg-[#1D2636] hover:text-[#F7F8FA]"
        }`}
        title="Good response"
        aria-label="Good response"
      >
        <span
          className="material-symbols-outlined icon-ai-sm"
          style={{ fontVariationSettings: feedback === "like" ? "'FILL' 1" : undefined }}
        >
          thumb_up
        </span>
      </button>

      <button
        onClick={() => handleFeedback("dislike")}
        className={`w-7 h-7 btn-ai-sm flex items-center justify-center radius-ai-sm focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none transition-all cursor-pointer active:scale-95 ${
          feedback === "dislike"
            ? "bg-[#FF6B6B]/10 text-[#FF6B6B]"
            : "hover:bg-[#1D2636] hover:text-[#F7F8FA]"
        }`}
        title="Poor response"
        aria-label="Poor response"
      >
        <span
          className="material-symbols-outlined icon-ai-sm"
          style={{ fontVariationSettings: feedback === "dislike" ? "'FILL' 1" : undefined }}
        >
          thumb_down
        </span>
      </button>

      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 h-7 btn-ai-sm px-2 py-0.5 radius-ai-sm hover:bg-[#1D2636] hover:text-[#F7F8FA] focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none transition-all cursor-pointer active:scale-95"
          title="Regenerate response"
          aria-label="Regenerate response"
        >
          <span className="material-symbols-outlined icon-ai-sm">refresh</span>
          <span className="text-ai-caption font-sans">Retry</span>
        </button>
      )}

      <button
        onClick={handleShare}
        className="w-7 h-7 btn-ai-sm flex items-center justify-center radius-ai-sm hover:bg-[#1D2636] hover:text-[#F7F8FA] focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none transition-all cursor-pointer active:scale-95 ml-auto"
        title="Share response"
        aria-label="Share response"
      >
        <span className="material-symbols-outlined icon-ai-sm">share</span>
      </button>
    </div>
  );
}
