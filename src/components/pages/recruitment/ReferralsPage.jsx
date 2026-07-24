import { useState, useEffect } from "react";
import { recruitmentAPI } from "@/utils/APIs/recruitmentAPI";
import { CreateReferralModal } from "./index";

export default function ReferralsPage() {
  const [jobs, setJobs]               = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [referrals, setReferrals]     = useState([]);
  const [loading, setLoading]         = useState(false);
  const [showCreate, setShowCreate]   = useState(false);

  useEffect(() => {
    recruitmentAPI.listJobs({ isOpen: true })
      .then(r => { setJobs(r.data); if (r.data.length) setSelectedJob(r.data[0].id); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedJob) return;
    setLoading(true);
    recruitmentAPI.listReferrals(selectedJob)
      .then(r => setReferrals(r.data))
      .finally(() => setLoading(false));
  }, [selectedJob]);

  const refresh = () => selectedJob &&
    recruitmentAPI.listReferrals(selectedJob).then(r => setReferrals(r.data));

  const unpaid = referrals.filter(r => !r.bonusPaid).length;

  return (
    <>
      {/* Header */}
      <div style={s.topBar}>
        <div>
          <h1 style={s.h1}>Referrals</h1>
          <p style={s.sub}>Track who referred whom and manage referral bonuses.</p>
        </div>
        <button onClick={() => setShowCreate(true)} disabled={!selectedJob}
          style={{ ...s.btnPrimary, opacity: !selectedJob ? 0.4 : 1 }}>
          + Submit Referral
        </button>
      </div>

      {/* Job selector tabs */}
      {jobs.length > 1 && (
        <div style={s.tabRow}>
          {jobs.map(job => (
            <button key={job.id} onClick={() => setSelectedJob(job.id)}
              style={selectedJob === job.id ? s.tabActive : s.tab}>
              {job.title}
            </button>
          ))}
        </div>
      )}

      {/* Stats */}
      {referrals.length > 0 && (
        <div style={s.grid3}>
          {[
            { label: "Total Referrals", value: referrals.length,                             color: "#f9fafb" },
            { label: "In Pipeline",     value: referrals.filter(r => r.applicantId).length,  color: "#60a5fa" },
            { label: "Unpaid Bonuses",  value: unpaid, color: unpaid > 0 ? "#fbbf24" : "#4ade80" },
          ].map(stat => (
            <div key={stat.label} style={{ ...s.card, textAlign: "center", marginBottom: 0 }}>
              <p style={{ fontSize: 28, fontWeight: 700, fontFamily: "monospace", color: stat.color, margin: 0 }}>
                {stat.value}
              </p>
              <p style={{ fontSize: 11, color: "#6b7280", margin: "4px 0 0", fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {!selectedJob ? (
        <div style={{ textAlign: "center", padding: "50px 0", color: "#6b7280" }}>
          <p style={{ fontSize: 34, marginBottom: 10 }}>📋</p>
          <p style={{ fontSize: 14, color: "#9ca3af" }}>No open roles. Create a job first.</p>
        </div>
      ) : loading ? (
        <Spinner />
      ) : !referrals.length ? (
        <div style={{ textAlign: "center", padding: "50px 0", color: "#6b7280" }}>
          <p style={{ fontSize: 30, marginBottom: 10 }}>🔗</p>
          <p style={{ fontSize: 14, color: "#9ca3af", margin: "0 0 8px" }}>No referrals for this role yet.</p>
          <button onClick={() => setShowCreate(true)}
            style={{ background: "none", border: "none", color: "#fbbf24", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
            Submit the first referral →
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {referrals.map(r => (
            <div key={r.id} style={s.card}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                {/* Avatar */}
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1f2937",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 14, color: "#9ca3af", fontWeight: 600 }}>
                    {r.candidateName?.[0]?.toUpperCase() ?? "?"}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#f9fafb" }}>{r.candidateName}</span>
                    {r.bonusPaid && (
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20,
                        background: "rgba(34,197,94,0.15)", color: "#4ade80", fontWeight: 600 }}>
                        Bonus paid
                      </span>
                    )}
                    {r.applicantId && (
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20,
                        background: "rgba(96,165,250,0.15)", color: "#60a5fa", fontWeight: 600 }}>
                        In pipeline
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 3 }}>
                    {r.candidateEmail    && <span style={{ fontSize: 12, color: "#6b7280" }}>{r.candidateEmail}</span>}
                    {r.candidateLinkedin && (
                      <a href={r.candidateLinkedin} target="_blank" rel="noreferrer"
                        style={{ fontSize: 12, color: "#60a5fa", textDecoration: "none" }}>LinkedIn</a>
                    )}
                  </div>
                  {r.note && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#4b5563", fontStyle: "italic" }}>{r.note}</p>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: "#4b5563", fontFamily: "monospace" }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                  {!r.bonusPaid && (
                    <button
                      onClick={async () => { await recruitmentAPI.updateReferral(r.id, { bonusPaid: true }); refresh(); }}
                      style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
                        borderRadius: 6, padding: "5px 12px", color: "#4ade80", fontSize: 11,
                        fontWeight: 600, cursor: "pointer" }}>
                      Mark paid
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && selectedJob && (
        <CreateReferralModal
          jobId={selectedJob}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); refresh(); }}
        />
      )}
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

const s = {
  topBar:    { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 },
  h1:        { fontSize: 24, fontWeight: 700, color: "#f9fafb", margin: 0 },
  sub:       { color: "#6b7280", fontSize: 13, marginTop: 4, margin: "4px 0 0" },
  card:      { background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: 20, marginBottom: 0 },
  grid3:     { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 16 },
  tabRow:    { display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" },
  tab:       { background: "#1f2937", border: "1px solid #374151", borderRadius: 6, padding: "6px 14px", color: "#9ca3af", fontSize: 13, cursor: "pointer" },
  tabActive: { background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 6, padding: "6px 14px", color: "#fbbf24", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  btnPrimary:{ background: "#fbbf24", border: "none", borderRadius: 8, padding: "8px 18px", color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer" },
};