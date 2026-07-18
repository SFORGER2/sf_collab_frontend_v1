import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { aiNewsAPI } from '@/utils/APIs/aiNewsAPI';

export default function SourceFilter({ selectedSource, onSourceChange }) {
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadSources = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');
    try {
      const response = await aiNewsAPI.getSources();
      const list =
        response?.sources ??
        response?.data?.sources ??
        response?.data ??
        (Array.isArray(response) ? response : []);

      setSources(list);
    } catch (err) {
      setIsError(true);
      setErrorMessage(err?.message || 'Failed to load news sources.');
      console.error('Error loading AI News sources:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSources();
  }, [loadSources]);

  // Loading State (Skeleton Chips)
  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" data-testid="source-filter-loading">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-lg bg-gray-800 animate-pulse" />
        ))}
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg border border-red-500/30 bg-red-500/5 text-red-300 text-sm mb-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{errorMessage}</span>
        </div>
        <button
          onClick={loadSources}
          className="flex items-center gap-1 text-xs font-semibold uppercase text-red-400 hover:text-red-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  // Empty State
  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" data-testid="source-filter">
      {sources.map((source) => (
        <button
          key={source}
          onClick={() => onSourceChange?.(source)}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all text-sm font-medium border ${
            selectedSource === source
              ? "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700"
          }`}
        >
          {source}
        </button>
      ))}
    </div>
  );
}

SourceFilter.propTypes = {
  selectedSource: PropTypes.string,
  onSourceChange: PropTypes.func,
};
