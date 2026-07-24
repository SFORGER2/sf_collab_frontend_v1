import { createContext, useEffect, useState, useRef, useContext } from "react";
import { io } from "socket.io-client";

const SOCKET_API_URL = import.meta.env.VITE_SOCKET_API_URL || '';

export const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const audioRef = useRef(null);
  // Use a state-based token or a specific key to avoid the localStorage dependency warning
  const token = localStorage.getItem("authToken");

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  useEffect(() => {
    if (!token) return;

    const s = io(SOCKET_API_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      withCredentials: true, // Matches our backend CORS fix
    });

    const handleNotification = (notif) => {
      // Audio Logic (Simplified for clarity)
      try {
        if (!audioRef.current) {
          audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        const oscillator = audioRef.current.createOscillator();
        const gainNode = audioRef.current.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioRef.current.destination);
        oscillator.start();
        oscillator.stop(audioRef.current.currentTime + 0.2);
      } catch (err) {
        console.warn("Audio failed:", err);
      }
    };

    s.on("notification", handleNotification);
    setSocket(s);

    return () => {
      s.off("notification", handleNotification);
      s.disconnect();
    };
  }, [token]); 

  return (
    <SocketContext.Provider value={{ socket, disconnectSocket }}>
      {children}
    </SocketContext.Provider>
  );
};