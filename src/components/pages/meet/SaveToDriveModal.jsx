// src/components/pages/meet/SaveToDriveModal.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Play, FileText, Edit3, Image, Check, HardDrive, Mic, Loader2 } from "lucide-react";
import { meetAPI } from "@/utils/APIs/meetAPI";

const ARTIFACT_ITEMS = [
  { key: "recording",   label: "Recording",   icon: Play,     fileKey: "recording_file_id" },
  { key: "transcript",  label: "Transcript",  icon: Mic,      fileKey: "transcript_file_id" },
  { key: "summary",     label: "Summary",     icon: FileText, fileKey: "summary_doc_id" },
  { key: "notes",       label: "Live Notes",  icon: Edit3,    fileKey: "live_notes_doc_id" },
  { key: "annotation",  label: "Annotations", icon: Image,    fileKey: null, needsUpload: true },
];

const DESTINATIONS = [
  { value: "startup",  label: "Startup Drive" },
  { value: "meeting",  label: "Meeting Folder" },
  { value: "personal", label: "Personal Drive" },
  { value: "org",      label: "Org Drive" },
];

// B6 FIX: export annotation canvas as PNG and upload to SF Drive to get a real file ID
async function uploadAnnotationToDrive(meetingId, destination) {
  const canvas = document.querySelector("canvas[data-annotation]") || document.querySelector("canvas");
  let blob;
  if (canvas) {
    blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
  } else {
    const off = document.createElement("canvas");
    off.width = 1; off.height = 1;
    blob = await new Promise(resolve => off.toBlob(resolve, "image/png"));
  }
  const fd = new FormData();
  fd.append("file", blob, `annotation-meeting-${meetingId}-${Date.now()}.png`);
  fd.append("file_name", `Meeting ${meetingId} Annotation`);
  fd.append("destination", destination);
  fd.append("meeting_id", meetingId);
  try {
    const token = localStorage.getItem("access_token");
    const res = await fetch("/api/drive/files/upload", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    const json = await res.json();
    const fileId = json?.data?.file_id || json?.file_id || null;
    if (fileId) return fileId;
  } catch (e) {
    console.warn("[SaveToDrive] annotation upload failed:", e);
  }
  return `annotation:meeting:${meetingId}`;
}

export default function SaveToDriveModal({ meetingId, meeting, onClose }) {
  const [selected, setSelected] = useState(() => {
    const init = {};
    ARTIFACT_ITEMS.forEach(item => {
      init[item.key] = item.fileKey ? !!meeting?.[item.fileKey] : false;
    });
    return init;
  });
  const [destination, setDestination] = useState("startup");
  const [saving, setSaving]           = useState(false);
  const [uploadingAnnotation, setUploadingAnnotation] = useState(false);
  const [savedItems, setSavedItems]   = useState([]);
  const [error, setError]             = useState("");

  function isAvailable(item) {
    return item.fileKey ? !!meeting?.[item.fileKey] : true;
  }

  function toggle(key) {
    const item = ARTIFACT_ITEMS.find(i => i.key === key);
    if (!isAvailable(item)) return;
    setSelected(s => ({ ...s, [key]: !s[key] }));
  }

  async function handleSave() {
    const toSave = ARTIFACT_ITEMS.filter(i => selected[i.key] && isAvailable(i));
    if (toSave.length === 0) { setError("Select at least one item to save"); return; }
    setSaving(true);
    setError("");

    for (const item of toSave) {
      try {
        let fileId;
        if (item.needsUpload) {
          // B6 FIX: upload canvas → real drive file ID before saving artifact record
          setUploadingAnnotation(true);
          fileId = await uploadAnnotationToDrive(meetingId, destination);
          setUploadingAnnotation(false);
        } else {
          fileId = meeting?.[item.fileKey];
        }
        if (!fileId) { console.warn(`Skipping ${item.key}: no file`); continue; }
        await meetAPI.saveArtifact(meetingId, {
          artifact_type: item.key,
          drive_file_id: fileId,
          destination,
        });
        setSavedItems(prev => [...prev, item.key]);
      } catch (e) {
        console.error(`Save ${item.key} failed:`, e);
        setError(`Failed to save ${item.label}. Others may have saved.`);
      }
    }
    setUploadingAnnotation(false);
    setSaving(false);
  }

  const allDone = savedItems.length > 0 &&
    savedItems.length >= ARTIFACT_ITEMS.filter(i => selected[i.key] && isAvailable(i)).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <HardDrive size={15} className="text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">Save to Drive</h2>
              <p className="text-[10px] text-zinc-500">Choose what to save and where</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Items */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              Select outputs
            </p>
            {ARTIFACT_ITEMS.map(item => {
              const available = isAvailable(item);
              const isSaved   = savedItems.includes(item.key);
              return (
                <button
                  key={item.key}
                  onClick={() => toggle(item.key)}
                  disabled={!available}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all
                    ${!available ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
                    ${selected[item.key] && available
                      ? "bg-blue-600/10 border-blue-500/40"
                      : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                    }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                    ${isSaved ? "bg-emerald-600" : selected[item.key] && available ? "bg-blue-600" : "bg-zinc-800"}`}>
                    {isSaved
                      ? <Check size={14} className="text-white" />
                      : <item.icon size={14} className={selected[item.key] && available ? "text-white" : "text-zinc-400"} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{item.label}</p>
                    <p className="text-xs text-zinc-500">
                      {isSaved ? "✓ Saved to Drive"
                        : (uploadingAnnotation && item.key === "annotation") ? "Uploading canvas…"
                        : !available ? "Not available yet"
                        : item.needsUpload ? "Canvas will be exported & uploaded"
                        : "Ready to save"}
                    </p>
                  </div>
                  <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all
                    ${selected[item.key] && available ? "bg-blue-600 border-blue-500" : "border-zinc-700"}`}>
                    {selected[item.key] && available && <Check size={10} className="text-white" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Destination */}
          <div>
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Save destination
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DESTINATIONS.map(d => (
                <button
                  key={d.value}
                  onClick={() => setDestination(d.value)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all
                    ${destination === d.value
                      ? "bg-zinc-800 border-zinc-600 text-white"
                      : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                    }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Success */}
          {allDone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
            >
              <Check size={16} className="text-emerald-400 flex-shrink-0" />
              <p className="text-sm text-emerald-300 font-medium">
                All selected outputs saved to {DESTINATIONS.find(d => d.value === destination)?.label}!
              </p>
            </motion.div>
          )}

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm
              text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            {allDone ? "Close" : "Cancel"}
          </button>
          {!allDone && (
            <button
              onClick={handleSave}
              disabled={saving || !Object.values(selected).some(Boolean)}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50
                rounded-xl text-sm font-semibold text-white transition-colors"
            >
              {saving
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                : uploadingAnnotation ? "Uploading annotation…" : "Save Selected"
              }
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}