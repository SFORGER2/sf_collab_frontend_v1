import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, TrendingUp, Users, AlertCircle, 
  CheckCircle2, Clock, ArrowUpRight, 
  Target, BarChart3,
  Activity, ShieldAlert, Award, 
  Calculator, History, Send,
  FileText, Link, Upload, Flame, Gauge,
  Database, ShieldCheck, Cpu, Briefcase,
  ChevronDown, X, Plus
} from "lucide-react";

// Imports
import { GlassCard } from "./components/GlassCard";
import { SectionHeader } from "./components/SectionHeader";
import { Modal } from "./components/Modal";
import { useSelector } from "react-redux";
import { 
  WORKSPACES, 
  INITIAL_EXECUTION_SCORE, 
  INITIAL_KPI_DATA, 
  INITIAL_BURN_RATE, 
  INITIAL_ACTIVITY, 
  INITIAL_WARNINGS, 
  INITIAL_LEADERBOARD 
} from "./data/executionMockData";

// ── TARGET ENDPOINTS (Reference only for Backend Integration) ──
const ENDPOINTS = {
  METRICS: "/api/erp/execution/metrics",
  ACTIVITY: "/api/erp/execution/activity",
  LEADERBOARD: "/api/erp/execution/leaderboard",
  SUBMIT_PROOF: "/api/erp/execution/submit-proof"
};

