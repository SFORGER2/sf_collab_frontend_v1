// src/components/pages/startupWorkspace/StartupWorkspaceDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Gauge, Users, TrendingUp, Rocket, CheckCircle2, Building2,
  ShoppingBag, Wallet, Handshake, BarChart3, ArrowRight,
} from 'lucide-react';
import { startupWorkspaceAPI } from '@/utils/APIs/startupWorkspaceAPI';

const QUICK_LINKS = [
  { label: 'ERP', href: '/erp', icon: Building2, desc: 'Tasks, attendance & operations' },
  { label: 'Marketplace', href: '/marketplace', icon: ShoppingBag, desc: 'Buy & sell within the ecosystem' },
  { label: 'Crowdfunding', href: '/crowdfunding', icon: Rocket, desc: 'Raise funds from the community' },
  { label: 'Analytics', href: '/erp/admin-analytics', icon: BarChart3, desc: 'Workspace-wide analytics' },
];

const LIFECYCLE_LABELS = {
  founder_only: { label: 'Founder Only', color: 'text-gray-300 bg-gray-500/15 border-gray-500/30' },
  active: { label: 'Active', color: 'text-blue-300 bg-blue-500/15 border-blue-500/30' },
  recruiting: { label: 'Recruiting', color: 'text-amber-300 bg-amber-500/15 border-amber-500/30' },
  slowing: { label: 'Slowing', color: 'text-orange-300 bg-orange-500/15 border-orange-500/30' },
  at_risk: { label: 'At Risk', color: 'text-red-300 bg-red-500/15 border-red-500/30' },
  dormant: { label: 'Dormant', color: 'text-red-400 bg-red-500/15 border-red-500/30' },
  launched: { label: 'Launched', color: 'text-green-300 bg-green-500/15 border-green-500/30' },
  archived: { label: 'Archived', color: 'text-gray-400 bg-gray-500/15 border-gray-500/30' },
};

export default function StartupWorkspaceDashboard() {
  const { startup, startupId } = useOutletContext();
  const [scoreData, setScoreData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const body = await startupWorkspaceAPI.getExecutionScore(startupId);
        if (!cancelled) setScoreData(body?.data ?? body);
      } catch (err) {
        console.error('Failed to load execution score:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [startupId]);

  const lifecycle = LIFECYCLE_LABELS[scoreData?.lifecycle_state || startup?.lifecycleState] || LIFECYCLE_LABELS.active;
  const executionScore = scoreData?.execution_score ?? startup?.executionScore ?? 0;
  const milestonesCompleted = scoreData?.milestones_completed ?? startup?.milestonesCompleted ?? 0;
  const milestonesTotal = scoreData?.milestones_total ?? startup?.milestonesTotal ?? 0;
  const completionRate = scoreData?.milestone_completion_rate ?? startup?.milestoneCompletionRate ?? 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{startup?.name}</h1>
        <p className="text-gray-500 text-sm">{startup?.description}</p>
      </div>

      {/* Top stat row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard icon={Gauge} label="Execution Score" value={executionScore} accent="text-blue-400" />
        <StatCard icon={Users} label="Team Size" value={startup?.memberCount ?? '—'} accent="text-purple-400" />
        <StatCard icon={CheckCircle2} label="Milestones" value={`${milestonesCompleted}/${milestonesTotal || 0}`} accent="text-green-400" />
        <StatCard icon={TrendingUp} label="Completion" value={`${completionRate}%`} accent="text-amber-400" />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-gray-500 text-sm">Lifecycle:</span>
        <span className={`text-xs px-2.5 py-1 rounded-full border ${lifecycle.color}`}>{lifecycle.label}</span>
        {startup?.crowdfundingUnlocked && (
          <span className="text-xs px-2.5 py-1 rounded-full border text-green-300 bg-green-500/15 border-green-500/30 flex items-center gap-1">
            <Rocket className="w-3 h-3" /> Crowdfunding unlocked
          </span>
        )}
      </div>

      {/* Quick links to existing modules */}
      <div>
        <h2 className="text-white font-semibold mb-3">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} to={link.href}>
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 h-full hover:border-blue-500/30 transition-colors"
              >
                <link.icon className="w-5 h-5 text-blue-400 mb-2" />
                <p className="text-white text-sm font-medium">{link.label}</p>
                <p className="text-gray-500 text-xs mt-0.5">{link.desc}</p>
                <div className="flex items-center gap-1 text-blue-400 text-xs mt-2">
                  Open <ArrowRight className="w-3 h-3" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Financial snapshot */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Wallet className="w-4 h-4 text-green-400" /> Financial Snapshot
          </h2>
          <Link to={`/startup-workspace/${startupId}/financials`} className="text-blue-400 text-xs hover:text-blue-300">
            Manage financials →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <FinancialStat label="Revenue" value={startup?.revenue} />
          <FinancialStat label="Funding Raised" value={startup?.funding_amount} />
          <FinancialStat label="Valuation" value={startup?.valuation} />
          <FinancialStat label="Runway" value={startup?.runway_months} suffix=" mo" isCurrency={false} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <Icon className={`w-4 h-4 mb-2 ${accent}`} />
      <p className="text-white text-xl font-bold">{value}</p>
      <p className="text-gray-500 text-xs">{label}</p>
    </div>
  );
}

function FinancialStat({ label, value, suffix = '', isCurrency = true }) {
  const display = value == null
    ? '—'
    : isCurrency
      ? `$${Number(value).toLocaleString()}`
      : `${Number(value).toLocaleString()}${suffix}`;
  return (
    <div>
      <p className="text-white text-lg font-semibold">{display}</p>
      <p className="text-gray-500 text-xs">{label}</p>
    </div>
  );
}