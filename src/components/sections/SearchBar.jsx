import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

const SearchBar = ({ searchQuery, setSearchQuery, searchTimeoutRef }) => {
    const inputRef = useRef(null);
    const [localValue, setLocalValue] = useState(searchQuery);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setLocalValue(value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            setSearchQuery(value);
        }, 500);
    };

    useEffect(() => {
        setLocalValue(searchQuery);
    }, [searchQuery]);

    return (
        <div className="relative w-full">
            <input
                ref={inputRef}
                type="text"
                value={localValue}
                onChange={handleInputChange}
                placeholder="Search visions..."
                className="w-full px-3.5 sm:px-4.5 py-3 sm:py-3 pr-10 sm:pr-11 min-h-[46px] sm:min-h-[48px] bg-white/10 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white text-xs sm:text-sm placeholder-gray-400 transition-all duration-200"
            />
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
    );
};

export default SearchBar; 