const ExecutionDashboard = () => {
  // ── STATE ──
  const { user } = useSelector(state => state.auth);
  const [timeRange, setTimeRange] = useState("week");
  const [currentWS, setCurrentWS] = useState(WORKSPACES[0]);
  const [isWSDropdownOpen, setIsWSDropdownOpen] = useState(false);
  
  // ── DATA STATE (Simulated) ──
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    score: INITIAL_EXECUTION_SCORE,
    kpis: INITIAL_KPI_DATA,
    burnRate: INITIAL_BURN_RATE,
    warnings: INITIAL_WARNINGS
  });
  const [leaderboard, setLeaderboard] = useState(INITIAL_LEADERBOARD);
  const [activity, setActivity] = useState(INITIAL_ACTIVITY);
  const [activityFilter, setActivityFilter] = useState("all");
  
  // Modals
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showFormula, setShowFormula] = useState(false);
  const [showSubmitProof, setShowSubmitProof] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proofData, setProofData] = useState({ task: "Auth Flow Implementation", details: "" });

  // ── SIMULATED DATA FETCHING ──
  useEffect(() => {
    const simulateFetch = async () => {
      setIsLoading(true);
      // Simulate network latency for that "Strong" feel
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In this frontend-only mode, we just keep the initial mock data
      // but the structure is ready for: const res = await axios.get(ENDPOINTS.METRICS);
      setIsLoading(false);
    };

    simulateFetch();
  }, [currentWS.id, timeRange]);

  // ── HANDLERS ──
  const handleBroadcastProof = () => {
    if (!proofData.details) return;
    
    setIsSubmitting(true);
    
    // Stage 1: Validation
    toast.info("Verifying cryptographic proof...", { autoClose: 1000, position: "bottom-right" });
    
    setTimeout(() => {
      // Stage 2: Reputation Calc
      toast.info("Calculating reputation impact...", { autoClose: 1000, position: "bottom-right" });
      
      setTimeout(() => {
        // Stage 3: Broadcast
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
        
        // Simulating the API call to the backend:
        // await axios.post(ENDPOINTS.SUBMIT_PROOF, newProof);

        setIsSubmitting(false);
        setShowSubmitProof(false);
        setProofData({ task: "Auth Flow Implementation", details: "" });
        
        toast.success("Proof validated and broadcasted to SF-OS!", {
          position: "bottom-center",
          theme: "dark",
          icon: "🚀"
        });
      }, 1200);
    }, 1000);
  };

  const filteredActivity = useMemo(() => {
    if (activityFilter === "all") return activity;
    return activity.filter(a => a.status.toLowerCase().includes(activityFilter.toLowerCase()));
  }, [activity, activityFilter]);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 p-6 lg:p-8 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* ── HEADER NAVIGATION ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        
        {/* Left: Workspace Switcher */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <button 
              onClick={() => setIsWSDropdownOpen(!isWSDropdownOpen)}
              className="flex items-center gap-3 bg-zinc-900/50 hover:bg-zinc-900 px-4 py-2.5 rounded-2xl border border-white/5 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-xs">
                {currentWS.name[0]}
              </div>
              <div className="text-left">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter leading-none mb-1">Workspace</p>
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  {currentWS.name}
                  <ChevronDown size={14} className={`transition-transform ${isWSDropdownOpen ? 'rotate-180' : ''}`} />
                </p>
              </div>
            </button>
            
            <AnimatePresence>
              {isWSDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-2 w-64 bg-[#121214] border border-white/10 rounded-2xl p-2 z-[100] shadow-2xl"
                >
                  {WORKSPACES.map(ws => (
                    <button 
                      key={ws.id}
                      onClick={() => { setCurrentWS(ws); setIsWSDropdownOpen(false); }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all ${currentWS.id === ws.id ? 'bg-white/5' : ''}`}
                    >
                      <span className="text-sm font-bold text-white">{ws.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${ws.status === 'Healthy' ? 'text-emerald-400 bg-emerald-400/10' : 'text-amber-400 bg-amber-400/10'}`}>
                        {ws.score}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <div className="h-8 w-px bg-white/5 mx-2" />
            <motion.div 
              animate={isLoading ? { scale: [1, 1.2, 1], opacity: [1, 0.5, 1] } : { opacity: [1, 0.4, 1] }} 
              transition={{ repeat: Infinity, duration: isLoading ? 0.8 : 2 }} 
              className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-indigo-500 shadow-[0_0_8px_#6366f1]'}`} 
            />
            <span className={`${isLoading ? 'text-amber-400' : 'text-zinc-500'} text-[10px] font-bold tracking-widest uppercase transition-colors`}>
              {isLoading ? 'Syncing...' : 'System Online'}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-900/40 p-1 rounded-xl border border-white/5">
            {["day", "week", "month"].map(range => (
              <button 
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  timeRange === range ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setShowSubmitProof(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
          >
            <Plus size={16} />
            Submit Proof
          </button>
        </div>
      </div>

      {/* ── MAIN DASHBOARD GRID ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Execution Score Card */}
          <GlassCard className="p-8 relative group">
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
                  <button onClick={() => setShowFormula(true)} className="ml-4 p-2 bg-zinc-900 rounded-full text-zinc-500 hover:text-indigo-400 transition-colors">
                    <Calculator size={18} />
                  </button>
                </div>
                
                <div className="mt-8 flex items-center gap-6">
                  <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Momentum</p>
                    <p className="text-sm font-bold text-emerald-400">Stable</p>
                  </div>
                  <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Efficiency</p>
                    <p className="text-sm font-bold text-indigo-400">0.82x</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-4">Metric Breakdown</p>
                {INITIAL_EXECUTION_SCORE.breakdown.map((item) => (
                  <div key={item.label} className="group cursor-help" onClick={() => setSelectedMetric(item)}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-zinc-400">{item.label}</span>
                      <span className="text-xs font-bold text-white">{item.value.toFixed(1)}</span>
                    </div>
                    <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${item.value * 10}%` }} className="h-full rounded-full" style={{ backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {INITIAL_KPI_DATA[timeRange].map((kpi) => (
              <GlassCard key={kpi.label} className="p-5 hover:border-white/20 transition-all text-center">
                <div className="flex justify-center mb-2">{kpi.icon}</div>
                <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold mb-1">{kpi.label}</p>
                <p className="text-xl font-bold text-white">{kpi.value}</p>
              </GlassCard>
            ))}
          </div>

          {/* Activity & Trends */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            <GlassCard className="p-6 h-full flex flex-col">
              <div className="flex flex-col gap-4 mb-4">
                <SectionHeader title="Signals" />
                <div className="flex gap-2 bg-zinc-950 p-1 rounded-xl border border-white/5">
                  {["all", "validated", "pending"].map(f => (
                    <button key={f} onClick={() => setActivityFilter(f)} className={`flex-1 py-1 rounded-lg text-[8px] font-black uppercase transition-all ${activityFilter === f ? 'bg-white/10 text-white' : 'text-zinc-700'}`}>{f}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {filteredActivity.map((act) => (
                    <motion.div 
                      key={act.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      onClick={() => setSelectedActivity(act)}
                      className="flex gap-4 items-start p-3 rounded-2xl hover:bg-white/[0.03] transition-all cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-[10px] font-bold text-indigo-400 border border-white/5">
                        {act.user[0]}{act.user.split(' ')[1]?.[0] || ''}
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] text-zinc-400 leading-tight">
                          <span className="text-white font-bold">{act.user}</span> {act.action} <span className="text-indigo-400">{act.target}</span>
                        </p>
                        <p className="text-[9px] text-zinc-600 mt-1 flex items-center gap-1"><Clock size={8} /> {act.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </GlassCard>

            <GlassCard className="p-6 h-full flex flex-col bg-gradient-to-br from-[#0d0d0f] to-[#121214]">
              <SectionHeader title="Capital" />
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-zinc-950/50 rounded-xl border border-white/5 text-center">
                   <p className="text-[8px] text-zinc-600 font-bold uppercase mb-1">Burn</p>
                   <p className="text-sm font-bold text-white">{INITIAL_BURN_RATE.monthly}</p>
                </div>
                <div className="p-3 bg-zinc-950/50 rounded-xl border border-white/5 text-center">
                   <p className="text-[8px] text-zinc-600 font-bold uppercase mb-1">Efficiency</p>
                   <p className="text-sm font-bold text-emerald-400">{INITIAL_BURN_RATE.efficiency}</p>
                </div>
              </div>
              <div className="flex-1 flex items-end justify-between gap-1 mt-auto">
                {[30, 50, 40, 80, 60, 75, 90].map((val, i) => (
                  <div key={i} className="flex-1 bg-indigo-500/20 rounded-sm relative overflow-hidden" style={{ height: `${val}%` }}>
                    <div className="absolute bottom-0 left-0 w-full bg-indigo-500 opacity-60" style={{ height: '70%' }} />
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <GlassCard className="p-6">
            <SectionHeader title="Leaderboard" />
            <div className="space-y-2">
              {leaderboard.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-[9px] font-bold text-white">{user.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-white truncate">{user.name}</p>
                    <p className="text-[9px] text-zinc-600 truncate">{user.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-white">{user.points}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6 flex-1 flex flex-col border-amber-500/10">
             <SectionHeader title="Alerts" />
             <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {INITIAL_WARNINGS.map(warn => (
                <div key={warn.id} className="flex gap-3">
                  <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${warn.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'}`} />
                  <div>
                    <h4 className="text-[11px] font-bold text-white">{warn.title}</h4>
                    <p className="text-[9px] text-zinc-500">{warn.target} • {warn.days}d overdue</p>
                  </div>
                </div>
              ))}
             </div>
          </GlassCard>
        </div>
      </div>

      {/* ── MODALS ──────────────────────────────────────────────────────────── */}

      <Modal isOpen={showFormula} onClose={() => setShowFormula(false)} title="Reputation Engine">
        <div className="p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl text-center mb-6">
          <h3 className="text-3xl font-black text-white italic tracking-tighter">Srep = Σ (V·Q·C) / T</h3>
        </div>
        <button onClick={() => setShowFormula(false)} className="w-full bg-white text-black py-4 rounded-2xl font-bold text-sm">Close</button>
      </Modal>

      <Modal isOpen={showSubmitProof} onClose={() => setShowSubmitProof(false)} title="Submit Proof">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
              Task ID / PR Link <span className="text-red-500">*</span>
            </label>
            <input type="text" placeholder="E.g., #123 or github.com/..." className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-indigo-500 outline-none" required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
              Contribution details <span className="text-red-500">*</span>
            </label>
            <textarea placeholder="Describe what you built..." className="w-full h-32 bg-zinc-900 border border-white/10 rounded-xl p-4 text-sm text-white resize-none focus:border-indigo-500 outline-none" required />
          </div>
          <button 
            onClick={handleBroadcastProof}
            disabled={isSubmitting || !proofData.details}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-sm cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Clock size={18} />
                </motion.div>
                Processing...
              </>
            ) : (
              <>
                <Send size={18} />
                Broadcast Signal
              </>
            )}
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!selectedActivity} onClose={() => setSelectedActivity(null)} title="Audit Details">
        {selectedActivity && (
          <div className="space-y-4">
             <p className="text-xs text-white font-bold">{selectedActivity.user} : {selectedActivity.action}</p>
             <p className="text-xs text-zinc-400 leading-relaxed">{selectedActivity.details}</p>
             <button onClick={() => setSelectedActivity(null)} className="w-full bg-zinc-800 text-white py-4 rounded-2xl font-bold text-sm">Dismiss</button>
          </div>
        )}
      </Modal>

      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }`}</style>
    </div>
  );
};

export default ExecutionDashboard;
