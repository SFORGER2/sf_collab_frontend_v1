// RecruitmentLayout.jsx
//
// CRITICAL: This must be placed INSIDE the <Route path="/"> Layout block in App.jsx
// (same level as erp-dashboard, milestones, etc.) — NOT outside it.
//
// The Layout component provides the sidebar, top navbar, and background.
// This file only adds the sub-nav strip and renders <Outlet />.
// NO wrapper div with background, minHeight, maxWidth, or position.

import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { recruitmentAPI } from "@/utils/APIs/recruitmentAPI";

const NAV = [
  { label: "Overview",  path: "/recruitment" },
  { label: "Jobs",      path: "/recruitment/jobs" },
  { label: "Pipeline",  path: "/recruitment/pipeline" },
  { label: "Referrals", path: "/recruitment/referrals" },
];

export default function RecruitmentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    recruitmentAPI.getDashboard().then(r => setSummary(r.data)).catch(() => {});
  }, []);

  const isActive = (path) =>
    path === "/recruitment"
      ? location.pathname === "/recruitment"
      : location.pathname.startsWith(path);

  // Matches ActivityMonitorPage / ERPDashboard exactly:
  // padding + width:100% only — no background, no minHeight, no centering
  return (
    <div style={{ padding: "28px 32px", width: "100%", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Sub-nav strip */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        paddingBottom: 16,
        marginBottom: 24,
        borderBottom: "1px solid #1f2937",
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: "#fbbf24", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 12 }}>
          Recruit
          {summary && (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "monospace", fontWeight: 400, letterSpacing: 0, textTransform: "none" }}>
              {summary.openJobs} open · {summary.pendingFollowups?.length ?? 0} follow-ups
            </span>
          )}
        </span>

        <nav style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {NAV.map(item => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  background: active ? "rgba(251,191,36,0.12)" : "transparent",
                  color: active ? "#fbbf24" : "rgba(255,255,255,0.4)",
                  transition: "all 0.15s",
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Child page */}
      <Outlet context={{ summary, setSummary }} />
    </div>
  );
}