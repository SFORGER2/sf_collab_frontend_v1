import { waitlistAPI } from "@/utils/APIs/waitlistAPI";
import { useEffect } from "react";

const HEARTBEAT_THROTTLE = 5 * 60 * 1000; // 5 min

export function useActivityHeartbeat(user, token) {
  useEffect(() => {
    if (!user?.id) return;

    let lastSent = 0;

    const sendHeartbeat = () => {
      const now = Date.now();
      if (now - lastSent < HEARTBEAT_THROTTLE) return;

      lastSent = now;
      waitlistAPI.heartbeat(user.id, token);
    };

    sendHeartbeat();

    window.addEventListener("focus", sendHeartbeat);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        sendHeartbeat();
      }
    });

    return () => {
      window.removeEventListener("focus", sendHeartbeat);
    };
  }, [user?.id, token]);
}
