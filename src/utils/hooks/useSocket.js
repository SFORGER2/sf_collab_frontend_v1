import { SOCKET_API_URL } from '@/utils/config';
import { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocket = () => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const socketRef = useRef(null);

    const connectSocket = useCallback(() => {
        const token = localStorage.getItem('access_token') || localStorage.getItem('authToken');

        if (!token) {
            console.warn("Socket connection aborted: No token found.");
            return;
        }

        if (socketRef.current?.connected) return;

        // 3. Initialize connection
        const newSocket = io(SOCKET_API_URL, {
            query: { token },
            transports: ['websocket'],
            reconnectionAttempts: 5,
            reconnectionDelay: 5000,
        });

        newSocket.on('connect', () => {
            console.log('✅ Connected to WebSocket:', newSocket.id);
            setIsConnected(true);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('❌ Disconnected:', reason);
            setIsConnected(false);
        });

        // Handle the online users list from backend
        newSocket.on('get_online_users', (users) => {
            setOnlineUsers(users);
        });

        socketRef.current = newSocket;
        setSocket(newSocket);
    }, []);

    const disconnectSocket = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
            setSocket(null);
            setIsConnected(false);
        }
    }, []);

    useEffect(() => {
        connectSocket();
        return () => disconnectSocket();
    }, [connectSocket, disconnectSocket]);

    return { socket, isConnected, onlineUsers, connectSocket, disconnectSocket };
};

export default useSocket;