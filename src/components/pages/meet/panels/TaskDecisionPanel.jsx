// src/components/pages/meet/panels/TaskDecisionPanel.jsx
import React, { useEffect, useState } from "react";
import { meetAPI } from "@/utils/APIs/meetAPI";

const PRIORITY_COLORS = {
  urgent: "text-red-400",
  high:   "text-orange-400",
  medium: "text-amber-400",
  low:    "text-zinc-500",
};

export default function TaskDecisionPanel({ meetingId }) {
  const [tab, setTab]             = useState("tasks");
  const [items, setItems]         = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [newTask, setNewTask]     = useState("");
  const [newDecision, setNewDecision] = useState("");
  const [newOwner, setNewOwner]   = useState("");
  const [loading, setLoading]     = useState(false);

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
      const res = await meetAPI.createActionItem(meetingId, {
        title:    newTask.trim(),
        priority: "medium",
      });
      setItems(prev => [...prev, res.data?.action_item || res.data]);
      setNewTask("");
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function addDecision() {
    if (!newDecision.trim()) return;
    setLoading(true);
    try {
      const res = await meetAPI.createDecision(meetingId, {
        decision_statement: newDecision.trim(),
      });
      setDecisions(prev => [...prev, res.data?.decision || res.data]);
      setNewDecision("");
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function toggleTaskDone(item) {
    const newStatus = item.status === "done" ? "open" : "done";
    try {
      await meetAPI.updateActionItem(meetingId, item.id, { status: newStatus });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i));
    } catch (e) { console.error(e); }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-zinc-900 flex-shrink-0">
        {["tasks", "decisions"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-colors
              ${tab === t ? "text-white border-b-2 border-blue-500" : "text-zinc-500 hover:text-zinc-400"}`}
          >
            {t} ({t === "tasks" ? items.length : decisions.length})
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: "none" }}>
        {tab === "tasks" && (
          <>
            {items.length === 0 && (
              <p className="text-xs text-zinc-600 text-center py-6">No action items yet</p>
            )}
            {items.map(item => (
              <div key={item.id}
                className="flex items-start gap-2.5 p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                <button
                  onClick={() => toggleTaskDone(item)}
                  className={`w-4 h-4 rounded border mt-0.5 flex-shrink-0 flex items-center justify-center transition-all
                    ${item.status === "done"
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-zinc-600 hover:border-zinc-400"
                    }`}
                >
                  {item.status === "done" && (
                    <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs leading-relaxed
                    ${item.status === "done" ? "line-through text-zinc-600" : "text-zinc-200"}`}>
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-medium ${PRIORITY_COLORS[item.priority] || "text-zinc-500"}`}>
                      {item.priority}
                    </span>
                    {item.due_at && (
                      <span className="text-[10px] text-zinc-600">
                        Due {new Date(item.due_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === "decisions" && (
          <>
            {decisions.length === 0 && (
              <p className="text-xs text-zinc-600 text-center py-6">No decisions marked yet</p>
            )}
            {decisions.map(d => (
              <div key={d.id} className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">Decision</span>
                  <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-md
                    ${d.status === "actioned" ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>
                    {d.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed">{d.decision_statement}</p>
                {d.rationale && (
                  <p className="text-[10px] text-zinc-500 mt-1.5 italic">{d.rationale}</p>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Add input */}
      <div className="p-3 border-t border-zinc-900 flex-shrink-0">
        <div className="flex gap-2">
          <input
            value={tab === "tasks" ? newTask : newDecision}
            onChange={e => tab === "tasks" ? setNewTask(e.target.value) : setNewDecision(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (tab === "tasks" ? addTask() : addDecision())}
            placeholder={tab === "tasks" ? "Add action item..." : "Mark a decision..."}
            className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs
              text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
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