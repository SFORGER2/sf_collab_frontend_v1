import React, { useState, useMemo } from "react";

// --- MOCK DATA ---
const MOCK_POOL = {
  id: "pool-2026-05",
  title: "May 2026 Revenue Cycle",
  grossRevenue: 125000,
  refunds: 4200,
  chargebacks: 1500,
  manualExclusions: 0,
  teamSharePercentage: 40,
  status: "calculating",
};

const MOCK_PAYOUTS = [
  {
    id: "p1",
    userId: "u1",
    userName: "Alice Chen",
    approvedPoints: 450,
    status: "estimated",
    lastActivity: "2026-05-14",
  },
  {
    id: "p2",
    userId: "u2",
    userName: "Bob Dev",
    approvedPoints: 1250,
    status: "estimated",
    lastActivity: "2026-05-13",
  }, // Trigger warning (>50% if total points < 2500)
  {
    id: "p3",
    userId: "u3",
    userName: "Carol Smith",
    approvedPoints: 320,
    status: "estimated",
    lastActivity: "2026-05-14",
  },
  {
    id: "p4",
    userId: "u5",
    userName: "Eve Designer",
    approvedPoints: 280,
    status: "estimated",
    lastActivity: "2026-05-12",
  },
];

const MOCK_HELD_PAYOUTS = [
  {
    id: "p5",
    userId: "u6",
    userName: "Frank Finance",
    approvedPoints: 150,
    status: "held",
    reason: "Missing Identity Verification",
    lastActivity: "2026-05-10",
  },
  {
    id: "p6",
    userId: "u7",
    userName: "Grace Growth",
    approvedPoints: 210,
    status: "held",
    reason: "Suspicious Point Spike",
    lastActivity: "2026-05-11",
  },
];

const MOCK_AUDIT_LOGS = {
  p2: [
    {
      id: "a1",
      actor: "System",
      action: "Points Calculation",
      reason: "Automated milestone approval",
      timestamp: "2026-05-13 14:20",
    },
    {
      id: "a2",
      actor: "David Admin",
      action: "Manual Review",
      reason: "Verified high-complexity task proof",
      timestamp: "2026-05-14 09:45",
    },
  ],
};

// --- SUB-COMPONENTS ---

const StatusBadge = ({ status }) => {
  const styles = {
    approved: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    pending: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    held: "bg-red-500/10 border-red-500/20 text-red-400",
    estimated: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  };

  return (
    <span
      className={`${styles[status] || styles.pending} border text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full whitespace-nowrap`}
    >
      {status}
    </span>
  );
};

