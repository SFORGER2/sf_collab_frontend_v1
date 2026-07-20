import React, { useState } from "react";
import {
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Link as LinkIcon,
  Github,
  Globe,
  FileCode,
  PlayCircle,
  Plus,
} from "lucide-react";
import { cn } from "../../../../lib/utils";
import { Button } from "../../../ui/button";

const ProofUploader = ({ onUpload, className }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [payloadItems, setPayloadItems] = useState([]);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [linkInput, setLinkInput] = useState("");

  const getItemIcon = (item) => {
    if (item.type === "link") {
      const linkIcons = {
        github: <Github className="w-4 h-4 text-slate-300" />,
        design: <FileCode className="w-4 h-4 text-purple-400" />,
        video: <PlayCircle className="w-4 h-4 text-amber-400" />,
        web: <Globe className="w-4 h-4 text-blue-400" />,
      };
      return linkIcons[item.linkType] || linkIcons.web;
    }

    return item.fileType?.includes("image") ? (
      <ImageIcon className="w-4 h-4 text-blue-400" />
    ) : (
      <FileText className="w-4 h-4 text-slate-400" />
    );
  };

  const addSystemLink = () => {
    if (!linkInput.trim()) return;

    const url = linkInput.toLowerCase();
    const linkType = url.includes("github.com")
      ? "github"
      : url.includes("figma.com") || url.includes("adobe.com")
        ? "design"
        : url.includes("loom.com") || url.includes("youtube.com")
          ? "video"
          : "web";

    const newLink = {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      type: "link",
      name: linkInput,
      url: linkInput,
      linkType,
      status: "completed",
      progress: 100,
    };

    setPayloadItems((prev) => [...prev, newLink]);
    setLinkInput("");
  };

  const processFiles = (files) => {
    const newFiles = Array.from(files).map((file) => ({
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      type: "file",
      name: file.name,
      fileType: file.type,
      status: "pending",
      progress: 0,
      file: file,
    }));
    setPayloadItems((prev) => [...prev, ...newFiles]);
  };

  const beginTransmission = async () => {
    setIsTransmitting(true);
    const pendingFiles = payloadItems.filter(
      (item) => item.type === "file" && item.status === "pending",
    );

    const transmissionPromises = pendingFiles.map((file) => {
      return new Promise((resolve) => {
        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += Math.random() * 25;

          if (currentProgress >= 100) {
            currentProgress = 100;
            clearInterval(interval);
            setPayloadItems((current) =>
              current.map((item) =>
                item.id === file.id
                  ? { ...item, status: "completed", progress: 100 }
                  : item,
              ),
            );
            resolve();
          } else {
            setPayloadItems((current) =>
              current.map((item) =>
                item.id === file.id
                  ? { ...item, progress: currentProgress }
                  : item,
              ),
            );
          }
        }, 150);
      });
    });

    await Promise.all(transmissionPromises);
    setIsTransmitting(false);

    if (onUpload) {
      const finalPayload = payloadItems.map((item) =>
        item.type === "file" && item.status === "pending"
          ? { ...item, status: "completed", progress: 100 }
          : item,
      );
      onUpload(finalPayload);
    }
  };

  const removeItem = (id) =>
    setPayloadItems((prev) => prev.filter((i) => i.id !== id));

  return (
    <div className={cn("space-y-6", className)}>
      {/* Input: Signal Links */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
          Attach External Link
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSystemLink()}
              placeholder="GitHub, Figma, or Loom URL..."
              className="w-full h-11 pl-10 pr-4 bg-[#0F1423] border border-white/10 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button
            onClick={addSystemLink}
            className="w-11 h-11 bg-[#0F1423] border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/5"></span>
        </div>
        <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
          <span className="bg-[#151B2B] px-4 text-slate-600">
            Or Drop Files
          </span>
        </div>
      </div>

      {/* Zone: Drag and Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          processFiles(e.dataTransfer.files);
        }}
        className={cn(
          "relative border border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
          isDragging
            ? "border-blue-500 bg-blue-500/5 shadow-[0_0_30px_rgba(59,130,246,0.1)]"
            : "border-white/10 bg-[#0F1423]/50 hover:border-white/20",
        )}
      >
        <input
          type="file"
          multiple
          onChange={(e) => processFiles(e.target.files)}
          className="hidden"
          id="payload-upload"
        />

        <label
          htmlFor="payload-upload"
          className="cursor-pointer flex flex-col items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-slate-800/50 border border-white/5 flex items-center justify-center transition-transform hover:scale-105">
            <Upload className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-300">
              Upload Verification Files
            </p>
            <p className="text-xs text-slate-500">Max file size: 50MB</p>
          </div>
        </label>
      </div>

      {/* List: Staged Payload Items */}
      {payloadItems.length > 0 && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
            {payloadItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-[#0F1423] border border-white/5 rounded-lg group transition-colors hover:border-white/10"
              >
                <div className="w-8 h-8 rounded bg-[#151B2B] flex items-center justify-center border border-white/5 shrink-0">
                  {getItemIcon(item)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {item.name}
                    </p>
                    {item.status === "completed" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                  </div>

                  {item.status === "pending" && (
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-200 ease-out"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {item.status !== "completed" && (
                  <button
                    onClick={() => removeItem(item.id)}
                    className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-white/5 rounded transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Button
              onClick={beginTransmission}
              disabled={
                isTransmitting ||
                payloadItems.every((i) => i.status === "completed")
              }
              className="w-full h-11 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-medium rounded-lg shadow-lg shadow-blue-500/20 transition-all border border-blue-400/20 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
            >
              {isTransmitting ? "Uploading..." : "Submit Proof for Review"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProofUploader;
