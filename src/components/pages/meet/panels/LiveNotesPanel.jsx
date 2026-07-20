// src/components/pages/meet/panels/LiveNotesPanel.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Save } from "lucide-react";
import { meetAPI } from "@/utils/APIs/meetAPI";
import { useSelector } from "react-redux";

export default function LiveNotesPanel({ meetingId, socket, token }) {
  const { user }  = useSelector(s => s.auth);
  const [content, setContent]             = useState("");
  const [saving, setSaving]               = useState(false);
  const [savedAt, setSavedAt]             = useState(null);
  const [activeAuthors, setActiveAuthors] = useState([]);
  const versionRef = useRef(0);

  // Receive notes delta from other users via socket
  useEffect(() => {
    if (!socket) return;
    const onDelta = (data) => {
      if (String(data.meeting_id) !== String(meetingId)) return;
      if (String(data.user_id) === String(user?.id)) return;
      // Accept incoming text (last-write-wins)
      if (data.delta?.ops) {
        const text = data.delta.ops.map(op => op.insert || "").join("");
        if (text) setContent(text);
      }
      // Show active author
      setActiveAuthors(prev => {
        const exists = prev.find(a => a.user_id === data.user_id);
        if (exists) return prev;
        return [...prev, { user_id: data.user_id, name: data.name }];
      });
      setTimeout(() => {
        setActiveAuthors(prev => prev.filter(a => a.user_id !== data.user_id));
      }, 3000);
    };
    socket.on("meet_notes_delta", onDelta);
    return () => socket.off("meet_notes_delta", onDelta);
  }, [socket, meetingId, user?.id]);

  // Broadcast change to other participants
  const handleChange = useCallback((e) => {
    const val = e.target.value;
    setContent(val);
    versionRef.current += 1;
    if (socket) {
      socket.emit("meet_notes_change", {
        meeting_id: meetingId,
        delta:      { ops: [{ insert: val }] },
        version:    versionRef.current,
        doc_id:     null,
      });
    }
  }, [socket, meetingId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const timer = setInterval(handleSave, 30000);
    return () => clearInterval(timer);
  }, [content]);

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    try {
      await meetAPI.saveArtifact(meetingId, {
        artifact_type: "notes",
        drive_file_id: `local:notes:${meetingId}:${Date.now()}`,
      });
      setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">Live Notes</span>
          {activeAuthors.length > 0 && (
            <div className="flex -space-x-1">
              {activeAuthors.map(a => (
                <div
                  key={a.user_id}
                  title={a.name}
                  className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center
                    text-[9px] text-white font-bold border border-zinc-950"
                >
                  {a.name?.[0]}
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700
            rounded-lg text-xs text-zinc-300 transition-colors disabled:opacity-50"
        >
          <Save size={11} />
          {saving ? "Saving..." : savedAt ? `Saved ${savedAt}` : "Save"}
        </button>
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={handleChange}
        placeholder={`Start typing meeting notes here...\n\nUse this space for:\n• Key discussion points\n• Decisions made\n• Action items\n• Questions to follow up`}
        className="flex-1 resize-none bg-transparent p-4 text-sm text-zinc-200
          placeholder-zinc-600 focus:outline-none leading-relaxed font-mono"
        style={{ scrollbarWidth: "none" }}
      />

      {/* Footer */}
      <div className="px-4 py-2 border-t border-zinc-900 flex items-center justify-between flex-shrink-0">
        <span className="text-[10px] text-zinc-600">{content.length} chars · Auto-saves every 30s</span>
        <span className="text-[10px] text-zinc-600">
          {activeAuthors.length > 0 ? `${activeAuthors.length + 1} editing` : "Only you"}
        </span>
      </div>
    </div>
  );
}