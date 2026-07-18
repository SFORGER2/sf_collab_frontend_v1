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
      const list =
        response?.categories ??
        response?.data?.categories ??
        response?.data ??
        (Array.isArray(response) ? response : []);

      setCategories(list);
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

  // Loading State (Skeleton Chips)
  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" data-testid="category-filter-loading">
        {[...Array(5)].map((_, i) => (
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
          onClick={loadCategories}
          className="flex items-center gap-1 text-xs font-semibold uppercase text-red-400 hover:text-red-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin-once" />
          Retry
        </button>
      </div>
    );
  }

  // Empty State (no categories found)
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" data-testid="category-filter">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange?.(category)}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all text-sm font-medium border ${
            selectedCategory === category
              ? "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

CategoryFilter.propTypes = {
  selectedCategory: PropTypes.string,
  onCategoryChange: PropTypes.func,
};
