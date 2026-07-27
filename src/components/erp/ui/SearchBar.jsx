import { Search } from 'lucide-react';

export const SearchBar = ({ value, onChange, placeholder = 'Search...', className }) => (
  <div className={`relative flex-1 ${className}`}>
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 transition-colors"
    />
  </div>
);