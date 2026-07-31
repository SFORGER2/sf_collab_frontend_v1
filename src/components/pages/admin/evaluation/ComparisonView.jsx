import React from 'react';
import PropTypes from 'prop-types';
import { Award, TrendingUp } from 'lucide-react';

export default function ComparisonView({ history }) {
  // Sort the history logs descending based primarily on timestamp and secondarily on run_id
  const sortedHistory = [...(history || [])].sort((a, b) => {
    const timeDiff = new Date(b.timestamp) - new Date(a.timestamp);
    if (timeDiff !== 0) return timeDiff;
    return b.run_id.localeCompare(a.run_id);
  });

  // Empty State: 0 runs executed
  if (sortedHistory.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-900/80 to-gray-900/60 p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md text-center">
        <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-pulse" />
        <h3 className="text-lg font-semibold text-gray-300">Run Comparison View</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          No evaluations have been executed yet. Select a classifier version above and click "Run Evaluation" to log your first run.
        </p>
      </div>
    );
  }

  // Intermediate State: Only 1 run executed (side-by-side comparison locked)
  if (sortedHistory.length === 1) {
    const singleRun = sortedHistory[0];
    return (
      <div className="bg-gradient-to-br from-slate-900/80 to-gray-900/60 p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md text-center">
        <TrendingUp className="w-12 h-12 text-blue-500/80 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-300">Compare Runs (Locked)</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          Only one evaluation run ({singleRun.run_id} - {singleRun.model_version.toUpperCase()}) exists in the database. Run another evaluation version above to unlock side-by-side model comparisons.
        </p>
      </div>
    );
  }

  // The two most recent runs by timestamp order
  const runB = sortedHistory[0]; // Newest run
  const runA = sortedHistory[1]; // Second newest run

  // Determine which model performed better based on overall accuracy
  const winner = runB.accuracy >= runA.accuracy ? runB : runA;
  const loser = runB.accuracy >= runA.accuracy ? runA : runB;
  const accuracyDiff = Math.abs((runB.accuracy - runA.accuracy) * 100).toFixed(1);

  const formatPct = (val) => {
    return `${(val * 100).toFixed(1)}%`;
  };

  const formatTime = (ts) => {
    try {
      return new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch {
      return ts;
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-gray-900/60 p-6 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>⚔️</span> Model Comparison View
          </h3>
          <p className="text-xs text-gray-400">
            Comparing the two most recent evaluation runs.
          </p>
        </div>

        {accuracyDiff !== '0.0' && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold">
            <Award className="w-4 h-4" />
            <span>
              {winner.model_version.toUpperCase()} is {accuracyDiff}% more accurate than {loser.model_version.toUpperCase()}!
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Run: Older Run */}
        <div className={`p-5 rounded-xl border transition-all ${
          winner.run_id === runA.run_id 
            ? 'bg-blue-500/5 border-blue-500/30' 
            : 'bg-white/5 border-white/10'
        }`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-gray-400">
                {runA.run_id}
              </span>
              <h4 className="text-lg font-bold text-white mt-1 capitalize">
                Classifier {runA.model_version}
              </h4>
            </div>
            {winner.run_id === runA.run_id && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs font-semibold text-blue-400">
                ★ Best Model
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
              <span className="text-xs text-gray-500 block">Accuracy Score</span>
              <span className="text-2xl font-bold text-white font-mono">{formatPct(runA.accuracy)}</span>
            </div>
            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
              <span className="text-xs text-gray-500 block">Run Timestamp</span>
              <span className="text-sm font-semibold text-gray-300 block mt-1">{formatTime(runA.timestamp)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500">Per-Class F1-Scores</h5>
            <div className="space-y-1">
              {Object.keys(runA.per_class_metrics).map((cls) => {
                const f1_score = runA.per_class_metrics[cls].f1_score;
                return (
                  <div key={cls} className="flex justify-between items-center text-xs p-2 rounded hover:bg-white/5 transition-colors">
                    <span className="text-gray-400 capitalize">{cls}</span>
                    <span className="font-mono text-white font-semibold">{formatPct(f1_score)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Run: Newer Run */}
        <div className={`p-5 rounded-xl border transition-all ${
          winner.run_id === runB.run_id 
            ? 'bg-blue-500/5 border-blue-500/30' 
            : 'bg-white/5 border-white/10'
        }`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-gray-400">
                {runB.run_id}
              </span>
              <h4 className="text-lg font-bold text-white mt-1 capitalize">
                Classifier {runB.model_version}
              </h4>
            </div>
            {winner.run_id === runB.run_id && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs font-semibold text-blue-400">
                ★ Best Model
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
              <span className="text-xs text-gray-500 block">Accuracy Score</span>
              <span className="text-2xl font-bold text-white font-mono">{formatPct(runB.accuracy)}</span>
            </div>
            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
              <span className="text-xs text-gray-500 block">Run Timestamp</span>
              <span className="text-sm font-semibold text-gray-300 block mt-1">{formatTime(runB.timestamp)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500">Per-Class F1-Scores</h5>
            <div className="space-y-1">
              {Object.keys(runB.per_class_metrics).map((cls) => {
                const f1_score = runB.per_class_metrics[cls].f1_score;
                return (
                  <div key={cls} className="flex justify-between items-center text-xs p-2 rounded hover:bg-white/5 transition-colors">
                    <span className="text-gray-400 capitalize">{cls}</span>
                    <span className="font-mono text-white font-semibold">{formatPct(f1_score)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ComparisonView.propTypes = {
  history: PropTypes.arrayOf(
    PropTypes.shape({
      run_id: PropTypes.string.isRequired,
      model_version: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      accuracy: PropTypes.number.isRequired,
      per_class_metrics: PropTypes.objectOf(
        PropTypes.shape({
          f1_score: PropTypes.number.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
};