const TeamPoolCard = ({ pool }) => {
  const deductions = pool.refunds + pool.chargebacks + pool.manualExclusions;
  const netRevenue = pool.grossRevenue - deductions;
  const teamPool = (netRevenue * pool.teamSharePercentage) / 100;

  return (
    <div className="bg-[#151B2B] border border-white/5 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
            Active Revenue Pool
          </p>
          <h2 className="text-lg font-semibold text-white tracking-wide">
            {pool.title}
          </h2>
        </div>
        <StatusBadge
          status={pool.status === "calculating" ? "estimated" : pool.status}
        />
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
            Gross Revenue
          </p>
          <p className="text-2xl font-bold text-white tracking-tight">
            ${pool.grossRevenue.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
            Net Revenue
          </p>
          <p className="text-2xl font-bold text-slate-300 tracking-tight">
            ${netRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-[#0F1423]/50 border border-white/5 rounded-lg p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">
            Refunds, Chargebacks & Exclusions
          </span>
          <span className="text-red-400">-${deductions.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm pt-2 border-t border-white/5">
          <span className="text-slate-300 font-medium">
            Team Share ({pool.teamSharePercentage}%)
          </span>
          <span className="text-blue-500 font-bold text-lg">
            ${teamPool.toLocaleString()}
          </span>
        </div>
      </div>

      <button className="w-full mt-6 h-11 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-500/20 border border-blue-400/20 transition-all">
        Lock & Submit for Admin Review
      </button>
    </div>
  );
};

const ConcentrationWarning = ({ isVisible, userName, sharePercentage }) => {
  if (!isVisible) return null;
  return (
    <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 font-bold text-red-400 text-xl">
        !
      </div>
      <div>
        <p className="text-sm font-bold text-red-400 uppercase tracking-wider mb-0.5">
          Payout Concentration Warning
        </p>
        <p className="text-sm text-slate-300">
          User <span className="text-white font-bold">{userName}</span> controls{" "}
          <span className="text-white font-bold">
            {sharePercentage.toFixed(1)}%
          </span>{" "}
          of the current pool. This exceeds the 50% anti-abuse threshold and
          requires manual review.
        </p>
      </div>
    </div>
  );
};

const PayoutAuditModal = ({ isOpen, onClose, payout, logs }) => {
  if (!isOpen || !payout) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#151B2B] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
              Audit Trail
            </p>
            <h3 className="text-lg font-semibold text-white">
              {payout.userName} - Payout Audit
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {logs && logs.length > 0 ? (
            <div className="space-y-6">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="relative pl-6 border-l border-white/5 pb-2"
                >
                  <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-bold text-white">{log.action}</p>
                    <p className="text-[10px] font-mono text-slate-500">
                      {log.timestamp}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    Performed by{" "}
                    <span className="text-slate-200">{log.actor}</span>
                  </p>
                  <p className="text-sm text-slate-300 bg-[#0F1423] p-3 rounded-lg border border-white/5 italic">
                    "{log.reason}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">
              No audit logs found for this payout.
            </p>
          )}
        </div>

        <div className="p-6 border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="h-10 px-6 bg-transparent border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

export default function RevenueShareDashboard() {
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Calculate totals, shares, and create sorted leaderboard
  const { totalPoints, teamPool, concentrationData, sortedPayouts } =
    useMemo(() => {
      const points = MOCK_PAYOUTS.reduce((sum, p) => sum + p.approvedPoints, 0);
      const deductions =
        MOCK_POOL.refunds + MOCK_POOL.chargebacks + MOCK_POOL.manualExclusions;
      const net = MOCK_POOL.grossRevenue - deductions;
      const pool = (net * MOCK_POOL.teamSharePercentage) / 100;

      // Check for concentration
      let maxShare = 0;
      let maxUser = "";
      MOCK_PAYOUTS.forEach((p) => {
        const share = (p.approvedPoints / points) * 100;
        if (share > maxShare) {
          maxShare = share;
          maxUser = p.userName;
        }
      });

      // Create sorted leaderboard
      const sorted = [...MOCK_PAYOUTS].sort(
        (a, b) => b.approvedPoints - a.approvedPoints,
      );

      return {
        totalPoints: points,
        teamPool: pool,
        concentrationData: {
          isWarning: maxShare > 50,
          userName: maxUser,
          sharePercentage: maxShare,
        },
        sortedPayouts: sorted,
      };
    }, []);

  const openAudit = (payout) => {
    setSelectedPayout(payout);
    setIsAuditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
            Revenue Share Dashboard
          </h1>
          <p className="text-slate-400 text-sm">
            Manage team contribution points and distribution cycles.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="h-10 px-4 bg-transparent border border-white/10 hover:bg-white/5 text-slate-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2">
            Payout History
          </button>
          <button className="h-10 px-4 bg-transparent border border-white/10 hover:bg-white/5 text-slate-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2">
            Logic Guide
          </button>
        </div>
      </div>

      <ConcentrationWarning
        isVisible={concentrationData.isWarning}
        userName={concentrationData.userName}
        sharePercentage={concentrationData.sharePercentage}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Pool Stats */}
        <div className="lg:col-span-1">
          <TeamPoolCard pool={MOCK_POOL} />
        </div>

        {/* Right Column: Tables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Payouts Table (Leaderboard) */}
          <div className="bg-[#151B2B] border border-white/5 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Estimated Payouts (Active Contributors)
              </p>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                TOTAL POOL POINTS: {totalPoints.toLocaleString()}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0F1423]/30">
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Contributor
                    </th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">
                      Points
                    </th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">
                      Share %
                    </th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">
                      Estimate
                    </th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">
                      Status
                    </th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedPayouts.map((p) => {
                    const share = (p.approvedPoints / totalPoints) * 100;
                    const estimate = (teamPool * share) / 100;
                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                              {p.userName.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-slate-200">
                              {p.userName}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-mono text-slate-300">
                            {p.approvedPoints}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-mono text-slate-400">
                            {share.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-bold text-white">
                            $
                            {estimate.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <StatusBadge status="estimated" />
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => openAudit(p)}
                            className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-colors"
                          >
                            Audit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Held Payouts Table */}
          <div className="bg-[#151B2B] border border-white/5 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Held Payouts (Action Required)
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0F1423]/30">
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Contributor
                    </th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Hold Reason
                    </th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">
                      Status
                    </th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {MOCK_HELD_PAYOUTS.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 text-sm font-medium text-slate-200">
                          {p.userName}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-red-400/80 italic">
                          {p.reason}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <StatusBadge status="held" />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button className="h-8 px-3 bg-transparent border border-white/10 hover:bg-white/5 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded transition-colors">
                          Resolve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <PayoutAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        payout={selectedPayout}
        logs={selectedPayout ? MOCK_AUDIT_LOGS[selectedPayout.id] : []}
      />
    </div>
  );
}
