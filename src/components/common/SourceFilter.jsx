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
      let raw = response?.sources ?? response?.data?.sources ?? response?.data ?? response;
      if (!Array.isArray(raw)) raw = [];

      // Normalize to objects with { id, name }
      const normalized = raw.map((item, index) => {
        if (typeof item === 'string') {
          return { id: item, name: item };
        }
        if (typeof item === 'object' && item !== null) {
          // ✅ Use `source` as the id (e.g., "openai") and `source_label` as the display name
          const id = item.source ?? item.id ?? item.name ?? item.label ?? `source-${index}`;
          const name = item.source_label ?? item.name ?? item.label ?? String(id);
          return { id: String(id), name: String(name) };
        }
        return { id: `source-${index}`, name: String(item) };
      });

      setSources(normalized);
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

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" data-testid="source-filter-loading">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-lg bg-gray-800 animate-pulse" />
        ))}
      </div>
    );
  }

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

  // Always include "All Sources" option
  const allSources = [
    { id: 'all-sources', name: 'All Sources' },
    ...sources
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" data-testid="source-filter">
      {allSources.map((source) => {
        const isActive = selectedSource === source.id || (source.id === 'all-sources' && !selectedSource);
        return (
          <button
            key={source.id}
            onClick={() => {
              if (source.id === 'all-sources') {
                onSourceChange?.(''); // clear filter
              } else if (selectedSource === source.id) {
                onSourceChange?.(''); // toggle off
              } else {
                onSourceChange?.(source.id); // now sends "openai", not "OpenAI Blog"
              }
            }}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all text-sm font-medium border ${
              isActive
                ? "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700"
            }`}
          >
            {source.name}
          </button>
        );
      })}
    </div>
  );
}

SourceFilter.propTypes = {
  selectedSource: PropTypes.string,
  onSourceChange: PropTypes.func,
};