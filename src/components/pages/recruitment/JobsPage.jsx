import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { recruitmentAPI } from "@/utils/APIs/recruitmentAPI";
import { CreateJobModal } from "./index";

export default function JobsPage({ pipelineMode }) {
  const navigate = useNavigate();
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState("open");
  const [showCreate, setShowCreate] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try { const r = await recruitmentAPI.listJobs({ isOpen: tab === "open" }); setJobs(r.data); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, [tab]);

  return (
    <>
      <div style={s.topBar}>
        <div>
          <h1 style={s.h1}>{pipelineMode ? "All Pipelines" : "Open Roles"}</h1>
          <p style={s.sub}>{pipelineMode ? "Click a role to view its kanban pipeline." : "Manage your active job postings."}</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={s.btnPrimary}>+ New Role</button>
      </div>

      {/* Tabs */}
      <div style={s.tabRow}>
        {["open","closed"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={tab === t ? s.tabActive : s.tab}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <Spinner />
      ) : !jobs.length ? (
        <EmptyState icon="📋" title={`No ${tab} roles found.`}
          action={tab === "open" && { label: "Create your first role →", onClick: () => setShowCreate(true) }} />
      ) : (
        <div style={s.grid}>
          {jobs.map(job => (
            <div
              key={job.id}
              onClick={() => navigate(`/recruitment/jobs/${job.id}`)}
              style={s.jobCard}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-strong)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--surface-card)"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: tab === "open" ? "#22c55e" : "#6b7280" }} />
                <span style={{ fontSize: 10, color: tab === "open" ? "#22c55e" : "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {tab}
                </span>
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 600, color: "var(--color-star)" }}>{job.title}</h3>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: job.description ? 10 : 0 }}>
                {job.department && <span style={s.meta}>{job.department}</span>}
                {job.location   && <span style={s.meta}>📍 {job.isRemote ? "Remote" : job.location}</span>}
                <span style={s.meta}>{job.applicantCount} applicant{job.applicantCount !== 1 ? "s" : ""}</span>
              </div>
              {job.description && (
                <p style={{ margin: 0, fontSize: 12, color: "#4b5563", lineHeight: 1.5,
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {job.description}
                </p>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 14 }} onClick={e => e.stopPropagation()}>
                <button
                  onClick={async e => { e.stopPropagation(); await recruitmentAPI.updateJob(job.id, { isOpen: false }); fetchJobs(); }}
                  style={s.btnGhost}
                >
                  Close role
                </button>
                <button
                  onClick={async e => { e.stopPropagation(); if (!window.confirm("Delete this job?")) return; await recruitmentAPI.deleteJob(job.id); fetchJobs(); }}
                  style={s.btnDanger}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreateJobModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetchJobs(); }} />}
    </>
  );
}

function Spinner() {
  return (
    <div style={{ textAlign: "center", padding: 50 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #1f2937",
        borderTop: "3px solid #fbbf24", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function EmptyState({ icon, title, action }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 0", color: "#6b7280" }}>
      <div style={{ fontSize: 34, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 14, color: "var(--color-dim)", margin: "0 0 8px" }}>{title}</p>
      {action && (
        <button onClick={action.onClick}
          style={{ background: "none", border: "none", color: "#fbbf24", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
          {action.label}
        </button>
      )}
    </div>
  );
}

const s = {
  topBar:   { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 },
  h1:       { fontSize: 24, fontWeight: 700, color: "var(--color-star)", margin: 0 },
  sub:      { color: "#6b7280", fontSize: 13, marginTop: 4, margin: "4px 0 0" },
  tabRow:   { display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" },
  tab:      { background: "var(--surface-card)", border: "1px solid var(--border-strong)", borderRadius: 6, padding: "6px 14px", color: "var(--color-dim)", fontSize: 13, cursor: "pointer" },
  tabActive:{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 6, padding: "6px 14px", color: "#fbbf24", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  grid:     { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 },
  jobCard:  { background: "var(--surface-card-2)", border: "1px solid #1f2937", borderRadius: 12, padding: 18, cursor: "pointer", transition: "border-color 0.15s" },
  meta:     { fontSize: 11, color: "#6b7280" },
  btnPrimary:{ background: "#fbbf24", border: "none", borderRadius: 8, padding: "8px 18px", color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  btnGhost: { background: "transparent", border: "1px solid var(--border-strong)", borderRadius: 6, padding: "4px 10px", color: "var(--color-dim)", fontSize: 11, cursor: "pointer" },
  btnDanger:{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, padding: "4px 10px", color: "#f87171", fontSize: 11, cursor: "pointer" },
};