import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { recruitmentAPI } from "@/utils/APIs/recruitmentAPI";
import { LogOutreachModal } from "./index";

const SC = { sourced:"#6b7280",contacted:"#3b82f6",responded:"#8b5cf6",screening:"#f59e0b",interviewing:"#f97316",offer_sent:"#10b981",hired:"#22c55e",rejected:"#ef4444",withdrawn:"#6b7280" };
const STAGES = ["sourced","contacted","responded","screening","interviewing","offer_sent","hired","rejected","withdrawn"];
const CH = { email:"✉️", linkedin:"💼", twitter:"🐦", phone:"📞", referral:"🔗", other:"💬" };

export default function ApplicantDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [movingStage, setMoving]  = useState(false);
  const [showOutreach, setShowO]  = useState(false);
  const [editNotes, setEditNotes] = useState(false);
  const [notes, setNotes]         = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const r = await recruitmentAPI.getApplicant(id);
      setData(r.data);
      setNotes(r.data.notes ?? "");
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const moveStage = async (stage) => {
    if (stage === data.stage || movingStage) return;
    setMoving(true);
    try { await recruitmentAPI.moveStage(id, { stage }); load(); }
    finally { setMoving(false); }
  };

  const saveNotes = async () => { await recruitmentAPI.updateApplicant(id, { notes }); setEditNotes(false); };

  if (loading) return (
    <div style={{ textAlign: "center", padding: 50 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #1f2937",
        borderTop: "3px solid #fbbf24", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!data) return <p style={{ color: "#6b7280", textAlign: "center", paddingTop: 60 }}>Applicant not found.</p>;

  const sc = SC[data.stage] ?? "#6b7280";

  return (
    <>
      <button onClick={() => navigate(-1)}
        style={{ background: "none", border: "none", color: "#6b7280", fontSize: 13,
          cursor: "pointer", padding: "0 0 16px", display: "block" }}>
        ← Back
      </button>

      {/* Hero card */}
      <div style={{ ...s.card, borderLeft: `3px solid ${sc}`, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#f9fafb" }}>{data.name}</h1>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                background: `${sc}22`, color: sc, textTransform: "capitalize" }}>
                {data.stage?.replace("_", " ")}
              </span>
              {data.isArchived && (
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20,
                  background: "#1f2937", color: "#6b7280" }}>Archived</span>
              )}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
              {data.email    && <a href={`mailto:${data.email}`} style={s.link}>✉️ {data.email}</a>}
              {data.phone    && <span style={s.meta}>📞 {data.phone}</span>}
              {data.linkedin && <a href={data.linkedin} target="_blank" rel="noreferrer" style={s.link}>💼 LinkedIn</a>}
              {data.portfolio && <a href={data.portfolio} target="_blank" rel="noreferrer" style={{ ...s.link, color: "#9ca3af" }}>🌐 Portfolio</a>}
              {data.resumeUrl && <a href={data.resumeUrl} target="_blank" rel="noreferrer" style={{ ...s.link, color: "#fbbf24" }}>📄 Resume</a>}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
            {data.score != null && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 30, fontWeight: 700, fontFamily: "monospace", color: "#fbbf24" }}>{data.score}</div>
                <div style={{ fontSize: 10, color: "#6b7280" }}>fit score</div>
              </div>
            )}
            <button onClick={async () => { await recruitmentAPI.updateApplicant(id, { isArchived: !data.isArchived }); load(); }}
              style={s.btnGhost}>
              {data.isArchived ? "Unarchive" : "Archive"}
            </button>
          </div>
        </div>
      </div>

      {/* Body: left col + right history */}
      <div style={s.bodyGrid}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Stage mover */}
          <div style={s.card}>
            <h3 style={s.cardTitle}>Move Stage</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {STAGES.map(stage => {
                const active = data.stage === stage;
                return (
                  <button key={stage} onClick={() => moveStage(stage)} disabled={movingStage}
                    style={{
                      padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                      fontSize: 12, fontWeight: 500, textTransform: "capitalize",
                      background: active ? `${SC[stage]}22` : "#1f2937",
                      color: active ? SC[stage] : "#9ca3af",
                      opacity: movingStage ? 0.5 : 1,
                    }}>
                    {stage.replace("_", " ")}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Outreach log */}
          <div style={s.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ ...s.cardTitle, marginBottom: 0 }}>Outreach ({data.outreachLogs?.length ?? 0})</h3>
              <button onClick={() => setShowO(true)} style={s.btnSmall}>+ Log</button>
            </div>
            {!data.outreachLogs?.length
              ? <p style={s.empty}>No outreach logged yet.</p>
              : data.outreachLogs.map(log => {
                  const lc = log.status === "replied" ? "#22c55e" : log.status === "bounced" ? "#ef4444" : "#6b7280";
                  return (
                    <div key={log.id} style={{ display: "flex", gap: 10, padding: 12,
                      background: "#0d1117", borderRadius: 8, border: "1px solid #1f2937", marginBottom: 8 }}>
                      <span style={{ fontSize: 15, flexShrink: 0 }}>{CH[log.channel] ?? "💬"}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#e5e7eb", textTransform: "capitalize" }}>
                            {log.channel}
                          </span>
                          <span style={{ fontSize: 10, padding: "1px 8px", borderRadius: 20,
                            background: `${lc}22`, color: lc }}>
                            {log.status}
                          </span>
                          <span style={{ fontSize: 10, color: "#4b5563", fontFamily: "monospace", marginLeft: "auto" }}>
                            {new Date(log.sentAt).toLocaleDateString()}
                          </span>
                        </div>
                        {log.subject && <p style={{ margin: "3px 0 0", fontSize: 12, color: "#6b7280",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.subject}</p>}
                        {log.followUpAt && log.status !== "replied" && (
                          <p style={{ margin: "3px 0 0", fontSize: 11, color: "rgba(251,191,36,0.7)" }}>
                            Follow-up: {new Date(log.followUpAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
            }
          </div>

          {/* Notes */}
          <div style={s.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ ...s.cardTitle, marginBottom: 0 }}>Notes</h3>
              {editNotes
                ? <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setEditNotes(false)} style={s.btnGhost}>Cancel</button>
                    <button onClick={saveNotes} style={s.btnSmall}>Save</button>
                  </div>
                : <button onClick={() => setEditNotes(true)} style={s.btnGhost}>Edit</button>
              }
            </div>
            {editNotes
              ? <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={5}
                  style={{ width: "100%", background: "#0d1117", border: "1px solid #374151",
                    borderRadius: 8, padding: "10px 12px", color: "#f9fafb", fontSize: 13,
                    resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
                  placeholder="Add notes about this candidate..." />
              : <p style={{ margin: 0, fontSize: 13, color: data.notes ? "#d1d5db" : "#6b7280",
                  lineHeight: 1.6, whiteSpace: "pre-wrap", fontStyle: data.notes ? "normal" : "italic" }}>
                  {data.notes || "No notes yet. Click edit to add."}
                </p>
            }
          </div>
        </div>

        {/* Stage history */}
        <div style={{ ...s.card, height: "fit-content" }}>
          <h3 style={s.cardTitle}>Stage History</h3>
          {!data.stageHistory?.length
            ? <p style={s.empty}>No history yet.</p>
            : <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 8, top: 0, bottom: 0,
                  width: 1, background: "#1f2937" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {data.stageHistory.map(h => {
                    const c = SC[h.toStage] ?? "#6b7280";
                    return (
                      <div key={h.id} style={{ display: "flex", gap: 12 }}>
                        <div style={{ width: 16, height: 16, borderRadius: "50%",
                          background: `${c}33`, display: "flex", alignItems: "center",
                          justifyContent: "center", flexShrink: 0, zIndex: 1, marginTop: 2 }}>
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                            {h.fromStage && <>
                              <span style={{ fontSize: 11, color: "#6b7280", textTransform: "capitalize" }}>
                                {h.fromStage.replace("_", " ")}
                              </span>
                              <span style={{ fontSize: 11, color: "#374151" }}>→</span>
                            </>}
                            <span style={{ fontSize: 11, fontWeight: 600, color: c, textTransform: "capitalize" }}>
                              {h.toStage.replace("_", " ")}
                            </span>
                          </div>
                          {h.reason && <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6b7280" }}>{h.reason}</p>}
                          <p style={{ margin: "2px 0 0", fontSize: 10, color: "#4b5563", fontFamily: "monospace" }}>
                            {new Date(h.movedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
          }
        </div>
      </div>

      {showOutreach && (
        <LogOutreachModal
          applicantId={id}
          onClose={() => setShowO(false)}
          onLogged={() => { setShowO(false); load(); }}
        />
      )}
    </>
  );
}

const s = {
  card:      { background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: 20 },
  cardTitle: { fontSize: 13, fontWeight: 600, color: "#f3f4f6", marginBottom: 14, marginTop: 0 },
  bodyGrid:  { display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, alignItems: "start" },
  link:      { fontSize: 12, color: "#60a5fa", textDecoration: "none" },
  meta:      { fontSize: 12, color: "#6b7280" },
  empty:     { color: "#6b7280", fontSize: 13, textAlign: "center", padding: "16px 0", margin: 0 },
  btnGhost:  { background: "transparent", border: "1px solid #374151", borderRadius: 6,
               padding: "5px 12px", color: "#9ca3af", fontSize: 11, cursor: "pointer" },
  btnSmall:  { background: "#1f2937", border: "1px solid #374151", borderRadius: 6,
               padding: "5px 12px", color: "#fbbf24", fontSize: 11, fontWeight: 600, cursor: "pointer" },
};