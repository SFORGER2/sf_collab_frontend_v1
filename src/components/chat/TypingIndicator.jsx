/**
 * TypingIndicator Component
 * Shows animated dots when someone is typing
 * 
 * Put this in: src/components/chat/TypingIndicator.jsx
 * 
 * Usage:
 * <TypingIndicator users={[{ firstName: 'John' }]} />
 */

import React from 'react';

const TypingIndicator = ({ users }) => {
  if (!users?.length) return null;
  
  const names = users.map((u) => u.firstName || u.first_name || "Someone").join(', ');
  
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-zinc-400 text-sm min-h-[32px]">
      {/* Animated dots */}
      <div className="flex gap-1 flex-shrink-0">
        <span 
          className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" 
          style={{ animationDelay: '0ms' }} 
        />
        <span 
          className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" 
          style={{ animationDelay: '150ms' }} 
        />
        <span 
          className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" 
          style={{ animationDelay: '300ms' }} 
        />
      </div>
      {/* Text — won't overflow or be cut off */}
      <span className="leading-tight">
        <span className="text-indigo-400 font-medium">{names}</span>
        {' '}{users.length === 1 ? 'is' : 'are'} typing…
      </span>
    </div>
  );
};

const MemoizedTypingIndicator = React.memo(TypingIndicator, (prevProps, nextProps) => {
  const prevUsers = prevProps.users || [];
  const nextUsers = nextProps.users || [];
  if (prevUsers.length !== nextUsers.length) return false;
  return prevUsers.every((u, idx) => {
    const nu = nextUsers[idx];
    return (u.id || u._id) === (nu.id || nu._id) && (u.firstName || u.first_name) === (nu.firstName || nu.first_name);
  });
});

export default MemoizedTypingIndicator;