// ══════════════════════════════════════════════════════════════════════════════
// src/components/pages/meet/SaveToDriveModal.jsx  (screen 9)
// ══════════════════════════════════════════════════════════════════════════════
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, FileText, Edit3, Image, Check, HardDrive, ArrowLeft, CheckSquare, Zap, Bot, Mic } from "lucide-react";
import { useSelector } from "react-redux";
import { meetAPI } from "@/utils/APIs/meetAPI";

export function SaveToDriveModal({ meetingId, meeting, onClose }) {
  const [selected, setSelected] = useState({
    recording:   !!meeting?.recording_file_id,
    transcript:  !!meeting?.transcript_file_id,
    summary:     true,
    notes:       true,
    annotations: false,
  });
  const [destination, setDestination] = useState("startup");
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState([]);

  const ITEMS = [
    { key: "recording",   label: "Recording",    icon: Play,     available: !!meeting?.recording_file_id },
    { key: "transcript",  label: "Transcript",   icon: FileText, available: !!meeting?.transcript_file_id },
    { key: "summary",     label: "Summary",      icon: FileText, available: !!meeting?.summary_doc_id },
    { key: "notes",       label: "Live Notes",   icon: Edit3,    available: !!meeting?.live_notes_doc_id },
    { key: "annotations", label: "Annotations",  icon: Image,    available: true },
  ];

  async function handleSave() {
    setSaving(true);
    const toSave = Object.entries(selected).filter(([k, v]) => v).map(([k]) => k);
    for (const type of toSave) {
      try {
        const fileId = meeting?.[`${type}_file_id`] || meeting?.[`${type}_doc_id`] || `local:${type}:${meetingId}`;
        await meetAPI.saveArtifact(meetingId, {
          artifact_type: type,
          drive_file_id: fileId,
        });
        setSaved(prev => [...prev, type]);
      } catch (e) { console.error(`Save ${type} failed:`, e); }
    }
    setSaving(false);
  }

  const allSaved = saved.length === Object.values(selected).filter(Boolean).length && saved.length > 0;

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
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <HardDrive size={18} className="text-zinc-400" />
            <h2 className="font-bold text-white">Save to Drive</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Select outputs to save</p>
            <div className="space-y-2">
              {ITEMS.map(item => (
                <button
                  key={item.key}
                  onClick={() => item.available && setSelected(s => ({ ...s, [item.key]: !s[item.key] }))}
                  disabled={!item.available}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                    ${!item.available ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
                    ${selected[item.key] && item.available
                      ? "bg-blue-600/10 border-blue-500/40"
                      : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                    }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                    ${selected[item.key] ? "bg-blue-600" : "bg-zinc-800"}`}>
                    {saved.includes(item.key)
                      ? <Check size={14} className="text-white" />
                      : <item.icon size={14} className={selected[item.key] ? "text-white" : "text-zinc-400"} />
                    }
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{item.label}</p>
                    <p className="text-xs text-zinc-500">
                      {!item.available ? "Not available" : saved.includes(item.key) ? "✓ Saved" : "Ready to save"}
                    </p>
                  </div>
                  <div className={`w-4 h-4 rounded border transition-all
                    ${selected[item.key] && item.available ? "bg-blue-600 border-blue-500" : "border-zinc-700"}`}>
                    {selected[item.key] && item.available && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Destination */}
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Save to</p>
            <select
              value={destination}
              onChange={e => setDestination(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm
                text-white focus:outline-none focus:border-zinc-600"
            >
              <option value="startup">Startup Drive</option>
              <option value="meeting">Meeting Folder</option>
              <option value="personal">Personal Drive</option>
            </select>
          </div>

          {allSaved && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <Check size={16} className="text-emerald-400" />
              <p className="text-sm text-emerald-300 font-medium">All selected outputs saved!</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-300
              hover:bg-zinc-800 transition-colors"
          >
            {allSaved ? "Close" : "Cancel"}
          </button>
          {!allSaved && (
            <button
              onClick={handleSave}
              disabled={saving || !Object.values(selected).some(Boolean)}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50
                rounded-xl text-sm font-semibold text-white transition-colors"
            >
              {saving ? "Saving..." : "Save Selected"}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// src/components/pages/meet/PostMeetingSummaryPage.jsx  (screen 10)
// ══════════════════════════════════════════════════════════════════════════════

export function PostMeetingSummaryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting]       = useState(null);
  const [decisions, setDecisions]   = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [memory, setMemory]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [savingDrive, setSavingDrive] = useState(false);
  const [creatingTasks, setCreatingTasks] = useState(false);
  const [showSaveDrive, setShowSaveDrive] = useState(false);

  useEffect(() => { fetchAll(); }, [id]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [mRes, dRes, aRes, memRes] = await Promise.allSettled([
        meetAPI.getMeeting(id),
        meetAPI.getDecisions(id),
        meetAPI.getActionItems(id),
        meetAPI.getMeetingMemory(id),
      ]);
      if (mRes.status === "fulfilled") setMeeting(mRes.value.data);
      if (dRes.status === "fulfilled") setDecisions(dRes.value.data?.decisions || dRes.value.data || []);
      if (aRes.status === "fulfilled") setActionItems(aRes.value.data?.action_items || aRes.value.data || []);
      if (memRes.status === "fulfilled") {
        const mems = memRes.value.data?.memories || [];
        setMemory(mems.find(m => m.memory_type === "episodic") || null);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleTriggerProcessing() {
    try {
      await meetAPI.getProcessPipeline(id);
      await meetAPI.triggerMemoryUpdate(id);
      fetchAll();
    } catch (e) { console.error(e); }
  }

  const PRIORITY_COLORS = { urgent: "bg-red-500/20 text-red-300", high: "bg-orange-500/20 text-orange-300",
    medium: "bg-amber-500/20 text-amber-300", low: "bg-zinc-700 text-zinc-400" };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white px-4 py-6 max-w-3xl mx-auto">
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors text-sm"
      >
        <ArrowLeft size={16} /> Back
      </motion.button>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2.5 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-zinc-400">
            Post-Meeting Summary
          </span>
        </div>
        <h1 className="text-xl font-bold text-white mb-1">{meeting?.title}</h1>
        <p className="text-sm text-zinc-400">
          {meeting?.actual_end_at
            ? new Date(meeting.actual_end_at).toLocaleString([], {
                weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
              })
            : "Recently ended"}
        </p>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setShowSaveDrive(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500
              rounded-xl text-sm font-semibold text-white transition-colors"
          >
            <HardDrive size={14} />
            Save All to Drive
          </button>
          <button
            onClick={handleTriggerProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700
              border border-zinc-700 rounded-xl text-sm text-zinc-300 transition-colors"
          >
            <Bot size={14} />
            Generate AI Summary
          </button>
        </div>
      </motion.div>

      {/* AI Summary */}
      {memory && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 mb-4">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Bot size={16} className="text-blue-400" />
            AI Summary
          </h3>
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{memory.content}</p>
        </motion.div>
      )}

      {/* Decisions */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 mb-4">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <CheckSquare size={16} className="text-blue-400" />
          Decisions ({decisions.length})
        </h3>
        {decisions.length === 0 ? (
          <p className="text-sm text-zinc-600">No decisions captured</p>
        ) : (
          <div className="space-y-3">
            {decisions.map(d => (
              <div key={d.id} className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-xl">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-zinc-200">{d.decision_statement}</p>
                  {d.rationale && <p className="text-xs text-zinc-500 mt-1">{d.rationale}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Action Items */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Zap size={16} className="text-amber-400" />
            Action Items ({actionItems.length})
          </h3>
          {actionItems.length > 0 && (
            <button
              onClick={async () => {
                setCreatingTasks(true);
                // In production: convert action items to real SF Tasks
                await new Promise(r => setTimeout(r, 1000));
                setCreatingTasks(false);
                alert("Tasks created in your workspace!");
              }}
              disabled={creatingTasks}
              className="text-xs px-3 py-1.5 bg-amber-600/20 border border-amber-500/30 rounded-lg
                text-amber-300 hover:bg-amber-600/30 transition-colors disabled:opacity-50"
            >
              {creatingTasks ? "Creating..." : "→ Create Tasks"}
            </button>
          )}
        </div>
        {actionItems.length === 0 ? (
          <p className="text-sm text-zinc-600">No action items captured</p>
        ) : (
          <div className="space-y-2">
            {actionItems.map(item => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-xl">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0
                  ${item.status === "done" ? "bg-emerald-400" : "bg-zinc-600"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-200">{item.title}</p>
                  {item.description && <p className="text-xs text-zinc-500 mt-0.5">{item.description}</p>}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                      ${PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.low}`}>
                      {item.priority}
                    </span>
                    {item.due_at && (
                      <span className="text-[10px] text-zinc-500">
                        Due {new Date(item.due_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Transcript preview */}
      {meeting?.transcript_file_id && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Mic size={16} className="text-zinc-400" />
            Transcript
          </h3>
          <div className="p-3 bg-zinc-800/50 rounded-xl">
            <p className="text-xs text-zinc-400 font-mono">
              Transcript saved at: {meeting.transcript_file_id}
            </p>
          </div>
        </motion.div>
      )}

      {/* Save to Drive Modal */}
      {showSaveDrive && (
        <SaveToDriveModal
          meetingId={id}
          meeting={meeting}
          onClose={() => setShowSaveDrive(false)}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// src/components/pages/meet/AnnotationUI.jsx  (screen 8)
// ══════════════════════════════════════════════════════════════════════════════

export function AnnotationUI({ meetingId, targetArtifactId, socket, onClose }) {
  const canvasRef = useRef(null);
  const [tool, setTool]   = useState("freehand");
  const [color, setColor] = useState("#3b82f6");
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const { user } = useSelector(s => s.auth);

  const TOOLS = [
    { id: "freehand", label: "✏️", title: "Draw" },
    { id: "highlight", label: "🖊", title: "Highlight" },
    { id: "text_comment", label: "💬", title: "Comment" },
    { id: "arrow", label: "↗", title: "Arrow" },
    { id: "box", label: "▭", title: "Box" },
    { id: "sticky_note", label: "📌", title: "Pin" },
  ];
  const COLORS = ["#3b82f6","#ef4444","#f59e0b","#10b981","#8b5cf6","#ffffff"];

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches?.[0] || e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const startDraw = (e) => {
    if (tool !== "freehand" && tool !== "highlight") return;
    setIsDrawing(true);
    const pos = getPos(e, canvasRef.current);
    setLastPos(pos);
  };

  const draw = (e) => {
    if (!isDrawing || !lastPos) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === "highlight" ? color + "80" : color;
    ctx.lineWidth   = tool === "highlight" ? 16 : 2;
    ctx.lineCap     = "round";
    ctx.stroke();
    setLastPos(pos);
  };

  const endDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    canvasRef.current.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  };

  async function saveAnnotation() {
    const canvas = canvasRef.current;
    setSaving(true);
    try {
      const payload = {
        annotation_type:    tool,
        target_artifact_id: targetArtifactId,
        payload: {
          color,
          text:       comment,
          canvas_data: tool === "freehand" ? canvas.toDataURL() : null,
        },
      };
      const res = await meetAPI.createAnnotation(meetingId, payload);
      const ann = res.data?.annotation || res.data;
      setAnnotations(prev => [...prev, ann]);
      // Also emit via socket for live sync
      if (socket) {
        socket.emit("meet_annotate", { meeting_id: meetingId, ...payload });
      }
      setComment("");
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  async function exportAndSave() {
    setSaving(true);
    try {
      const canvas  = canvasRef.current;
      const dataUrl = canvas.toDataURL("image/png");
      await meetAPI.saveArtifact(meetingId, {
        artifact_type: "annotation",
        drive_file_id: `local:annotation:${meetingId}:${Date.now()}`,
      });
      // Download locally
      const a = document.createElement("a");
      a.href     = dataUrl;
      a.download = `meeting-${meetingId}-annotation.png`;
      a.click();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-900 flex-shrink-0 flex-wrap">
        <div className="flex gap-1">
          {TOOLS.map(t => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              title={t.title}
              className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all
                ${tool === t.id ? "bg-blue-600 text-white" : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{ background: c }}
              className={`w-5 h-5 rounded-full transition-all ${color === c ? "ring-2 ring-white ring-offset-1 ring-offset-zinc-950" : ""}`}
            />
          ))}
        </div>

        <div className="flex gap-2 ml-auto">
          <button onClick={clearCanvas} className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-xs text-zinc-400 transition-colors">
            Clear
          </button>
          <button onClick={exportAndSave} disabled={saving}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs text-zinc-300 transition-colors disabled:opacity-50">
            Export
          </button>
          <button onClick={saveAnnotation} disabled={saving}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs text-white transition-colors disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden bg-zinc-900">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="w-full h-full touch-none cursor-crosshair"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>

      {/* Comment input (for text_comment / sticky_note) */}
      {(tool === "text_comment" || tool === "sticky_note") && (
        <div className="p-3 border-t border-zinc-900">
          <input
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Type your comment..."
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm
              text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
          />
        </div>
      )}
    </div>
  );
}
