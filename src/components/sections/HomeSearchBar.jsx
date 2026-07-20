import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

const HomeSearchBar = ({ searchQuery, setSearchQuery, searchTimeoutRef }) => {
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
        <div className="relative w-full sm:w-auto">
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={localValue}
                    onChange={handleInputChange}
                    placeholder="Search projects..."
                    className="w-full sm:w-[300px] px-4 py-2 pl-10 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder-gray-400"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
        </div>
    );
};

export default HomeSearchBar; 