import React from 'react';
import PropTypes from 'prop-types';
import { Calendar, Layers, Activity } from 'lucide-react';

export default function LatestRunCard({ run }) {
  if (!run) {
    return (
      <div className="bg-gradient-to-br from-slate-900/80 to-gray-900/60 p-6 rounded-2xl border border-white/10 shadow-2xl flex flex-col justify-center items-center text-center h-full min-h-[250px] backdrop-blur-md">
        <Activity className="w-12 h-12 text-gray-500 mb-4 animate-pulse" />
        <h3 className="text-lg font-semibold text-gray-300">No Evaluation History</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-[280px]">
          There are no evaluation runs stored on the server yet. Trigger an evaluation to start.
        </p>
      </div>
    );
  }

  const { run_id, model_version, timestamp, total_samples, accuracy } = run;

  // Format UTC timestamp cleanly
  const formattedDate = () => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return timestamp;
    }
  };

  const accuracyPct = (accuracy * 100).toFixed(1);

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-gray-900/60 p-6 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-md h-full flex flex-col justify-between">
      {/* Decorative Glow */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📊</span> Latest Run Details
          </h3>
          <span className="px-3 py-1 bg-white/5 border border-white/15 rounded-full text-xs font-semibold font-mono text-blue-400">
            {run_id}
          </span>
        </div>

        <div className="space-y-4">
          {/* Model Version */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/25 rounded-lg">
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Model version</p>
              <p className="text-sm font-semibold text-white">
                {model_version.toUpperCase() === 'V2' ? 'V2 (Weighted Score)' : 'V1 (Simple Match)'}
              </p>
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/25 rounded-lg">
              <Calendar className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Evaluation Timestamp</p>
              <p className="text-sm font-semibold text-white">{formattedDate()}</p>
            </div>
          </div>

          {/* Sample Count */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/10 border border-teal-500/25 rounded-lg">
              <Layers className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Dataset Size</p>
              <p className="text-sm font-semibold text-white">{total_samples} samples</p>
            </div>
          </div>
        </div>
      </div>

      {/* Accuracy Metric Gauge Card */}
      <div className="mt-6 flex items-center gap-6 bg-white/5 border border-white/10 rounded-xl p-4">
        {/* Radial gauge representation */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="32"
              cy="32"
              r="28"
              className="stroke-gray-800 fill-none"
              strokeWidth="5"
            />
            {/* Value ring */}
            <circle
              cx="32"
              cy="32"
              r="28"
              className="stroke-blue-500 fill-none transition-all duration-1000"
              strokeWidth="5"
              strokeDasharray={2 * Math.PI * 28}
              strokeDashoffset={2 * Math.PI * 28 * (1 - accuracy)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold text-blue-400 font-mono">ACC</span>
          </div>
        </div>

        <div>
          <span className="text-xs text-gray-400 font-medium">Overall Accuracy</span>
          <h4 className="text-3xl font-bold text-white font-mono mt-0.5">
            {accuracyPct}%
          </h4>
        </div>
      </div>
    </div>
  );
}

LatestRunCard.propTypes = {
  run: PropTypes.shape({
    run_id: PropTypes.string.isRequired,
    model_version: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    total_samples: PropTypes.number.isRequired,
    accuracy: PropTypes.number.isRequired,
  }),
};
