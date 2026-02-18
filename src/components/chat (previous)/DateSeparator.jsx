

import { formatFriendlyDate } from '@/utils/formatFriendlyDate';
import React from 'react';

const DateSeparator = ({ date }) => {
  

  return (
    <div className="flex items-center justify-center my-4">
      <div className="px-4 py-1.5 bg-zinc-800/80 rounded-full text-zinc-400 text-xs font-medium shadow-sm">
        {formatFriendlyDate(date)}
      </div>
    </div>
  );
};

/**
 * Helper function to determine if we should show a date separator
 * Call this before rendering each message
 */
export const shouldShowDateSeparator = (currentMessage, previousMessage) => {
  if (!previousMessage) return true; // First message always shows date
  
  const currentDate = new Date(currentMessage.created_at);
  const prevDate = new Date(previousMessage.created_at);
  
  // Compare dates (ignoring time)
  return (
    currentDate.getDate() !== prevDate.getDate() ||
    currentDate.getMonth() !== prevDate.getMonth() ||
    currentDate.getFullYear() !== prevDate.getFullYear()
  );
};

/**
 * Helper function to determine if we should show avatar/name
 * (Group consecutive messages from same sender)
 */
export const shouldShowSenderInfo = (currentMessage, previousMessage) => {
  if (!previousMessage) return true;
  
  // Different sender = show info
  if (currentMessage.sender_id !== previousMessage.sender_id) return true;
  
  // More than 5 minutes apart = show info
  const currentTime = new Date(currentMessage.created_at);
  const prevTime = new Date(previousMessage.created_at);
  const diffMinutes = (currentTime - prevTime) / (1000 * 60);
  
  return diffMinutes > 5;
};

export default DateSeparator;