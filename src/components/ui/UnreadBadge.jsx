// src/components/ui/UnreadBadge.jsx
// Reusable badge for any unread count — wrap any nav icon with this.
// Usage: <div className="relative"><BellIcon /><UnreadBadge count={notifications} /></div>
import React from "react";

export default function UnreadBadge({ count = 0, max = 99, className = "" }) {
  if (!count || count <= 0) return null;
  return (
    <span
      className={`absolute -top-1 -right-1 min-w-[18px] h-[18px]
        flex items-center justify-center
        bg-gradient-to-r from-red-500 to-rose-500
        text-white text-[10px] font-bold
        rounded-full border-2 border-[#0a0a0a]
        z-10 ${className}`}
    >
      {count > max ? `${max}+` : count}
    </span>
  );
}