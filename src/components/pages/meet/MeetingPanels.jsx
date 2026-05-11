// src/components/pages/meet/panels/LiveNotesPanel.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Save, User } from "lucide-react";
import { meetAPI } from "@/utils/APIs/meetAPI";
import { useSelector } from "react-redux";

export function LiveNotesPanel({ meetingId, socket, token }) {
  const { user } = useSelector(s => s.auth);
  const [content, setContent]       = useState("");
  const [saving, setSaving]         = useState(false);
  const [savedAt, setSavedAt]       = useState(null);
  const [activeAuthors, setActiveAuthors] = useState([]);
  const versionRef = useRef(0);
  const textareaRef = useRef(null);

  // Receive notes delta from other users
  useEffect(() => {
    if (!socket) return;
    const onDelta = (data) => {
      if (data.meeting_id == meetingId && data.user_id != String(user?.id)) {
        // Simple merge: accept incoming content (last-write-wins)
        if (data.delta?.ops) {
          const text = data.delta.ops.map(op => op.insert || "").join("");
          if (text) setContent(text);
        }
        // Track active author
        setActiveAuthors(prev => {
          const exists = prev.find(a => a.user_id === data.user_id);
          if (exists) return prev.map(a => a.user_id === data.user_id ? { ...a, name: data.name } : a);
          return [...prev, { user_id: data.user_id, name: data.name }];
        });
        // Remove author after 3s idle
        setTimeout(() => {
          setActiveAuthors(prev => prev.filter(a => a.user_id !== data.user_id));
        }, 3000);
      }
    };
    socket.on("meet_notes_delta", onDelta);
    return () => socket.off("meet_notes_delta", onDelta);
  }, [socket, meetingId, user?.id]);

  // Broadcast change
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

  // Auto-save every 30s
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
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">Live Notes</span>
          {activeAuthors.length > 0 && (
            <div className="flex -space-x-1">
              {activeAuthors.map(a => (
                <div key={a.user_id} className="w-5 h-5 rounded-full bg-blue-600 flex items-center
                  justify-center text-[9px] text-white font-bold border border-zinc-950"
                  title={a.name}>
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
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        placeholder="Start typing meeting notes here...

Use this space for:
• Key discussion points
• Decisions made
• Action items
• Questions to follow up"
        className="flex-1 resize-none bg-transparent p-4 text-sm text-zinc-200
          placeholder-zinc-600 focus:outline-none leading-relaxed font-mono scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      />

      {/* Footer */}
      <div className="px-4 py-2 border-t border-zinc-900 flex items-center justify-between">
        <span className="text-[10px] text-zinc-600">
          {content.length} chars · Auto-saves every 30s
        </span>
        <span className="text-[10px] text-zinc-600">
          {activeAuthors.length > 0 ? `${activeAuthors.length + 1} editing` : "Only you"}
        </span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// src/components/pages/meet/panels/TaskDecisionPanel.jsx
// ══════════════════════════════════════════════════════════════════════════════

export function TaskDecisionPanel({ meetingId }) {
  const [tab, setTab] = useState("tasks");
  const [items, setItems]         = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [newTask, setNewTask]     = useState("");
  const [newDecision, setNewDecision] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchData(); }, [meetingId]);

  async function fetchData() {
    try {
      const [tRes, dRes] = await Promise.allSettled([
        meetAPI.getActionItems(meetingId),
        meetAPI.getDecisions(meetingId),
      ]);
      if (tRes.status === "fulfilled") setItems(tRes.value.data?.action_items || tRes.value.data || []);
      if (dRes.status === "fulfilled") setDecisions(dRes.value.data?.decisions || dRes.value.data || []);
    } catch (e) { console.error(e); }
  }

  async function addTask() {
    if (!newTask.trim()) return;
    setLoading(true);
    try {
      const res = await meetAPI.createActionItem(meetingId, { title: newTask.trim(), priority: "medium" });
      setItems(prev => [...prev, res.data?.action_item || res.data]);
      setNewTask("");
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function addDecision() {
    if (!newDecision.trim()) return;
    setLoading(true);
    try {
      const res = await meetAPI.createDecision(meetingId, { decision_statement: newDecision.trim() });
      setDecisions(prev => [...prev, res.data?.decision || res.data]);
      setNewDecision("");
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const PRIORITY_COLORS = { high: "text-red-400", medium: "text-amber-400", low: "text-zinc-500", urgent: "text-red-300" };

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-zinc-900">
        {["tasks", "decisions"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-colors
              ${tab === t ? "text-white border-b-2 border-blue-500" : "text-zinc-500"}`}
          >
            {t} ({t === "tasks" ? items.length : decisions.length})
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-none" style={{ scrollbarWidth: "none" }}>
        {tab === "tasks" && (
          <>
            {items.map(item => (
              <div key={item.id} className="flex items-start gap-2 p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0
                  ${item.status === "done" ? "bg-emerald-400" : "bg-zinc-600"}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs ${item.status === "done" ? "line-through text-zinc-600" : "text-zinc-200"}`}>
                    {item.title}
                  </p>
                  <span className={`text-[10px] font-medium ${PRIORITY_COLORS[item.priority] || "text-zinc-500"}`}>
                    {item.priority}
                  </span>
                </div>
              </div>
            ))}
            {items.length === 0 && <p className="text-xs text-zinc-600 text-center py-6">No action items yet</p>}
          </>
        )}

        {tab === "decisions" && (
          <>
            {decisions.map(d => (
              <div key={d.id} className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  <span className="text-[10px] text-blue-400 font-semibold uppercase">Decision</span>
                </div>
                <p className="text-xs text-zinc-200">{d.decision_statement}</p>
                {d.rationale && <p className="text-[10px] text-zinc-500 mt-1">{d.rationale}</p>}
              </div>
            ))}
            {decisions.length === 0 && <p className="text-xs text-zinc-600 text-center py-6">No decisions yet</p>}
          </>
        )}
      </div>

      {/* Add input */}
      <div className="p-3 border-t border-zinc-900">
        <div className="flex gap-2">
          <input
            value={tab === "tasks" ? newTask : newDecision}
            onChange={e => tab === "tasks" ? setNewTask(e.target.value) : setNewDecision(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (tab === "tasks" ? addTask() : addDecision())}
            placeholder={tab === "tasks" ? "Add action item..." : "Mark decision..."}
            className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs
              text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
          />
          <button
            onClick={tab === "tasks" ? addTask : addDecision}
            disabled={loading}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs text-white
              disabled:opacity-50 transition-colors font-semibold"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// src/components/pages/meet/panels/FilePanel.jsx
// ══════════════════════════════════════════════════════════════════════════════

export function FilePanel({ meetingId }) {
  const [files, setFiles]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [driveId, setDriveId] = useState("");

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
    try {
      const res = await meetAPI.attachFile(meetingId, { drive_file_id: driveId.trim(), artifact_type: "notes" });
      setFiles(prev => [...prev, res.data?.file || res.data]);
      setDriveId("");
    } catch (e) { console.error(e); }
  }

  async function openFile(file) {
    try {
      await meetAPI.openFile(meetingId, file.id);
      // Open file URL if available
      if (file.drive_file_id && !file.drive_file_id.startsWith("local:")) {
        window.open(file.drive_file_id, "_blank");
      }
    } catch (e) { console.error(e); }
  }

  const TYPE_ICONS = { recording: "🎥", transcript: "📝", summary: "📋", notes: "📄", default: "📁" };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-none" style={{ scrollbarWidth: "none" }}>
        {loading ? (
          <div className="space-y-2">
            {[1,2].map(i => <div key={i} className="h-12 bg-zinc-900 rounded-xl animate-pulse" />)}
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <p className="text-xs text-zinc-600">No files attached</p>
          </div>
        ) : (
          files.map(f => (
            <button
              key={f.id}
              onClick={() => openFile(f)}
              className="w-full flex items-center gap-3 p-3 bg-zinc-900 hover:bg-zinc-800
                border border-zinc-800 rounded-xl text-left transition-colors"
            >
              <span className="text-lg">{TYPE_ICONS[f.artifact_type] || TYPE_ICONS.default}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-200 truncate capitalize">
                  {f.artifact_type?.replace(/_/g, " ")}
                </p>
                <p className="text-[10px] text-zinc-500 truncate">{f.drive_file_id}</p>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="p-3 border-t border-zinc-900">
        <div className="flex gap-2">
          <input
            value={driveId}
            onChange={e => setDriveId(e.target.value)}
            onKeyDown={e => e.key === "Enter" && attachFile()}
            placeholder="Paste Drive file ID..."
            className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs
              text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
          />
          <button
            onClick={attachFile}
            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs text-white transition-colors"
          >
            Attach
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// src/components/pages/meet/panels/AIAssistantPanel.jsx
// ══════════════════════════════════════════════════════════════════════════════

export function AIAssistantPanel({ meetingId }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your meeting assistant. Ask me anything about this meeting — past decisions, blockers, or what needs to happen next." }
  ]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef = useRef(null);

  const QUICK_PROMPTS = [
    "What did we decide last time?",
    "Summarize current blockers",
    "List open action items",
    "What needs to happen next?",
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text) {
    const q = text || input.trim();
    if (!q) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: q }]);
    setLoading(true);

    try {
      // In production, call your AI endpoint. For now simulate.
      await new Promise(r => setTimeout(r, 1200));
      const response = `I've reviewed the meeting context for meeting ${meetingId}. Based on the decisions and action items captured, here's what I found regarding: "${q}"\n\nThis feature connects to your workspace memory system — ensure the AI memory update has been triggered after the meeting ends for full context.`;
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process that right now." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-none" style={{ scrollbarWidth: "none" }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-3 py-2.5 rounded-2xl text-xs leading-relaxed
              ${m.role === "user"
                ? "bg-blue-600 text-white rounded-br-md"
                : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-md"
              }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-bl-md px-3 py-2.5">
              <div className="flex gap-1">
                {[0,150,300].map(d => (
                  <span key={d} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-3 pb-2 flex flex-wrap gap-1.5">
        {QUICK_PROMPTS.map(p => (
          <button
            key={p}
            onClick={() => send(p)}
            className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700
              rounded-lg text-[10px] text-zinc-400 hover:text-white transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-zinc-900">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask about this meeting..."
            className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs
              text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs text-white
              disabled:opacity-40 transition-colors"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef } from "react";
export { LiveNotesPanel as default };