import React, { useState, useMemo, useRef, useEffect } from "react";

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

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

// --- ICONS ---

const SearchIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ChevronUpIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const ChevronDownIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronsUpDownIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="7 15 12 20 17 15" />
    <polyline points="7 9 12 4 17 9" />
  </svg>
);

const MoreVerticalIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <circle cx="12" cy="5" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="12" cy="19" r="1.6" />
  </svg>
);

const InboxIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
  </svg>
);

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
      className={`${styles[status] || styles.pending} inline-flex items-center border text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full whitespace-nowrap`}
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

// --- NEW UI PRIMITIVES (presentation only, no business logic) ---

const SortableHeader = ({ label, sortKey, activeSort, onSort, align = "left" }) => {
  const isActive = activeSort?.key === sortKey;
  const alignClass =
    align === "right" ? "text-right justify-end" : align === "center" ? "text-center justify-center" : "text-left justify-start";

  return (
    <th
      scope="col"
      className={`sticky top-0 z-10 bg-[#151B2B] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 ${
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"
      }`}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex w-full items-center gap-1 transition-colors hover:text-slate-300 ${alignClass} ${
          isActive ? "text-slate-300" : ""
        }`}
      >
        {label}
        {isActive ? (
          activeSort.direction === "asc" ? (
            <ChevronUpIcon className="h-3 w-3 text-blue-400" />
          ) : (
            <ChevronDownIcon className="h-3 w-3 text-blue-400" />
          )
        ) : (
          <ChevronsUpDownIcon className="h-3 w-3 text-slate-700" />
        )}
      </button>
    </th>
  );
};

const EmptyState = ({ message, onClear }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5">
      <InboxIcon className="h-5 w-5 text-slate-500" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-300">No results found</p>
      <p className="mt-1 text-xs text-slate-500">{message}</p>
    </div>
    {onClear && (
      <button
        onClick={onClear}
        className="mt-1 rounded-lg border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-colors hover:bg-white/5"
      >
        Clear search &amp; filters
      </button>
    )}
  </div>
);

const TablePagination = ({ page, totalPages, totalRows, pageSize, onPageChange, onPageSizeChange }) => {
  const from = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRows);

  return (
    <div className="flex flex-col-reverse items-center justify-between gap-3 border-t border-white/5 px-5 py-3 sm:flex-row">
      <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-slate-500">
        <span>Rows</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-md border border-white/10 bg-[#0F1423] px-2 py-1 text-[10px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {ROWS_PER_PAGE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span className="hidden normal-case tracking-normal text-slate-600 sm:inline">
          Showing {from}-{to} of {totalRows}
        </span>
      </div>

      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-md border border-white/10 px-2.5 py-1 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Prev
        </button>
        <span className="px-1 normal-case tracking-normal text-slate-500">
          Page {page} of {totalPages || 1}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-md border border-white/10 px-2.5 py-1 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </div>
  );
};

const RowActionMenu = ({ items }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="More actions"
        className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
      >
        <MoreVerticalIcon className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-20 w-48 overflow-hidden rounded-lg border border-white/10 bg-[#1B2334] shadow-2xl shadow-black/40">
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                item.onClick?.();
                setOpen(false);
              }}
              className="block w-full px-3 py-2 text-left text-xs font-medium text-slate-300 transition-colors hover:bg-white/5"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const SearchInput = ({ value, onChange, placeholder }) => (
  <div className="relative w-full sm:max-w-xs">
    <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-white/10 bg-[#0F1423] py-2 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  </div>
);

const FilterDropdown = ({ value, onChange, options, allLabel = "All" }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full rounded-lg border border-white/10 bg-[#0F1423] px-3 py-2 text-xs font-medium text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-48"
  >
    <option value="">{allLabel}</option>
    {options.map((opt) => (
      <option key={opt} value={opt}>
        {opt}
      </option>
    ))}
  </select>
);

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

  // ---- Presentation-only derived data (does not affect calculations above) ----
  const enrichedPayouts = useMemo(
    () =>
      sortedPayouts.map((p) => {
        const share = (p.approvedPoints / totalPoints) * 100;
        const estimate = (teamPool * share) / 100;
        return { ...p, share, estimate };
      }),
    [sortedPayouts, totalPoints, teamPool],
  );

  // ---- Estimated Payouts table UI state ----
  const [estSearch, setEstSearch] = useState("");
  const [estStatusFilter, setEstStatusFilter] = useState("");
  const [estSort, setEstSort] = useState({ key: null, direction: "asc" });
  const [estPage, setEstPage] = useState(1);
  const [estPageSize, setEstPageSize] = useState(ROWS_PER_PAGE_OPTIONS[0]);

  const estStatusOptions = useMemo(
    () => Array.from(new Set(enrichedPayouts.map((p) => p.status))),
    [enrichedPayouts],
  );

  const filteredEstPayouts = useMemo(() => {
    return enrichedPayouts.filter((p) => {
      const matchesSearch = p.userName.toLowerCase().includes(estSearch.toLowerCase());
      const matchesStatus = !estStatusFilter || p.status === estStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [enrichedPayouts, estSearch, estStatusFilter]);

  const sortedEstPayouts = useMemo(() => {
    if (!estSort.key) return filteredEstPayouts;
    const copy = [...filteredEstPayouts];
    copy.sort((a, b) => {
      let av, bv;
      switch (estSort.key) {
        case "userName":
          av = a.userName.toLowerCase();
          bv = b.userName.toLowerCase();
          break;
        case "points":
          av = a.approvedPoints;
          bv = b.approvedPoints;
          break;
        case "share":
          av = a.share;
          bv = b.share;
          break;
        case "estimate":
          av = a.estimate;
          bv = b.estimate;
          break;
        default:
          av = 0;
          bv = 0;
      }
      if (av < bv) return estSort.direction === "asc" ? -1 : 1;
      if (av > bv) return estSort.direction === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filteredEstPayouts, estSort]);

  const estTotalPages = Math.max(1, Math.ceil(sortedEstPayouts.length / estPageSize));
  const estCurrentPage = Math.min(estPage, estTotalPages);
  const pagedEstPayouts = useMemo(() => {
    const start = (estCurrentPage - 1) * estPageSize;
    return sortedEstPayouts.slice(start, start + estPageSize);
  }, [sortedEstPayouts, estCurrentPage, estPageSize]);

  const handleEstSort = (key) => {
    setEstSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  };

  useEffect(() => {
    setEstPage(1);
  }, [estSearch, estStatusFilter, estPageSize]);

  const clearEstFilters = () => {
    setEstSearch("");
    setEstStatusFilter("");
  };

  // ---- Held Payouts table UI state ----
  const [heldSearch, setHeldSearch] = useState("");
  const [heldReasonFilter, setHeldReasonFilter] = useState("");
  const [heldSort, setHeldSort] = useState({ key: null, direction: "asc" });
  const [heldPage, setHeldPage] = useState(1);
  const [heldPageSize, setHeldPageSize] = useState(ROWS_PER_PAGE_OPTIONS[0]);

  const heldReasonOptions = useMemo(
    () => Array.from(new Set(MOCK_HELD_PAYOUTS.map((p) => p.reason))),
    [],
  );

  const filteredHeldPayouts = useMemo(() => {
    return MOCK_HELD_PAYOUTS.filter((p) => {
      const matchesSearch = p.userName.toLowerCase().includes(heldSearch.toLowerCase());
      const matchesReason = !heldReasonFilter || p.reason === heldReasonFilter;
      return matchesSearch && matchesReason;
    });
  }, [heldSearch, heldReasonFilter]);

  const sortedHeldPayouts = useMemo(() => {
    if (!heldSort.key) return filteredHeldPayouts;
    const copy = [...filteredHeldPayouts];
    copy.sort((a, b) => {
      let av, bv;
      switch (heldSort.key) {
        case "userName":
          av = a.userName.toLowerCase();
          bv = b.userName.toLowerCase();
          break;
        case "reason":
          av = a.reason.toLowerCase();
          bv = b.reason.toLowerCase();
          break;
        default:
          av = 0;
          bv = 0;
      }
      if (av < bv) return heldSort.direction === "asc" ? -1 : 1;
      if (av > bv) return heldSort.direction === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filteredHeldPayouts, heldSort]);

  const heldTotalPages = Math.max(1, Math.ceil(sortedHeldPayouts.length / heldPageSize));
  const heldCurrentPage = Math.min(heldPage, heldTotalPages);
  const pagedHeldPayouts = useMemo(() => {
    const start = (heldCurrentPage - 1) * heldPageSize;
    return sortedHeldPayouts.slice(start, start + heldPageSize);
  }, [sortedHeldPayouts, heldCurrentPage, heldPageSize]);

  const handleHeldSort = (key) => {
    setHeldSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  };

  useEffect(() => {
    setHeldPage(1);
  }, [heldSearch, heldReasonFilter, heldPageSize]);

  const clearHeldFilters = () => {
    setHeldSearch("");
    setHeldReasonFilter("");
  };

  const handleCopyUserId = (userId) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(userId).catch(() => {});
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
          {/* Estimated Payouts Table (Leaderboard) */}
          <div className="bg-[#151B2B] border border-white/5 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-white/5 flex flex-col gap-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Estimated Payouts (Active Contributors)
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                  TOTAL POOL POINTS: {totalPoints.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-b border-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <SearchInput value={estSearch} onChange={setEstSearch} placeholder="Search contributors…" />
              <FilterDropdown
                value={estStatusFilter}
                onChange={setEstStatusFilter}
                options={estStatusOptions}
                allLabel="All statuses"
              />
            </div>

            {sortedEstPayouts.length === 0 ? (
              <EmptyState
                message="No contributors match your search or filter."
                onClear={estSearch || estStatusFilter ? clearEstFilters : undefined}
              />
            ) : (
              <>
                <div className="max-h-[420px] overflow-auto">
                  <table className="w-full min-w-[640px] text-left border-collapse">
                    <thead>
                      <tr>
                        <SortableHeader label="Contributor" sortKey="userName" activeSort={estSort} onSort={handleEstSort} />
                        <SortableHeader label="Points" sortKey="points" activeSort={estSort} onSort={handleEstSort} align="right" />
                        <SortableHeader label="Share %" sortKey="share" activeSort={estSort} onSort={handleEstSort} align="right" />
                        <SortableHeader label="Estimate" sortKey="estimate" activeSort={estSort} onSort={handleEstSort} align="right" />
                        <th className="sticky top-0 z-10 bg-[#151B2B] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">
                          Status
                        </th>
                        <th className="sticky top-0 z-10 bg-[#151B2B] px-5 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {pagedEstPayouts.map((p) => (
                        <tr key={p.id} className="hover:bg-white/[0.03] transition-colors group">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
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
                              {p.share.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className="text-sm font-bold text-white">
                              $
                              {p.estimate.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <StatusBadge status="estimated" />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openAudit(p)}
                                className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-colors"
                              >
                                Audit
                              </button>
                              <RowActionMenu
                                items={[
                                  { label: "View audit trail", onClick: () => openAudit(p) },
                                  { label: "Copy user ID", onClick: () => handleCopyUserId(p.userId) },
                                ]}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  page={estCurrentPage}
                  totalPages={estTotalPages}
                  totalRows={sortedEstPayouts.length}
                  pageSize={estPageSize}
                  onPageChange={(p) => setEstPage(Math.min(Math.max(1, p), estTotalPages))}
                  onPageSizeChange={setEstPageSize}
                />
              </>
            )}
          </div>

          {/* Held Payouts Table */}
          <div className="bg-[#151B2B] border border-white/5 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Held Payouts (Action Required)
              </p>
            </div>

            <div className="flex flex-col gap-3 border-b border-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <SearchInput value={heldSearch} onChange={setHeldSearch} placeholder="Search contributors…" />
              <FilterDropdown
                value={heldReasonFilter}
                onChange={setHeldReasonFilter}
                options={heldReasonOptions}
                allLabel="All hold reasons"
              />
            </div>

            {sortedHeldPayouts.length === 0 ? (
              <EmptyState
                message="No held payouts match your search or filter."
                onClear={heldSearch || heldReasonFilter ? clearHeldFilters : undefined}
              />
            ) : (
              <>
                <div className="max-h-[420px] overflow-auto">
                  <table className="w-full min-w-[560px] text-left border-collapse">
                    <thead>
                      <tr>
                        <SortableHeader label="Contributor" sortKey="userName" activeSort={heldSort} onSort={handleHeldSort} />
                        <SortableHeader label="Hold Reason" sortKey="reason" activeSort={heldSort} onSort={handleHeldSort} />
                        <th className="sticky top-0 z-10 bg-[#151B2B] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">
                          Status
                        </th>
                        <th className="sticky top-0 z-10 bg-[#151B2B] px-5 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {pagedHeldPayouts.map((p) => (
                        <tr key={p.id} className="hover:bg-white/[0.03] transition-colors group">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold text-xs shrink-0">
                                {p.userName.charAt(0)}
                              </div>
                              <span className="text-sm font-medium text-slate-200">
                                {p.userName}
                              </span>
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
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button className="h-8 px-3 bg-transparent border border-white/10 hover:bg-white/5 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded transition-colors">
                                Resolve
                              </button>
                              <RowActionMenu
                                items={[
                                  { label: "Copy user ID", onClick: () => handleCopyUserId(p.userId) },
                                  { label: "Copy hold reason", onClick: () => handleCopyUserId(p.reason) },
                                ]}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  page={heldCurrentPage}
                  totalPages={heldTotalPages}
                  totalRows={sortedHeldPayouts.length}
                  pageSize={heldPageSize}
                  onPageChange={(p) => setHeldPage(Math.min(Math.max(1, p), heldTotalPages))}
                  onPageSizeChange={setHeldPageSize}
                />
              </>
            )}
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
