import { useNavigate, useOutletContext } from "react-router-dom";
import { useState } from "react";
import { recruitmentAPI } from "@/utils/APIs/recruitmentAPI";
import { CreateJobModal } from "./index";

const STAGE_ORDER  = ["sourced","contacted","responded","screening","interviewing","offer_sent","hired","rejected","withdrawn"];
const STAGE_COLORS = { sourced:"#6b7280",contacted:"#3b82f6",responded:"#8b5cf6",screening:"#f59e0b",interviewing:"#f97316",offer_sent:"#10b981",hired:"#22c55e",rejected:"#ef4444",withdrawn:"#6b7280" };
const STAGE_LABELS = { sourced:"Sourced",contacted:"Contacted",responded:"Responded",screening:"Screening",interviewing:"Interview",offer_sent:"Offer Sent",hired:"Hired",rejected:"Rejected",withdrawn:"Withdrawn" };

export default function RecruitmentDashboard() {
  const navigate = useNavigate();
  const { summary, setSummary } = useOutletContext();
  const [showCreate, setShowCreate] = useState(false);

  const refresh = () => recruitmentAPI.getDashboard().then(r => setSummary(r.data)).catch(() => {});

  const totalByStage = {};
  summary?.jobs?.forEach(job =>
    Object.entries(job.stageCounts ?? {}).forEach(([st, c]) => {
      totalByStage[st] = (totalByStage[st] ?? 0) + c;
    })
  );
  const total = Object.values(totalByStage).reduce((a, b) => a + b, 0);

  return (
    <>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ margin:0, fontSize:24, fontWeight:700, color:"#f9fafb" }}>Recruitment Overview</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:"#6b7280" }}>Manage roles, track candidates, close faster.</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={s.btnPrimary}>+ New Role</button>
      </div>

      {/* Stat cards — 4-col on desktop, 2-col on tablet, 1-col on mobile */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:14, marginBottom:20 }}>
        {[
          { label:"Open Roles",       value: summary?.openJobs ?? 0,                 accent:"#fbbf24" },
          { label:"Total Candidates", value: total,                                   accent:"#60a5fa" },
          { label:"Hired",            value: totalByStage["hired"] ?? 0,             accent:"#4ade80" },
          { label:"Follow-ups Due",   value: summary?.pendingFollowups?.length ?? 0, accent:"#f87171" },
        ].map(stat => (
          <div key={stat.label} style={{ ...s.card, borderTop:`3px solid ${stat.accent}` }}>
            <p style={{ margin:"0 0 10px", fontSize:11, fontWeight:600, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.06em" }}>
              {stat.label}
            </p>
            <p style={{ margin:0, fontSize:36, fontWeight:700, color:stat.accent, fontFamily:"monospace", lineHeight:1 }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Pipeline funnel */}
      {total > 0 && (
        <div style={{ ...s.card, marginBottom:20 }}>
          <h3 style={s.cardTitle}>Pipeline Funnel</h3>
          <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:80 }}>
            {STAGE_ORDER.filter(st => totalByStage[st]).map(stage => {
              const count = totalByStage[stage];
              const pct   = Math.round((count / total) * 100);
              return (
                <div key={stage} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  <span style={{ fontSize:10, color:"#6b7280", fontFamily:"monospace" }}>{count}</span>
                  <div style={{ width:"100%", borderRadius:"3px 3px 0 0", minHeight:6, height:`${Math.max(pct,8)}%`, background:STAGE_COLORS[stage], opacity:0.85 }} />
                  <span style={{ fontSize:9, color:"#4b5563", textAlign:"center" }}>{STAGE_LABELS[stage]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Two-col bottom: open roles + follow-ups */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:16 }}>
        <div style={s.card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <h3 style={{ ...s.cardTitle, marginBottom:0 }}>Open Roles</h3>
            <button onClick={() => navigate("/recruitment/jobs")}
              style={{ background:"none", border:"none", color:"#fbbf24", fontSize:12, cursor:"pointer", fontWeight:500 }}>
              View all →
            </button>
          </div>
          {!summary?.jobs?.length
            ? <p style={s.empty}>No open roles yet.</p>
            : summary.jobs.map(job => {
                const t = Object.values(job.stageCounts ?? {}).reduce((a,b) => a+b, 0);
                return (
                  <div key={job.id} onClick={() => navigate(`/recruitment/jobs/${job.id}`)}
                    style={s.listRow}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#374151"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#1f2937"}
                  >
                    <div>
                      <p style={{ margin:0, fontSize:13, fontWeight:600, color:"#f9fafb" }}>{job.title}</p>
                      <p style={{ margin:"2px 0 0", fontSize:11, color:"#6b7280" }}>
                        {job.department ?? "—"} · {t} candidate{t !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span style={{ color:"#374151" }}>›</span>
                  </div>
                );
              })
          }
        </div>

        <div style={s.card}>
          <h3 style={s.cardTitle}>Follow-ups Due</h3>
          {!summary?.pendingFollowups?.length
            ? <p style={s.empty}>All caught up!</p>
            : summary.pendingFollowups.map(item => (
                <div key={item.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #1f2937" }}>
                  <div>
                    <p style={{ margin:0, fontSize:13, color:"#e5e7eb", fontWeight:500 }}>
                      {item.channel?.charAt(0).toUpperCase() + item.channel?.slice(1)} outreach
                    </p>
                    <p style={{ margin:"2px 0 0", fontSize:11, color:"#6b7280" }}>#{item.id}</p>
                  </div>
                  <button onClick={async () => { await recruitmentAPI.updateOutreach(item.id, { status:"replied", repliedAt:new Date().toISOString() }); refresh(); }}
                    style={s.btnSmall}>
                    Mark replied
                  </button>
                </div>
              ))
          }
        </div>
      </div>

      {showCreate && <CreateJobModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); refresh(); }} />}
    </>
  );
}

const s = {
  card:      { background:"#111827", border:"1px solid #1f2937", borderRadius:12, padding:20, marginBottom:0 },
  cardTitle: { fontSize:13, fontWeight:600, color:"#f3f4f6", marginBottom:14, marginTop:0 },
  listRow:   { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", borderRadius:8, background:"#0d1117", border:"1px solid #1f2937", cursor:"pointer", marginBottom:8, transition:"border-color 0.15s" },
  empty:     { color:"#6b7280", fontSize:13, textAlign:"center", padding:"20px 0", margin:0 },
  btnPrimary:{ background:"#fbbf24", border:"none", borderRadius:8, padding:"8px 18px", color:"#000", fontSize:13, fontWeight:700, cursor:"pointer" },
  btnSmall:  { background:"#1f2937", border:"1px solid #374151", borderRadius:6, padding:"5px 12px", color:"#fbbf24", fontSize:11, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" },
};