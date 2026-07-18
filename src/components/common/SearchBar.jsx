import React from 'react';
import PropTypes from 'prop-types';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function SearchBar({ searchQuery, onSearchChange, placeholder = "Search AI news..." }) {
  return (
    <div className="relative w-full" data-testid="search-bar">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange?.(e.target.value)}
        className="pl-9 bg-gray-800 border-gray-700 text-white w-full placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg h-10"
      />
    </div>
  );
}

SearchBar.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};
