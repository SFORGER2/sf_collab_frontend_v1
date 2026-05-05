// src/components/pages/meet/panels/FilePanel.jsx
import React, { useEffect, useState } from "react";
import { ExternalLink, Paperclip, X } from "lucide-react";
import { meetAPI } from "@/utils/APIs/meetAPI";

const TYPE_ICONS = {
  recording:  "🎥",
  transcript: "📝",
  summary:    "📋",
  notes:      "📄",
  whiteboard: "🖼",
  annotation: "✏️",
  screenshot: "🖼",
  default:    "📁",
};

export default function FilePanel({ meetingId }) {
  const [files, setFiles]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [driveId, setDriveId] = useState("");
  const [attaching, setAttaching] = useState(false);

  useEffect(() => { fetchFiles(); }, [meetingId]);

  async function fetchFiles() {
    setLoading(true);
    try {
      const res = await meetAPI.getFiles(meetingId);
      setFiles(res.data?.files || res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function attachFile() {
    if (!driveId.trim()) return;
    setAttaching(true);
    try {
      const res = await meetAPI.attachFile(meetingId, {
        drive_file_id: driveId.trim(),
        artifact_type: "notes",
      });
      setFiles(prev => [...prev, res.data?.file || res.data]);
      setDriveId("");
    } catch (e) { console.error(e); }
    finally { setAttaching(false); }
  }

  async function openFile(file) {
    try {
      await meetAPI.openFile(meetingId, file.id);
      if (file.drive_file_id && !file.drive_file_id.startsWith("local:")) {
        window.open(file.drive_file_id, "_blank");
      }
    } catch (e) { console.error(e); }
  }

  async function detachFile(file) {
    try {
      await meetAPI.detachFile(meetingId, file.id);
      setFiles(prev => prev.filter(f => f.id !== file.id));
    } catch (e) { console.error(e); }
  }

  return (
    <div className="flex flex-col h-full">
      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: "none" }}>
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-14 bg-zinc-900 rounded-xl animate-pulse border border-zinc-800" />
          ))
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-lg">📁</div>
            <p className="text-xs text-zinc-600">No files attached yet</p>
            <p className="text-[10px] text-zinc-700">Paste a Drive file ID below to attach</p>
          </div>
        ) : (
          files.map(f => (
            <div key={f.id}
              className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800
                rounded-xl group hover:border-zinc-700 transition-colors">
              <span className="text-lg flex-shrink-0">
                {TYPE_ICONS[f.artifact_type] || TYPE_ICONS.default}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-200 font-medium capitalize truncate">
                  {f.artifact_type?.replace(/_/g, " ")}
                </p>
                <p className="text-[10px] text-zinc-500 truncate">{f.drive_file_id}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openFile(f)}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                  title="Open file"
                >
                  <ExternalLink size={12} />
                </button>
                <button
                  onClick={() => detachFile(f)}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-colors"
                  title="Detach file"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Attach input */}
      <div className="p-3 border-t border-zinc-900 flex-shrink-0">
        <p className="text-[10px] text-zinc-600 mb-2">Attach a file from SF Drive</p>
        <div className="flex gap-2">
          <input
            value={driveId}
            onChange={e => setDriveId(e.target.value)}
            onKeyDown={e => e.key === "Enter" && attachFile()}
            placeholder="Paste Drive file ID..."
            className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs
              text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
          />
          <button
            onClick={attachFile}
            disabled={attaching || !driveId.trim()}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700
              rounded-xl text-xs text-zinc-300 disabled:opacity-50 transition-colors"
          >
            <Paperclip size={11} />
            {attaching ? "..." : "Attach"}
          </button>
        </div>
      </div>
    </div>
  );
}