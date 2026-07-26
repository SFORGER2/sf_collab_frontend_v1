import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, TrendingUp, Users, AlertCircle, 
  CheckCircle2, Clock, 
  Award, Calculator, Send, Plus, 
  ChevronDown, Gauge, BarChart2
} from "lucide-react";

import { useSelector } from "react-redux";
import { ERPPageHeader } from "../../erp/shared/ERPPageHeader";
import { ERPBannerManager } from "../../erp/shared/ERPBanner";
import { 
  WORKSPACES, 
  INITIAL_EXECUTION_SCORE, 
  INITIAL_KPI_DATA, 
  INITIAL_BURN_RATE, 
  INITIAL_ACTIVITY, 
  INITIAL_WARNINGS, 
  INITIAL_LEADERBOARD 
} from "./data/executionMockData";
import { Modal } from "./components/Modal"; // Keep their modal for now if needed, or inline a simple one

export default function ExecutionDashboard() {
  const { user } = useSelector(state => state.auth);
  const [timeRange, setTimeRange] = useState("week");
  const [currentWS, setCurrentWS] = useState(WORKSPACES[0]);
  const [isWSDropdownOpen, setIsWSDropdownOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState(INITIAL_LEADERBOARD);
  const [activity, setActivity] = useState(INITIAL_ACTIVITY);
  const [activityFilter, setActivityFilter] = useState("all");
  
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showFormula, setShowFormula] = useState(false);
  const [showSubmitProof, setShowSubmitProof] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proofData, setProofData] = useState({ task: "Auth Flow Implementation", details: "" });

  useEffect(() => {
    const simulateFetch = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsLoading(false);
    };
    simulateFetch();
  }, [currentWS.id, timeRange]);

  const handleBroadcastProof = () => {
    if (!proofData.details) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setTimeout(() => {
        const newProof = {
          id: Date.now(),
          user: "You",
          action: "broadcasted proof",
          target: proofData.task || "System Task",
          time: "Just now",
          type: "proof",
          status: "VALIDATED",
          details: proofData.details
        };
        setActivity(prev => [newProof, ...prev]);
        setIsSubmitting(false);
        setShowSubmitProof(false);
        setProofData({ task: "Auth Flow Implementation", details: "" });
        toast.success("Proof validated and broadcasted!");
      }, 1200);
    }, 1000);
  };

  const filteredActivity = useMemo(() => {
    if (activityFilter === "all") return activity;
    return activity.filter(a => a.status.toLowerCase().includes(activityFilter.toLowerCase()));
  }, [activity, activityFilter]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ERPPageHeader
          icon={<Gauge size={20} />}
          title="Execution Engine"
          description="Real-time workspace telemetry and performance metrics"
          breadcrumbs={[{ label: "ERP" }, { label: "Execution" }]}
          actions={
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "#111115", border: "1px solid rgba(255,255,255,0.06)" }}>
                {["day", "week", "month"].map(range => (
                  <button 
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      timeRange === range ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setShowSubmitProof(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg"
                style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff" }}
              >
                <Plus size={15} />
                Submit Proof
              </motion.button>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Left Column */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Execution Score Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden p-8 rounded-3xl"
              style={{ background: "#111115", border: "1px solid rgba(255,255,255,0.06)", borderTop: "2px solid #6366f1" }}
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <Gauge size={180} className="text-indigo-500" />
              </div>
              
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <div className="flex items-center gap-2 text-zinc-400 mb-6">
                    <Award size={18} className="text-indigo-400" />
                    <span className="text-xs font-bold tracking-widest uppercase">Reputation Score</span>
                  </div>
                  
                  <div className="flex items-baseline gap-2">
                    <motion.span 
                      key={currentWS.id} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="text-7xl font-black tracking-tighter text-white"
                    >
                      {currentWS.score}
                    </motion.span>
                    <span className="text-2xl text-zinc-600 font-medium">/10</span>
                    <button onClick={() => setShowFormula(true)} className="ml-4 p-2 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-indigo-400 transition-colors">
                      <Calculator size={18} />
                    </button>
                  </div>
                  
                  <div className="mt-8 flex items-center gap-4">
                    <div className="flex-1 p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Momentum</p>
                      <p className="text-sm font-bold text-emerald-400">Stable</p>
                    </div>
                    <div className="flex-1 p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Efficiency</p>
                      <p className="text-sm font-bold text-indigo-400">0.82x</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-4">Metric Breakdown</p>
                  {INITIAL_EXECUTION_SCORE.breakdown.map((item) => (
                    <div key={item.label} className="group">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-zinc-400">{item.label}</span>
                        <span className="text-xs font-bold text-white">{item.value.toFixed(1)}</span>
                      </div>
                      <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${item.value * 10}%` }} className="h-full rounded-full" style={{ backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {INITIAL_KPI_DATA[timeRange].map((kpi, i) => (
                <motion.div 
                  key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="p-5 rounded-2xl text-center"
                  style={{ background: "#111115", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex justify-center mb-2 text-indigo-400">{kpi.icon}</div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">{kpi.label}</p>
                  <p className="text-xl font-bold text-white">{kpi.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Activity & Capital */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
              <div className="p-6 rounded-2xl flex flex-col h-96" style={{ background: "#111115", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex flex-col gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-indigo-400" />
                    <h3 className="text-sm font-semibold text-white">Signals</h3>
                  </div>
                  <div className="flex gap-2 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    {["all", "validated", "pending"].map(f => (
                      <button key={f} onClick={() => setActivityFilter(f)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${activityFilter === f ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>{f}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 flex-1 overflow-y-auto pr-2">
                  <AnimatePresence mode="popLayout">
                    {filteredActivity.map((act) => (
                      <motion.div 
                        key={act.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        onClick={() => setSelectedActivity(act)}
                        className="flex gap-3 items-start p-3 rounded-xl hover:bg-white/[0.03] transition-all cursor-pointer"
                        style={{ border: "1px solid rgba(255,255,255,0.03)" }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-indigo-400 shrink-0">
                          {act.user[0]}{act.user.split(' ')[1]?.[0] || ''}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-zinc-400 leading-tight">
                            <span className="text-white font-semibold">{act.user}</span> {act.action} <span className="text-indigo-400">{act.target}</span>
                          </p>
                          <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1"><Clock size={10} /> {act.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <div className="p-6 rounded-2xl flex flex-col h-96" style={{ background: "#111115", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2 mb-6">
                  <BarChart2 size={16} className="text-indigo-400" />
                  <h3 className="text-sm font-semibold text-white">Capital</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-4 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                     <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Burn</p>
                     <p className="text-lg font-bold text-white">{INITIAL_BURN_RATE.monthly}</p>
                  </div>
                  <div className="p-4 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                     <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Efficiency</p>
                     <p className="text-lg font-bold text-emerald-400">{INITIAL_BURN_RATE.efficiency}</p>
                  </div>
                </div>
                <div className="flex-1 flex items-end justify-between gap-2 mt-auto pb-2">
                  {[30, 50, 40, 80, 60, 75, 90].map((val, i) => (
                    <div key={i} className="flex-1 bg-indigo-500/20 rounded-t-sm relative overflow-hidden" style={{ height: `${val}%` }}>
                      <div className="absolute bottom-0 left-0 w-full bg-indigo-500 opacity-60" style={{ height: '70%' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="p-6 rounded-2xl" style={{ background: "#111115", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2 mb-5">
                <Users size={16} className="text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">Leaderboard</h3>
              </div>
              <div className="space-y-2">
                {leaderboard.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-all" style={{ border: "1px solid rgba(255,255,255,0.03)" }}>
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0">{u.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{u.name}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{u.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-indigo-400">{u.points}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl flex-1 flex flex-col" style={{ background: "#111115", border: "1px solid rgba(255,255,255,0.06)", borderTop: "2px solid #f59e0b" }}>
               <div className="flex items-center gap-2 mb-5">
                 <AlertCircle size={16} className="text-amber-500" />
                 <h3 className="text-sm font-semibold text-white">Alerts</h3>
               </div>
               <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                {INITIAL_WARNINGS.map(warn => (
                  <div key={warn.id} className="flex gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${warn.severity === 'high' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}`} />
                    <div>
                      <h4 className="text-xs font-bold text-white mb-0.5">{warn.title}</h4>
                      <p className="text-[10px] text-zinc-500">{warn.target} • {warn.days}d overdue</p>
                    </div>
                  </div>
                ))}
               </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFormula && (
          <Modal isOpen={true} onClose={() => setShowFormula(false)} title="Reputation Engine">
            <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-center mb-6">
              <h3 className="text-2xl font-black text-indigo-400 italic tracking-tighter">Srep = Σ (V·Q·C) / T</h3>
            </div>
            <button onClick={() => setShowFormula(false)} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold text-sm transition-colors">Close</button>
          </Modal>
        )}

        {showSubmitProof && (
          <Modal isOpen={true} onClose={() => setShowSubmitProof(false)} title="Submit Proof">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                  Task ID / PR Link <span className="text-red-500">*</span>
                </label>
                <input type="text" placeholder="E.g., #123 or github.com/..." className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-indigo-500 outline-none" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                  Contribution details <span className="text-red-500">*</span>
                </label>
                <textarea placeholder="Describe what you built..." className="w-full h-32 bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm text-white resize-none focus:border-indigo-500 outline-none" required />
              </div>
              <button 
                onClick={handleBroadcastProof}
                disabled={isSubmitting || !proofData.details}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Processing..." : <><Send size={16} /> Broadcast Signal</>}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
