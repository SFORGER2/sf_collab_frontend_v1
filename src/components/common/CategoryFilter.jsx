import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { aiNewsAPI } from '@/utils/APIs/aiNewsAPI';

export default function CategoryFilter({ selectedCategory, onCategoryChange }) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');
    try {
      const response = await aiNewsAPI.getCategories();
      let raw = response?.categories ?? response?.data?.categories ?? response?.data ?? response;
      if (!Array.isArray(raw)) raw = [];

      // Normalize to objects with { id, name }
      const normalized = raw.map((item, index) => {
        if (typeof item === 'string') {
          return { id: item, name: item };
        }
        if (typeof item === 'object' && item !== null) {
          const id = item.id ?? item.name ?? item.label ?? `category-${index}`;
          const name = item.name ?? item.label ?? String(item);
          return { id: String(id), name: String(name) };
        }
        return { id: `category-${index}`, name: String(item) };
      });

      setCategories(normalized);
    } catch (err) {
      setIsError(true);
      setErrorMessage(err?.message || 'Failed to load categories.');
      console.error('Error loading AI News categories:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" data-testid="category-filter-loading">
        {[...Array(5)].map((_, i) => (
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
          onClick={loadCategories}
          className="flex items-center gap-1 text-xs font-semibold uppercase text-red-400 hover:text-red-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  // If no categories are returned, just show "All" only
  const allCategories = [
    { id: 'all', name: 'All' },
    ...categories
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" data-testid="category-filter">
      {allCategories.map((category) => {
        const isActive = selectedCategory === category.name || (category.name === 'All' && !selectedCategory);
        return (
          <button
            key={category.id}
            onClick={() => {
              // If clicking "All" or clicking the active category, clear the filter
              if (category.name === 'All') {
                onCategoryChange?.('');
              } else if (selectedCategory === category.name) {
                onCategoryChange?.(''); // toggle off
              } else {
                onCategoryChange?.(category.name);
              }
            }}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all text-sm font-medium border ${
              isActive
                ? "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700"
            }`}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}

CategoryFilter.propTypes = {
  selectedCategory: PropTypes.string,
  onCategoryChange: PropTypes.func,
};