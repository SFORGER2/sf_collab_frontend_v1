// src/components/pages/meet/AnnotationUI.jsx
import React, { useRef, useState } from "react";
import { X, Download } from "lucide-react";
import { meetAPI } from "@/utils/APIs/meetAPI";
import { useSelector } from "react-redux";

const TOOLS = [
  { id: "freehand",     label: "✏️", title: "Freehand Draw" },
  { id: "highlight",    label: "🖊",  title: "Highlight" },
  { id: "arrow",        label: "↗",  title: "Arrow" },
  { id: "box",          label: "▭",  title: "Box" },
  { id: "text_comment", label: "💬", title: "Comment" },
  { id: "sticky_note",  label: "📌", title: "Sticky Note" },
];

const COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#ffffff", "#f97316"];

export default function AnnotationUI({ meetingId, targetArtifactId, socket, onClose }) {
  const canvasRef  = useRef(null);
  const { user }   = useSelector(s => s.auth);

  const [tool, setTool]       = useState("freehand");
  const [color, setColor]     = useState("#3b82f6");
  const [lineWidth, setLineWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState(null);
  const [comment, setComment] = useState("");
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  // ── Drawing helpers ────────────────────────────────────────────────────────

  function getPos(e) {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const src    = e.touches?.[0] || e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top)  * scaleY,
    };
  }

  function startDraw(e) {
    if (!["freehand", "highlight"].includes(tool)) return;
    const pos = getPos(e);
    setIsDrawing(true);
    setLastPos(pos);
    // Start a new path dot
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, tool === "highlight" ? 8 : 1, 0, Math.PI * 2);
    ctx.fillStyle = tool === "highlight" ? color + "60" : color;
    ctx.fill();
  }

  function draw(e) {
    if (!isDrawing || !lastPos) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const pos    = getPos(e);

    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === "highlight" ? color + "60" : color;
    ctx.lineWidth   = tool === "highlight" ? 18 : lineWidth;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    ctx.stroke();
    setLastPos(pos);
  }

  function endDraw() {
    setIsDrawing(false);
    setLastPos(null);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setSaved(false);
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  async function saveAnnotation() {
    setSaving(true);
    try {
      const canvas  = canvasRef.current;
      const payload = {
        annotation_type:    tool,
        target_artifact_id: targetArtifactId || null,
        payload: {
          color,
          text:        comment,
          canvas_data: canvas.toDataURL("image/png"),
        },
      };
      await meetAPI.createAnnotation(meetingId, payload);

      // Emit via socket for live sync to other participants
      if (socket) {
        socket.emit("meet_annotate", { meeting_id: meetingId, ...payload });
      }
      setSaved(true);
      setComment("");
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  async function exportAndDownload() {
    const canvas  = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");

    // Save as artifact
    try {
      await meetAPI.saveArtifact(meetingId, {
        artifact_type: "annotation",
        drive_file_id: `local:annotation:${meetingId}:${Date.now()}`,
      });
    } catch (e) { console.error(e); }

    // Download
    const a      = document.createElement("a");
    a.href       = dataUrl;
    a.download   = `meeting-${meetingId}-annotation.png`;
    a.click();
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800">

      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-900 flex-shrink-0 flex-wrap gap-y-2">

        {/* Tools */}
        <div className="flex gap-1">
          {TOOLS.map(t => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              title={t.title}
              className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all
                ${tool === t.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-zinc-800" />

        {/* Colors */}
        <div className="flex gap-1.5 items-center">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{ background: c }}
              className={`w-5 h-5 rounded-full transition-all flex-shrink-0
                ${color === c ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-110" : "hover:scale-110"}`}
            />
          ))}
        </div>

        {/* Line width */}
        {["freehand"].includes(tool) && (
          <div className="flex items-center gap-2 ml-1">
            <span className="text-[10px] text-zinc-500">Size</span>
            <input
              type="range"
              min={1} max={12}
              value={lineWidth}
              onChange={e => setLineWidth(Number(e.target.value))}
              className="w-16 accent-blue-500"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 ml-auto">
          <button
            onClick={clearCanvas}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800
              rounded-lg text-xs text-zinc-400 hover:text-white transition-colors"
          >
            Clear
          </button>
          <button
            onClick={exportAndDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700
              rounded-lg text-xs text-zinc-300 transition-colors"
          >
            <Download size={11} />
            Export
          </button>
          <button
            onClick={saveAnnotation}
            disabled={saving}
            className={`px-3 py-1.5 rounded-lg text-xs text-white transition-colors disabled:opacity-50
              ${saved ? "bg-emerald-600 hover:bg-emerald-500" : "bg-blue-600 hover:bg-blue-500"}`}
          >
            {saving ? "Saving..." : saved ? "✓ Saved" : "Save"}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
            >
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
          className="w-full h-full touch-none"
          style={{ cursor: ["freehand", "highlight"].includes(tool) ? "crosshair" : "default" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {/* Canvas placeholder text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-zinc-800 text-sm select-none">
            {["freehand", "highlight"].includes(tool) ? "Draw here" : `Click to place ${tool.replace("_", " ")}`}
          </p>
        </div>
      </div>

      {/* Comment input for text_comment / sticky_note */}
      {["text_comment", "sticky_note"].includes(tool) && (
        <div className="p-3 border-t border-zinc-900 flex-shrink-0">
          <input
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder={tool === "sticky_note" ? "Sticky note text..." : "Type your comment..."}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm
              text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>
      )}
    </div>
  );
}