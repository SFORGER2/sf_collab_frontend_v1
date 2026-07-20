import useChatNotifications from "./useChatNotiffications";

export const ChatNotificationBadge = ({ className = '' }) => {
  const { unreadCount } = useChatNotifications();
  
  if (unreadCount === 0) return null;
  
  return (
    <span className={`
      absolute -top-1 -right-1 
      min-w-[18px] h-[18px] 
      flex items-center justify-center 
      bg-gradient-to-r from-amber-500 to-orange-500 
      text-zinc-900 text-[10px] font-bold 
      rounded-full
      animate-pulse
      ${className}
    `}>
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
};