import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { recruitmentAPI } from "@/utils/APIs/recruitmentAPI";
import { AddApplicantModal } from "./index";

const STAGES = [
  { key:"sourced",      label:"Sourced",      color:"#6b7280" },
  { key:"contacted",    label:"Contacted",    color:"#3b82f6" },
  { key:"responded",    label:"Responded",    color:"#8b5cf6" },
  { key:"screening",    label:"Screening",    color:"#f59e0b" },
  { key:"interviewing", label:"Interviewing", color:"#f97316" },
  { key:"offer_sent",   label:"Offer Sent",   color:"#10b981" },
  { key:"hired",        label:"Hired",        color:"#22c55e" },
  { key:"rejected",     label:"Rejected",     color:"#ef4444" },
];

// ── Column extracted as proper component (fixes useState-in-loop bug) ─────────
function KanbanColumn({ stage, applicants, onMoved, onApplicantClick }) {
  const [over, setOver] = useState(false);

  const handleDrop = async (e) => {
    e.preventDefault();
    setOver(false);
    const id = parseInt(e.dataTransfer.getData("applicantId"));
    if (!id) return;
    try {
      await recruitmentAPI.moveStage(id, { stage: stage.key, reason: "Moved via kanban" });
      onMoved();
    } catch (err) { console.error(err); }
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={handleDrop}
      style={{
        minWidth: 190, minHeight: 400, borderRadius: 10, display: "flex", flexDirection: "column",
        background: "var(--surface-card-2)",
        border: over ? `1px solid ${stage.color}` : "1px solid #1f2937",
        transition: "border-color 0.15s",
      }}
    >
      {/* Column header */}
      <div style={{ padding: "10px 12px", borderBottom: "1px solid #1f2937",
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: stage.color }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: "var(--color-dim)",
            textTransform: "uppercase", letterSpacing: "0.06em" }}>{stage.label}</span>
        </div>
        <span style={{ fontSize: 10, color: "#6b7280", fontFamily: "monospace" }}>{applicants.length}</span>
      </div>

      {/* Cards */}
      <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {applicants.map(a => (
          <div
            key={a.id}
            draggable
            onDragStart={e => e.dataTransfer.setData("applicantId", a.id)}
            onClick={() => onApplicantClick(a.id)}
            style={{ background: "var(--surface-deep)", border: "1px solid #1f2937", borderRadius: 8,
              padding: "10px 12px", cursor: "pointer", userSelect: "none" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-strong)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--surface-card)"}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--color-star)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</p>
                {a.email && <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6b7280",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.email}</p>}
              </div>
              {a.score != null && (
                <span style={{ fontSize: 10, fontFamily: "monospace", color: "#fbbf24",
                  background: "rgba(251,191,36,0.1)", padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>
                  {a.score}
                </span>
              )}
            </div>
          </div>
        ))}
        {!applicants.length && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 11, color: "var(--color-dim)" }}>Drop here</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main pipeline page ────────────────────────────────────────────────────────
export default function PipelinePage() {
  const { jobId } = useParams();
  const navigate  = useNavigate();
  const [job, setJob]       = useState(null);
  const [board, setBoard]   = useState({});
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const fetchBoard = useCallback(async () => {
    setLoading(true);
    try {
      const [j, b] = await Promise.all([
        recruitmentAPI.getJob(jobId),
        recruitmentAPI.getPipelineBoard(jobId),
      ]);
      setJob(j.data);
      setBoard(b.data);
    } finally { setLoading(false); }
  }, [jobId]);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  if (loading) return (
    <div style={{ textAlign: "center", padding: 50 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #1f2937",
        borderTop: "3px solid #fbbf24", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <div style={s.topBar}>
        <div>
          <button onClick={() => navigate("/recruitment/jobs")}
            style={{ background: "none", border: "none", color: "#6b7280", fontSize: 12,
              cursor: "pointer", padding: "0 0 6px", display: "block" }}>
            ← All roles
          </button>
          <h1 style={s.h1}>{job?.title}</h1>
          <p style={s.sub}>
            {[job?.department, job?.isRemote ? "Remote" : job?.location].filter(Boolean).join(" · ")}
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} style={s.btnPrimary}>+ Add Candidate</button>
      </div>

      {/* Kanban board — horizontal scroll on mobile */}
      <div style={{ overflowX: "auto", paddingBottom: 12, marginRight: -32, paddingRight: 32 }}>
        <div style={{ display: "flex", gap: 10, minWidth: "max-content" }}>
          {STAGES.map(stage => (
            <KanbanColumn
              key={stage.key}
              stage={stage}
              applicants={board[stage.key] ?? []}
              onMoved={fetchBoard}
              onApplicantClick={id => navigate(`/recruitment/applicants/${id}`)}
            />
          ))}
        </div>
      </div>

      {showAdd && (
        <AddApplicantModal
          jobId={jobId}
          onClose={() => setShowAdd(false)}
          onCreated={() => { setShowAdd(false); fetchBoard(); }}
        />
      )}
    </>
  );
}

const s = {
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 },
  h1:     { fontSize: 24, fontWeight: 700, color: "var(--color-star)", margin: 0 },
  sub:    { color: "#6b7280", fontSize: 13, marginTop: 4, margin: "4px 0 0" },
  btnPrimary: { background: "#fbbf24", border: "none", borderRadius: 8, padding: "8px 18px", color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer" },
};