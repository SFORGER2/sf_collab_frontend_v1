// ============================================
// HOOK FOR MANUAL NOTIFICATIONS

import { useCallback } from "react";
import useChatNotifications from "./useChatNotiffications";

// ============================================
export const useShowNotification = () => {
  const { addNotification } = useChatNotifications();
  
  return useCallback((options) => {
    addNotification({
      id: `manual-${Date.now()}`,
      timestamp: new Date(),
      ...options
    });
  }, [addNotification]);
};
