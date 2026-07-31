/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Play, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RunEvaluationPanel({ onRun, isRunning }) {
  const [selectedModel, setSelectedModel] = useState('v1');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRunning) return;
    onRun(selectedModel);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-gray-900/60 p-6 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-md h-full flex flex-col justify-between">
      {/* Decorative Blur */}
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div>
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <span>⚡</span> Evaluation Controls
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Trigger a real-time evaluation over the frozen test dataset. Select a classifier version below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <p className="block text-sm font-medium text-gray-300">
              Select Classifier Version
            </p>
            <div className="grid grid-cols-2 gap-4">
              <label
                htmlFor="model_v1"
                className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedModel === 'v1'
                    ? 'bg-blue-500/10 border-blue-500 shadow-md shadow-blue-500/5'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white">V1 (Baseline)</span>
                  <input
                    id="model_v1"
                    type="radio"
                    name="model_version"
                    value="v1"
                    checked={selectedModel === 'v1'}
                    onChange={() => setSelectedModel('v1')}
                    className="text-blue-500 focus:ring-0 focus:ring-offset-0 bg-transparent border-white/20"
                  />
                </div>
                <span className="text-xs text-gray-400">First-match keywords</span>
              </label>

              <label
                htmlFor="model_v2"
                className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedModel === 'v2'
                    ? 'bg-purple-500/10 border-purple-500 shadow-md shadow-purple-500/5'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white">V2 (Weighted)</span>
                  <input
                    id="model_v2"
                    type="radio"
                    name="model_version"
                    value="v2"
                    checked={selectedModel === 'v2'}
                    onChange={() => setSelectedModel('v2')}
                    className="text-purple-500 focus:ring-0 focus:ring-offset-0 bg-transparent border-white/20"
                  />
                </div>
                <span className="text-xs text-gray-400">Score keyword weights</span>
              </label>
            </div>
          </div>
        </form>
      </div>

      <div className="mt-6">
        <motion.button
          whileHover={!isRunning ? { scale: 1.02 } : {}}
          whileTap={!isRunning ? { scale: 0.98 } : {}}
          onClick={handleSubmit}
          disabled={isRunning}
          className={`w-full py-4 rounded-xl font-semibold text-white transition-all shadow-lg flex items-center justify-center gap-2 border disabled:opacity-50 disabled:cursor-not-allowed ${
            selectedModel === 'v1'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-blue-400/20 shadow-blue-500/10'
              : 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 border-purple-400/20 shadow-purple-500/10'
          }`}
        >
          {isRunning ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Running Evaluation...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Evaluation</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}

RunEvaluationPanel.propTypes = {
  onRun: PropTypes.func.isRequired,
  isRunning: PropTypes.bool.isRequired,
};
