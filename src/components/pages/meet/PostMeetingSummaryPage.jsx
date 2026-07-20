// src/components/pages/meet/PostMeetingSummaryPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Bot, CheckSquare, Zap, Mic,
  HardDrive, AlertTriangle, Plus
} from "lucide-react";
import { meetAPI } from "@/utils/APIs/meetAPI";
import axios from "axios";
import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from "@/utils/APIs/interceptors";
import { useSelector } from "react-redux";

// B7 FIX: unified /api/erp-tasks endpoint
const erpTasksApi = axios.create({ baseURL: "/api/erp-tasks" });
erpTasksApi.interceptors.request.use(requestInterceptor);
erpTasksApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

// SF Drive upload API
const driveApi = axios.create({ baseURL: "/api/drive" });
driveApi.interceptors.request.use(requestInterceptor);
driveApi.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const PRIORITY_COLORS = {
  urgent: "bg-red-500/20 text-red-300 border-red-500/30",
  high:   "bg-orange-500/20 text-orange-300 border-orange-500/30",
  medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  low:    "bg-zinc-800 text-zinc-400 border-zinc-700",
};

function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString([], {
    weekday: "short", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function PostMeetingSummaryPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useSelector(s => s.auth);
  const workspaceId = user?.active_workspace_id || 1;

  const [meeting,     setMeeting]     = useState(null);
  const [decisions,   setDecisions]   = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [memory,      setMemory]      = useState(null);
  const [loading,     setLoading]     = useState(true);

  const [processingAI,  setProcessingAI]  = useState(false);
  const [creatingTasks, setCreatingTasks] = useState(false);
  const [tasksDone,     setTasksDone]     = useState(false);
  const [savingDrive,   setSavingDrive]   = useState(false);
  const [driveSaved,    setDriveSaved]    = useState(false);

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
      if (mRes.status   === "fulfilled") setMeeting(mRes.value.data);
      if (dRes.status   === "fulfilled") setDecisions(dRes.value.data?.decisions || dRes.value.data || []);
      if (aRes.status   === "fulfilled") setActionItems(aRes.value.data?.action_items || aRes.value.data || []);
      if (memRes.status === "fulfilled") {
        const mems = memRes.value.data?.memories || [];
        setMemory(mems.find(m => m.memory_type === "episodic") || null);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleGenerateAI() {
    setProcessingAI(true);
    try {
      await meetAPI.getProcessPipeline(id);
      await meetAPI.triggerMemoryUpdate(id);
      await new Promise(r => setTimeout(r, 1500));
      fetchAll();
    } catch (e) { console.error(e); }
    finally { setProcessingAI(false); }
  }

  // B6 FIX: actually upload a real file to SF Drive
  async function handleSaveAllToDrive() {
    if (!meeting) return;
    setSavingDrive(true);
    try {
      const cleanDecs = decisions.filter(d => !d.decision_statement?.includes("[BLOCKER]"));
      const blockers  = decisions.filter(d =>  d.decision_statement?.includes("[BLOCKER]"));

      const lines = [
        "MEETING SUMMARY",
        `Title: ${meeting.title}`,
        `Date:  ${formatDateTime(meeting.actual_end_at || meeting.scheduled_start_at)}`,
        `Type:  ${(meeting.meeting_type || "").replace(/_/g, " ")}`,
        "",
        `=== DECISIONS (${cleanDecs.length}) ===`,
        ...cleanDecs.map((d, i) =>
          `${i + 1}. ${d.decision_statement}${d.rationale ? "\n   Rationale: " + d.rationale : ""}`
        ),
        "",
        `=== ACTION ITEMS (${actionItems.length}) ===`,
        ...actionItems.map((a, i) =>
          `${i + 1}. [${a.status === "done" ? "X" : " "}] ${a.title} (${a.priority || "medium"})${a.due_at ? " - Due: " + new Date(a.due_at).toLocaleDateString() : ""}`
        ),
        "",
        `=== BLOCKERS (${blockers.length}) ===`,
        ...blockers.map((b, i) =>
          `${i + 1}. ${b.decision_statement.replace("[BLOCKER]", "").trim()}`
        ),
      ].join("\n");

      const blob     = new Blob([lines], { type: "text/plain" });
      const filename = `Meeting Summary - ${meeting.title} - ${new Date().toLocaleDateString()}.txt`;
      const fd       = new FormData();
      fd.append("file",              blob, filename);
      fd.append("visibility_scope",  "private");
      fd.append("sensitivity_level", "internal");

      // Upload to SF Drive — returns a real DriveFile record
      const res    = await driveApi.post("/files/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const fileId = res?.data?.data?.id || res?.data?.id || null;

      // Link the uploaded file back to this meeting as an artifact
      if (fileId) {
        try {
          await meetAPI.saveArtifact(meeting.id, {
            artifact_type: "summary",
            drive_file_id: String(fileId),
            destination:   "personal",
          });
        } catch {}
      }

      setDriveSaved(true);
    } catch (e) {
      console.error("Save to Drive failed:", e);
      alert("Failed to save to SF Drive. Please try again.");
    } finally {
      setSavingDrive(false);
    }
  }

  // B7 FIX: create tasks in the unified /api/erp-tasks system
  async function handleCreateTasks() {
    if (actionItems.length === 0) return;
    setCreatingTasks(true);
    let allOk = true;
    try {
      for (const item of actionItems) {
        try {
          await erpTasksApi.post("/create", {
            workspace_id: workspaceId,
            title:        item.title,
            description:  item.description || `Action item from meeting: ${meeting?.title || ""}`,
            status:       "todo",
            deadline:     item.due_at || null,
          });
        } catch (e) {
          console.error(`Failed to create task "${item.title}":`, e);
          allOk = false;
        }
      }
      if (allOk) setTasksDone(true);
    } finally {
      setCreatingTasks(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-800 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const openItems      = actionItems.filter(i => i.status !== "done");
  const blockers       = decisions.filter(d =>  d.decision_statement?.includes("[BLOCKER]"));
  const cleanDecisions = decisions.filter(d => !d.decision_statement?.includes("[BLOCKER]"));

  return (
    <div className="min-h-screen text-white px-4 py-6 max-w-3xl mx-auto">

      {/* Back */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors text-sm"
      >
        <ArrowLeft size={16} /> Back
      </motion.button>

      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 mb-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2.5 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-zinc-400">
            Post-Meeting Summary
          </span>
          <span className="text-xs px-2 py-0.5 bg-zinc-800 rounded-md text-zinc-500 capitalize">
            {meeting?.meeting_type?.replace(/_/g, " ")}
          </span>
        </div>
        <h1 className="text-xl font-bold text-white mb-1">{meeting?.title}</h1>
        <p className="text-sm text-zinc-400">
          {formatDateTime(meeting?.actual_end_at || meeting?.scheduled_start_at)}
        </p>

        {/* Stats row */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-zinc-800">
          {[
            { label: "Decisions",    value: cleanDecisions.length, color: "text-blue-400" },
            { label: "Action Items", value: actionItems.length,    color: "text-amber-400" },
            { label: "Blockers",     value: blockers.length,       color: "text-red-400" },
          ].map(s => (
            <div key={s.label}>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-zinc-600">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mt-4">

          {/* Save All to Drive — uploads real file to SF Drive */}
          <button
            onClick={handleSaveAllToDrive}
            disabled={savingDrive || driveSaved}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500
              rounded-xl text-sm font-semibold text-white transition-colors
              shadow-lg shadow-blue-500/20 disabled:opacity-60"
          >
            <HardDrive size={14} className={savingDrive ? "animate-pulse" : ""} />
            {driveSaved ? "✓ Saved to Drive" : savingDrive ? "Saving..." : "Save All to Drive"}
          </button>

          {/* Create Tasks — posts to unified /api/erp-tasks */}
          <button
            onClick={handleCreateTasks}
            disabled={creatingTasks || tasksDone || actionItems.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700
              border border-zinc-700 rounded-xl text-sm text-zinc-300
              disabled:opacity-50 transition-colors"
          >
            <Plus size={14} />
            {tasksDone ? "✓ Tasks Created" : creatingTasks ? "Creating..." : "Create Tasks"}
          </button>

          {!memory && (
            <button
              onClick={handleGenerateAI}
              disabled={processingAI}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700
                border border-zinc-700 rounded-xl text-sm text-zinc-300
                disabled:opacity-50 transition-colors"
            >
              <Bot size={14} className={processingAI ? "animate-spin" : ""} />
              {processingAI ? "Processing..." : "Generate AI Summary"}
            </button>
          )}
        </div>
      </motion.div>

      {/* AI Summary */}
      <AnimatePresence>
        {memory && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 mb-4"
          >
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Bot size={16} className="text-blue-400" />
              AI Summary
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{memory.content}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blockers */}
      {blockers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-950/30 border border-red-500/30 rounded-2xl p-5 mb-4"
        >
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-400" />
            Blockers ({blockers.length})
          </h3>
          <div className="space-y-2">
            {blockers.map(b => (
              <div key={b.id} className="flex items-start gap-2.5 p-3 bg-red-950/30 rounded-xl border border-red-500/20">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
                <p className="text-sm text-zinc-200">{b.decision_statement.replace("[BLOCKER]", "").trim()}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Decisions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 mb-4"
      >
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <CheckSquare size={16} className="text-blue-400" />
          Decisions ({cleanDecisions.length})
        </h3>
        {cleanDecisions.length === 0 ? (
          <p className="text-sm text-zinc-600">No decisions captured</p>
        ) : (
          <div className="space-y-2">
            {cleanDecisions.map(d => (
              <div key={d.id} className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-xl">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-zinc-200">{d.decision_statement}</p>
                  {d.rationale && (
                    <p className="text-xs text-zinc-500 mt-1 italic">{d.rationale}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Action Items */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 mb-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Zap size={16} className="text-amber-400" />
            Action Items ({actionItems.length})
          </h3>
          {openItems.length > 0 && (
            <span className="text-xs text-zinc-500">{openItems.length} open</span>
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
                  <p className={`text-sm ${item.status === "done" ? "line-through text-zinc-500" : "text-zinc-200"}`}>
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-xs text-zinc-500 mt-0.5">{item.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium
                      ${PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.low}`}>
                      {item.priority}
                    </span>
                    {item.due_at && (
                      <span className="text-[10px] text-zinc-500">
                        Due {new Date(item.due_at).toLocaleDateString()}
                      </span>
                    )}
                    {item.status === "done" && (
                      <span className="text-[10px] text-emerald-400">✓ Done</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Transcript */}
      {meeting?.transcript_file_id && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5"
        >
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Mic size={16} className="text-zinc-400" />
            Transcript
          </h3>
          <div className="p-3 bg-zinc-800/50 rounded-xl">
            <p className="text-xs text-zinc-400 font-mono break-all">
              {meeting.transcript_file_id}
            </p>
          </div>
          <p className="text-xs text-zinc-600 mt-2">
            Full transcript stored in SF Drive.
          </p>
        </motion.div>
      )}
    </div>
  );
}