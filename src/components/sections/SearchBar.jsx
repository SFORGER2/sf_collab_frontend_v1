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
        <div className="relative sm:w-auto">
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={localValue}
                    onChange={handleInputChange}
                    placeholder="Search brilliant visions..."
                    className="w-full sm:w-[320px] px-4 py-2.5 pr-12 bg-white/10 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-gray-400 transition-all duration-200"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 text-gray-400" />
            </div>
        </div>
    );
};

export default SearchBar; 