import React from 'react';
import PropTypes from 'prop-types';

export default function MetricsTable({ metrics }) {
  if (!metrics) return null;

  const classes = Object.keys(metrics);

  const formatPct = (val) => {
    return `${(val * 100).toFixed(1)}%`;
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-gray-900/60 p-6 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md h-full">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>📈</span> Per-Class Performance
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
              <th className="py-3 px-4 font-semibold">Priority Class</th>
              <th className="py-3 px-4 font-semibold text-right">Precision</th>
              <th className="py-3 px-4 font-semibold text-right">Recall</th>
              <th className="py-3 px-4 font-semibold text-right">F1 Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {classes.map((cls) => {
              const detail = metrics[cls];
              return (
                <tr key={cls} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 font-medium text-white capitalize">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2.5 ${
                      cls === 'critical' ? 'bg-red-500' :
                      cls === 'high' ? 'bg-orange-500' :
                      cls === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    {cls}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-gray-300">
                    {formatPct(detail.precision)}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-gray-300">
                    {formatPct(detail.recall)}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-blue-400 font-semibold">
                    {formatPct(detail.f1_score)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

MetricsTable.propTypes = {
  metrics: PropTypes.objectOf(
    PropTypes.shape({
      precision: PropTypes.number.isRequired,
      recall: PropTypes.number.isRequired,
      f1_score: PropTypes.number.isRequired,
    })
  ),
};
