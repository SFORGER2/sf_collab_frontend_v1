import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

import { evaluationAPI } from '@/utils/APIs/evaluationApi';
import RunEvaluationPanel from './RunEvaluationPanel';
import LatestRunCard from './LatestRunCard';
import MetricsTable from './MetricsTable';
import ConfusionMatrix from './ConfusionMatrix';
import ComparisonView from './ComparisonView';

export default function ModelEvaluationDashboard() {
  const navigate = useNavigate();

  // Component States
  const [latestRun, setLatestRun] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all initial data
  const fetchData = async () => {
    setError(null);
    try {
      // 1. Fetch History
      const runHistory = await evaluationAPI.getEvaluationHistory();
      setHistory(runHistory || []);

      // 2. Fetch Latest Run
      try {
        const latest = await evaluationAPI.getLatestEvaluation();
        setLatestRun(latest);
      } catch (err) {
        // A 404 status indicates no evaluation runs are recorded yet
        if (err.response?.status === 404) {
          setLatestRun(null);
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error('Error fetching evaluation data:', err);
      // Detailed user-facing connection state errors
      if (err.code === 'ECONNREFUSED' || !err.response) {
        setError('Cannot connect to the evaluation API. Please verify that the backend server is running and accessible.');
      } else {
        setError(err.response?.data?.detail || err.message || 'An unexpected error occurred while loading dashboard records.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Run a new evaluation
  const handleRunEvaluation = async (modelVersion) => {
    setRunning(true);
    setError(null);
    try {
      const result = await evaluationAPI.runEvaluation(modelVersion);
      toast.success(`Evaluation for Classifier ${modelVersion.toUpperCase()} triggered successfully!`);
      
      // Update local states directly with the new evaluation data to avoid full page refresh
      setLatestRun(result);
      setHistory((prev) => [...prev, result]);
    } catch (err) {
      console.error('Evaluation run failed:', err);
      const errMsg = err.response?.data?.detail || err.message || 'Failed to complete evaluation run.';
      toast.error(errMsg);
      setError(errMsg);
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-sm text-gray-400">Loading Evaluation Records...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      {/* Background design elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin')}
                className="p-2 hover:bg-white/5 border border-transparent hover:border-white/10 rounded-xl transition duration-200"
                title="Back to Admin Dashboard"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Model Evaluation Harness
              </h1>
            </div>
            <p className="text-sm text-gray-400 mt-2 ml-10">
              Analyze accuracy, precision, and recall metrics to compare baseline classifiers on frozen ground-truth tasks.
            </p>
          </div>
        </div>

        {/* Global Connection/HTTP Error Alerts */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Evaluation API Error</p>
              <p className="text-xs text-red-400/80 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Row 1: Evaluation Controls & Latest Run Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RunEvaluationPanel onRun={handleRunEvaluation} isRunning={running} />
          <LatestRunCard run={latestRun} />
        </div>

        {/* Row 2: Metrics Table & Confusion Matrix Grid */}
        {latestRun && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MetricsTable metrics={latestRun.per_class_metrics} />
            <ConfusionMatrix matrixData={latestRun.confusion_matrix} />
          </div>
        )}

        {/* Row 3: Run Comparison view (requires history list) */}
        <ComparisonView history={history} />
      </div>
    </div>
  );
}
