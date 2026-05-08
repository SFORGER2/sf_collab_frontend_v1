// useChatNotiffications.js
// Backwards-compatibility re-export for components that import from this file.
// The real hook and context live in ChatNotificationProvider (Chatnotificationprovider.jsx).
//
// FIX: The original file had a syntax error — an orphaned 'e' character before the
// block comment on line 3 ("e/*xport...") which caused the module to fail silently
// in some bundlers, meaning ChatNotificationBadge and useShowNotification got
// undefined instead of the real hook.

export { useChatNotifications as default } from "@/components/pages/chat/Chatnotificationprovider";