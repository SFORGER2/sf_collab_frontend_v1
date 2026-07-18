import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { aiNewsAPI } from '@/utils/APIs/aiNewsAPI';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Cpu, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const AdminRefreshNewsSection = () => {
  const { user } = useSelector((state) => state.auth);
  const [scraping, setScraping] = useState(false);
  const [enriching, setEnriching] = useState(false);
  
  const [result, setResult] = useState(null); // { type: 'scrape'|'enrich', status: 'success'|'error', summary: any }

  // Restrict access so that only Admin or Operations users can see and use these controls.
  const userRole = user?.role || '';
  const isAuthorized = userRole === 'admin' || userRole === 'operations';

  if (!isAuthorized) {
    return null;
  }

  const handleScrape = async () => {
    if (scraping || enriching) return;
    setScraping(true);
    setResult(null);

    try {
      const data = await aiNewsAPI.scrapeNews();
      setResult({
        type: 'scrape',
        status: 'success',
        summary: data || { message: 'Scraping request finished.' },
      });
      toast.success('News scraping completed!');
    } catch (err) {
      console.error(err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to trigger scraping.';
      setResult({
        type: 'scrape',
        status: 'error',
        summary: {
          error: errMsg,
          timestamp: new Date().toLocaleTimeString(),
        },
      });
      toast.error(errMsg);
    } finally {
      setScraping(false);
    }
  };

  const handleEnrich = async () => {
    if (scraping || enriching) return;
    setEnriching(true);
    setResult(null);

    try {
      const data = await aiNewsAPI.enrichNews();
      setResult({
        type: 'enrich',
        status: 'success',
        summary: data || { message: 'AI Enrichment request finished.' },
      });
      toast.success('AI Enrichment completed!');
    } catch (err) {
      console.error(err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to trigger AI enrichment.';
      setResult({
        type: 'enrich',
        status: 'error',
        summary: {
          error: errMsg,
          timestamp: new Date().toLocaleTimeString(),
        },
      });
      toast.error(errMsg);
    } finally {
      setEnriching(false);
    }
  };

  const isBusy = scraping || enriching;

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-slate-900/60 p-6 rounded-2xl border border-white/10 shadow-2xl mb-8 relative overflow-hidden backdrop-blur-md">
      {/* Decorative Glow */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
        <span>📰</span> AI News Management Panel
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        Scrape external technical publications and enrich news articles with AI summaries, tags, and category classification. These operations must be run manually.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Refresh News Button */}
        <motion.button
          whileHover={!isBusy ? { scale: 1.02 } : {}}
          whileTap={!isBusy ? { scale: 0.98 } : {}}
          onClick={handleScrape}
          disabled={isBusy}
          className="flex-1 px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-3 border border-blue-400/20 shadow-lg shadow-blue-500/10"
        >
          {scraping ? (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          ) : (
            <RefreshCw className="w-5 h-5 text-white" />
          )}
          {scraping ? 'Scraping News...' : 'Refresh News'}
        </motion.button>

        {/* Run AI Enrichment Button */}
        <motion.button
          whileHover={!isBusy ? { scale: 1.02 } : {}}
          whileTap={!isBusy ? { scale: 0.98 } : {}}
          onClick={handleEnrich}
          disabled={isBusy}
          className="flex-1 px-5 py-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-3 border border-purple-400/20 shadow-lg shadow-purple-500/10"
        >
          {enriching ? (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          ) : (
            <Cpu className="w-5 h-5 text-white" />
          )}
          {enriching ? 'Enriching Articles...' : 'Run AI Enrichment'}
        </motion.button>
      </div>

      {/* Operation Log & Summaries */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`border rounded-xl p-5 backdrop-blur-xl ${
              result.status === 'success'
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-red-500/5 border-red-500/20'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-white">
                {result.status === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                {result.type === 'scrape' ? 'Scrape operation' : 'AI Enrichment operation'}{' '}
                {result.status === 'success' ? 'succeeded' : 'failed'}
              </h3>
            </div>

            <div className="text-xs text-gray-300 font-mono space-y-2 bg-black/40 p-4 rounded-lg border border-white/5 max-h-60 overflow-y-auto">
              {result.status === 'success' ? (
                <>
                  <div className="flex justify-between border-b border-white/5 pb-1 mb-2">
                    <span className="text-gray-500">Status</span>
                    <span className="text-emerald-400 font-bold">COMPLETED</span>
                  </div>
                  {Object.entries(result.summary).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-0.5">
                      <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-white text-right">
                        {Array.isArray(val) ? val.join(', ') : String(val)}
                      </span>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div className="flex justify-between border-b border-white/5 pb-1 mb-2">
                    <span className="text-gray-500">Status</span>
                    <span className="text-red-400 font-bold">FAILED</span>
                  </div>
                  <div className="text-red-300 whitespace-pre-wrap leading-relaxed">
                    {result.summary.error}
                  </div>
                  {result.summary.timestamp && (
                    <div className="flex justify-between mt-2 pt-2 border-t border-white/5 text-[10px] text-gray-500">
                      <span>Failed At</span>
                      <span>{result.summary.timestamp}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminRefreshNewsSection;
