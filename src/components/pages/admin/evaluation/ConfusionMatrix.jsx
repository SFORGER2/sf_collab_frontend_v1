import React from 'react';
import PropTypes from 'prop-types';

export default function ConfusionMatrix({ matrixData }) {
  if (!matrixData) return null;

  const { labels, matrix } = matrixData;

  // Determine the maximum value in the matrix to scale the opacity dynamically
  const maxVal = Math.max(...matrix.flatMap((row) => row), 1);

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-gray-900/60 p-6 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md h-full flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <span>🎯</span> Confusion Matrix
        </h3>
        <p className="text-xs text-gray-400 mb-6">
          Compare predicted classes (columns) against actual ground truth categories (rows).
        </p>

        <div className="overflow-x-auto pb-2">
          {/* Matrix Grid Container */}
          <div className="min-w-[320px] max-w-[450px] mx-auto">
            {/* Column Headers */}
            <div className="grid grid-cols-5 text-center text-xs font-bold text-gray-400 mb-1">
              <div className="text-left font-normal italic text-[10px] self-end pr-2">Actual \ Pred</div>
              {labels.map((lbl) => (
                <div key={lbl} className="capitalize py-2 text-[10px] sm:text-xs">
                  {lbl}
                </div>
              ))}
            </div>

            {/* Matrix Rows */}
            <div className="space-y-1">
              {labels.map((rowLabel, rIdx) => {
                const rowValues = matrix[rIdx] || [];
                return (
                  <div key={rowLabel} className="grid grid-cols-5 items-center">
                    {/* Row Header */}
                    <div className="text-left text-xs font-bold text-gray-400 capitalize pr-2 truncate">
                      {rowLabel}
                    </div>

                    {/* Row Cells */}
                    {labels.map((colLabel, cIdx) => {
                      const val = rowValues[cIdx] ?? 0;
                      // Calculate opacity ratio based on cell value
                      const opacity = val / maxVal;
                      // Highlight correct predictions (diagonal values) differently than errors
                      const isCorrect = rIdx === cIdx;
                      
                      return (
                        <div
                          key={colLabel}
                          style={{
                            backgroundColor: isCorrect
                              ? `rgba(59, 130, 246, ${0.1 + opacity * 0.7})`  // Blue hue for correct classifications
                              : val > 0 
                              ? `rgba(239, 68, 68, ${0.1 + opacity * 0.6})`   // Red hue for misclassifications
                              : 'rgba(255, 255, 255, 0.02)',                 // Default background
                          }}
                          className={`aspect-square sm:h-12 flex flex-col justify-center items-center rounded-lg border text-sm font-mono font-bold transition-all hover:scale-105 duration-200 ${
                            isCorrect 
                              ? 'border-blue-500/20 text-blue-300' 
                              : val > 0 
                              ? 'border-red-500/20 text-red-300' 
                              : 'border-white/5 text-gray-600'
                          }`}
                          title={`Actual: ${rowLabel}, Predicted: ${colLabel} (${val} times)`}
                        >
                          {val}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend guide */}
      <div className="mt-6 flex justify-between items-center text-[10px] text-gray-500 border-t border-white/5 pt-4">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 bg-blue-500/40 border border-blue-500/20 rounded" />
          <span>Correct hits</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 bg-red-500/40 border border-red-500/20 rounded" />
          <span>Errors</span>
        </div>
      </div>
    </div>
  );
}

ConfusionMatrix.propTypes = {
  matrixData: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string).isRequired,
    matrix: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
  }),
};
