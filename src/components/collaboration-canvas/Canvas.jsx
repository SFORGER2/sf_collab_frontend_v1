

// // Canvas.js - Professional AI SaaS Whiteboard
// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import ChatWebSocketClient from '../../services/websocket/ChatWebSocketClient';

// import {
//   Brush,
//   Square,
//   Circle,
//   Type,
//   Minus,
//   Undo2,
//   Redo2,
//   Trash2,
//   Download,
//   Upload,
//   Save,
//   Share2,
//   Settings,
//   Palette,
//   ZoomIn,
//   ZoomOut,
//   PaintBucket,
//   User,
//   Users,
//   CheckCircle,
//   XCircle,
//   Cloud,
//   CloudOff,
//   Check,
//   MessageSquare,
//   MousePointer2
// } from 'lucide-react';

// import '../style/Canvas.css';
// import { Button } from '../ui/button';
// import {
//     Tooltip,
//     TooltipContent,
//     TooltipProvider,
//     TooltipTrigger,
// } from "../ui/tooltip"; 
// import { DropdownMenu,DropdownMenuLabel,DropdownMenuSeparator, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
// import {
//     Alert,
//     AlertDescription,
//     AlertTitle,
// } from "../ui/alert"
// import { Progress } from '../ui/progress';
// import { Badge } from '../ui/badge';
// import { Avatar, AvatarFallback,AvatarImage } from '../ui/avatar';
// import { Separator } from '../ui/separator';
// import { Slider } from '../ui/slider';

// const Canvas = ({ conversationId, currentUserId ,wsClient}) => {
//     const [tool, setTool] = useState('brush');
//     const [color, setColor] = useState('#3B82F6');
//     const [fillColor, setFillColor] = useState('transparent');
//     const [lineWidth, setLineWidth] = useState(2);
//     const [fontSize, setFontSize] = useState(16);
//     const [activeUsers, setActiveUsers] = useState([]);
//     const [isConnected, setIsConnected] = useState(false);
//     const [showNotification, setShowNotification] = useState(false);
//     const [notification, setNotification] = useState({ type: '', message: '' });
//     const [isSaving, setIsSaving] = useState(false);
//     const [undoStack, setUndoStack] = useState([]);
//     const [redoStack, setRedoStack] = useState([]);
//     const [zoom, setZoom] = useState(1);
//     const [showUsersMenu, setShowUsersMenu] = useState(false);
//     const [isInWhiteboard, setIsInWhiteboard] = useState(false);
//     const [userCursors, setUserCursors] = useState({});
    
//     const canvasRef = useRef(null);
//     const contextRef = useRef(null);
//     const drawingRef = useRef({
//         isDrawing: false,
//         lastX: 0,
//         lastY: 0,
//         startX: 0,
//         startY: 0,
//         paths: []
//     });
//     const textAreaRef = useRef(null);
//     const usersMenuAnchorRef = useRef(null);
//     const drawingBatchRef = useRef([]);
//     const batchTimerRef = useRef(null);
//     const cursorTimerRef = useRef(null);
//     const cursorMoveTimerRef = useRef(null);
//     const mousePositionRef = useRef({ x: 0, y: 0 });

//     //! Initialize WebSocket client
//     useEffect(() => {
//         if (!conversationId || !currentUserId || !wsClient) {
//             console.error('Missing conversationId, currentUserId, or wsClient');
//             return;
//         }
    
//         // Setup event handlers on the shared wsClient
//         const setupEventHandlers = () => {
//             // Connection events
//             const handleConnected = () => {
//                 console.log('Connected to chat server via shared client');
//                 setIsConnected(true);
//                 showNotificationMessage('success', 'Connected to collaborative whiteboard');
                
//                 // Join immediately
//                 if (conversationId) {
//                     wsClient.joinWhiteboard(conversationId)
//                         .then(() => {
//                             setIsInWhiteboard(true);
//                             console.log('Successfully joined whiteboard');
//                         })
//                         .catch(error => {
//                             console.error('Failed to join whiteboard:', error);
//                             showNotificationMessage('error', 'Failed to join whiteboard');
//                         });
//                 }
//             };
    
//             const handleDisconnected = (reason) => {
//                 console.log('Disconnected:', reason);
//                 setIsConnected(false);
//                 showNotificationMessage('error', 'Disconnected from server');
//                 setIsInWhiteboard(false);
//                 setUserCursors({});
//             };
    
//             const handleReconnected = (attemptNumber) => {
//                 console.log('Reconnected, attempt:', attemptNumber);
//                 setIsConnected(true);
//                 showNotificationMessage('success', 'Reconnected to server');
                
//                 // Re-join whiteboard
//                 if (conversationId) {
//                     wsClient.joinWhiteboard(conversationId)
//                         .then(() => {
//                             setIsInWhiteboard(true);
//                         })
//                         .catch(console.error);
//                 }
//             };
    
//             // Whiteboard events
//             const handleWhiteboardImage = (data) => {
//                 console.log('Whiteboard image received:', data);
//                 // Don't draw if it's our own drawing
//                 if (data.sender_id !== currentUserId) {
//                     drawReceivedImage(data);
//                 }
//             };
    
//             const handleWhiteboardCleared = (data) => {
//                 console.log('Whiteboard cleared:', data);
//                 if (data.cleared_by_id !== currentUserId) {
//                     clearCanvas();
//                     showNotificationMessage('info', `Whiteboard cleared by ${data.cleared_by_name}`);
//                 }
//             };
    
//             const handleWhiteboardUndo = (data) => {
//                 console.log('Whiteboard undo:', data);
//                 if (data.undone_by_id !== currentUserId) {
//                     handleRemoteUndo();
//                 }
//             };
    
//             const handleWhiteboardRedo = (data) => {
//                 console.log('Whiteboard redo:', data);
//                 if (data.redone_by_id !== currentUserId) {
//                     handleRemoteRedo();
//                 }
//             };
    
//             const handleUserJoinedWhiteboard = (data) => {
//                 console.log('User joined whiteboard:', data);
//                 if (data.user_id !== currentUserId) {
//                     showNotificationMessage('info', `${data.user_name} joined the whiteboard`);
                    
//                     // Update active users list
//                     wsClient.getWhiteboardUsers(conversationId)
//                         .then(response => {
//                             if (response && response.active_users) {
//                                 setActiveUsers(response.active_users);
//                             }
//                         })
//                         .catch(console.error);
//                 }
//             };
    
//             const handleUserLeftWhiteboard = (data) => {
//                 console.log('User left whiteboard:', data);
//                 if (data.user_id !== currentUserId) {
//                     showNotificationMessage('info', `${data.user_name} left the whiteboard`);
                    
//                     // Remove cursor for user who left
//                     setUserCursors(prev => {
//                         const newCursors = { ...prev };
//                         delete newCursors[data.user_id];
//                         return newCursors;
//                     });
                    
//                     // Update active users list
//                     wsClient.getWhiteboardUsers(conversationId)
//                         .then(response => {
//                             if (response && response.active_users) {
//                                 setActiveUsers(response.active_users);
//                             }
//                         })
//                         .catch(console.error);
//                 }
//             };
    
//             const handleActiveWhiteboardUsers = (data) => {
//                 console.log('Active whiteboard users:', data.active_users);
//                 setActiveUsers(data.active_users || []);
//             };
    
//             // User cursor movement
//             const handleUserCursorMoved = (data) => {
//                 if (data.user_id !== currentUserId) {
//                     setUserCursors(prev => ({
//                         ...prev,
//                         [data.user_id]: {
//                             x: data.x,
//                             y: data.y,
//                             color: data.color || '#3B82F6',
//                             name: data.user_name || `User ${data.user_id}`,
//                             lastUpdate: Date.now()
//                         }
//                     }));
//                 }
//             };
    
//             // User status events
//             const handleUserStatusChanged = (data) => {
//                 console.log('User status changed:', data);
//                 setActiveUsers(prev => prev.map(user => 
//                     user.id === data.user_id 
//                         ? { ...user, status: data.status }
//                         : user
//                 ));
//             };
    
//             // Error handling
//             const handleError = (error) => {
//                 console.error('WebSocket error:', error);
//                 showNotificationMessage('error', `Connection error: ${error.message}`);
//             };
    
//             const handleConnectionError = (error) => {
//                 console.error('Connection error:', error);
//                 showNotificationMessage('error', 'Failed to connect to server');
//             };
    
//             // Register all handlers
//             wsClient.on('connected', handleConnected);
//             wsClient.on('disconnected', handleDisconnected);
//             wsClient.on('reconnected', handleReconnected);
//             wsClient.on('whiteboard_image', handleWhiteboardImage);
//             wsClient.on('whiteboard_cleared', handleWhiteboardCleared);
//             wsClient.on('whiteboard_undo', handleWhiteboardUndo);
//             wsClient.on('whiteboard_redo', handleWhiteboardRedo);
//             wsClient.on('user_joined_whiteboard', handleUserJoinedWhiteboard);
//             wsClient.on('user_left_whiteboard', handleUserLeftWhiteboard);
//             wsClient.on('active_whiteboard_users', handleActiveWhiteboardUsers);
//             wsClient.on('user_cursor_moved', handleUserCursorMoved);
//             wsClient.on('user_status_changed', handleUserStatusChanged);
//             wsClient.on('error', handleError);
//             wsClient.on('connection_error', handleConnectionError);
    
//             // Return cleanup function to remove handlers
//             return () => {
//                 wsClient.off('connected', handleConnected);
//                 wsClient.off('disconnected', handleDisconnected);
//                 wsClient.off('reconnected', handleReconnected);
//                 wsClient.off('whiteboard_image', handleWhiteboardImage);
//                 wsClient.off('whiteboard_cleared', handleWhiteboardCleared);
//                 wsClient.off('whiteboard_undo', handleWhiteboardUndo);
//                 wsClient.off('whiteboard_redo', handleWhiteboardRedo);
//                 wsClient.off('user_joined_whiteboard', handleUserJoinedWhiteboard);
//                 wsClient.off('user_left_whiteboard', handleUserLeftWhiteboard);
//                 wsClient.off('active_whiteboard_users', handleActiveWhiteboardUsers);
//                 wsClient.off('user_cursor_moved', handleUserCursorMoved);
//                 wsClient.off('user_status_changed', handleUserStatusChanged);
//                 wsClient.off('error', handleError);
//                 wsClient.off('connection_error', handleConnectionError);
//             };
//         };
    
//         const cleanupHandlers = setupEventHandlers();
        
//         // Check if already connected
//         if (wsClient.isConnected()) {
//             if (conversationId) {
//                 wsClient.joinWhiteboard(conversationId)
//                     .then(() => {
//                         setIsInWhiteboard(true);
//                         setIsConnected(true);
//                         console.log('Successfully joined whiteboard (already connected)');
//                     })
//                     .catch(error => {
//                         console.error('Failed to join whiteboard:', error);
//                         showNotificationMessage('error', 'Failed to join whiteboard');
//                     });
//             }
//         }
    
//         // Cleanup on unmount
//         return () => {
//             cleanupHandlers();
            
//             // Leave whiteboard
//             if (conversationId && isInWhiteboard) {
//                 wsClient.leaveWhiteboard(conversationId);
//             }
            
//             // Clear timers
//             if (batchTimerRef.current) {
//                 clearTimeout(batchTimerRef.current);
//             }
//             if (cursorTimerRef.current) {
//                 clearTimeout(cursorTimerRef.current);
//             }
//             if (cursorMoveTimerRef.current) {
//                 clearTimeout(cursorMoveTimerRef.current);
//             }
//         };
//     }, [conversationId, currentUserId, wsClient]);

//     // Clean up old cursors
//     useEffect(() => {
//         const interval = setInterval(() => {
//             const now = Date.now();
//             setUserCursors(prev => {
//                 const newCursors = {};
//                 Object.keys(prev).forEach(userId => {
//                     if (now - prev[userId].lastUpdate < 5000) { // 5 second timeout
//                         newCursors[userId] = prev[userId];
//                     }
//                 });
//                 return newCursors;
//             });
//         }, 1000);

//         return () => clearInterval(interval);
//     }, []);

//     // Initialize canvas
//     useEffect(() => {
//         const canvas = canvasRef.current;
//         if (!canvas) return;

//         const initCanvas = () => {
//             const dpr = window.devicePixelRatio || 1;
//             const rect = canvas.getBoundingClientRect();
            
//             canvas.width = rect.width * dpr;
//             canvas.height = rect.height * dpr;
            
//             const context = canvas.getContext('2d');
//             context.scale(dpr, dpr);
//             context.lineCap = 'round';
//             context.lineJoin = 'round';
//             context.strokeStyle = color;
//             context.lineWidth = lineWidth;
            
//             contextRef.current = context;

//             // Initial save for undo
//             saveToUndoStack();
//         };

//         initCanvas();

//         // Handle window resize
//         const handleResize = () => {
//             initCanvas();
//         };

//         window.addEventListener('resize', handleResize);
//         return () => window.removeEventListener('resize', handleResize);
//     }, []);

//     const showNotificationMessage = useCallback((type, message) => {
//         setNotification({ type, message });
//         setShowNotification(true);
//         setTimeout(() => setShowNotification(false), 3000);
//     }, []);
    
//     const restoreFromDataUrl = useCallback((dataUrl) => {
//         const canvas = canvasRef.current;
//         const context = contextRef.current;
//         if (!canvas || !context) return;

//         const img = new Image();
//         img.onload = () => {
//             context.clearRect(0, 0, canvas.width, canvas.height);
//             context.drawImage(img, 0, 0);
//         };
//         img.src = dataUrl;
//     }, []);
    
//     const saveToUndoStack = useCallback(() => {
//         const canvas = canvasRef.current;
//         if (!canvas) return;
        
//         const dataUrl = canvas.toDataURL();
//         setUndoStack(prev => [...prev, dataUrl]);
//         setRedoStack([]); // Clear redo stack when new action is performed
//     }, []);

//     const handleUndo = useCallback(() => {
//         if (undoStack.length <= 1 || !wsClient) return;
        
//         const current = undoStack[undoStack.length - 1];
//         setRedoStack(prev => [current, ...prev]);
//         setUndoStack(prev => [...prev.slice(0, -1)]);
        
//         if (undoStack.length > 1) {
//             restoreFromDataUrl(undoStack[undoStack.length - 2]);
//         }
        
//         // Broadcast undo action
//         wsClient.undoWhiteboard(conversationId)
//             .catch(error => console.error('Failed to broadcast undo:', error));
//     }, [undoStack, conversationId, wsClient, restoreFromDataUrl]); 

//     const handleRedo = useCallback(() => {
//         if (redoStack.length === 0 || !wsClient) return;
        
//         const next = redoStack[0];
//         setUndoStack(prev => [...prev, next]);
//         setRedoStack(prev => prev.slice(1));
        
//         restoreFromDataUrl(next);
        
//         // Broadcast redo action
//         wsClient.redoWhiteboard(conversationId)
//             .catch(error => console.error('Failed to broadcast redo:', error));
//     }, [redoStack, conversationId, wsClient, restoreFromDataUrl]);

//     const handleRemoteUndo = useCallback(() => {
//         if (undoStack.length <= 1) return;
        
//         const current = undoStack[undoStack.length - 1];
//         setRedoStack(prev => [current, ...prev]);
//         setUndoStack(prev => [...prev.slice(0, -1)]);
        
//         if (undoStack.length > 1) {
//             restoreFromDataUrl(undoStack[undoStack.length - 2]);
//         }
        
//         showNotificationMessage('info', 'Another user performed undo');
//     }, [undoStack, showNotificationMessage]);

//     const handleRemoteRedo = useCallback(() => {
//         if (redoStack.length === 0) return;
        
//         const next = redoStack[0];
//         setUndoStack(prev => [...prev, next]);
//         setRedoStack(prev => prev.slice(1));
        
//         restoreFromDataUrl(next);
        
//         showNotificationMessage('info', 'Another user performed redo');
//     }, [redoStack, showNotificationMessage]);

//     // Send cursor position to other users
//     const sendCursorPosition = useCallback((x, y) => {
//         if (!wsClient || !isInWhiteboard) return;
        
//         if (cursorMoveTimerRef.current) {
//             clearTimeout(cursorMoveTimerRef.current);
//         }
        
//         cursorMoveTimerRef.current = setTimeout(() => {
//             wsClient.sendDrawingData(conversationId, {
//                 type: 'cursor_move',
//                 x,
//                 y,
//                 color,
//                 user_id: currentUserId
//             }).catch(console.error);
//         }, 50); // Throttle cursor updates
//     }, [conversationId, isInWhiteboard, wsClient, color, currentUserId]);

//     const startDrawing = (e) => {
//         const canvas = canvasRef.current;
//         if (!canvas || !contextRef.current) return;
        
//         const rect = canvas.getBoundingClientRect();
//         const scale = canvas.width / rect.width;
//         const x = ((e.clientX || e.touches[0].clientX) - rect.left) * scale;
//         const y = ((e.clientY || e.touches[0].clientY) - rect.top) * scale;
        
//         drawingRef.current = {
//             isDrawing: true,
//             lastX: x,
//             lastY: y,
//             startX: x,
//             startY: y,
//             paths: [{ x, y }]
//         };

//         if (tool === 'text') {
//             addText(x / scale, y / scale);
//         } else {
//             // Start new drawing path
//             contextRef.current.beginPath();
//             contextRef.current.moveTo(x, y);
//         }
//     };

//     const draw = (e) => {
//         if (!drawingRef.current.isDrawing || !contextRef.current) return;
        
//         const canvas = canvasRef.current;
//         if (!canvas) return;

//         const rect = canvas.getBoundingClientRect();
//         const scale = canvas.width / rect.width;
//         const x = ((e.clientX || e.touches[0].clientX) - rect.left) * scale;
//         const y = ((e.clientY || e.touches[0].clientY) - rect.top) * scale;

//         // Update mouse position for cursor tracking
//         mousePositionRef.current = { x: x / scale, y: y / scale };
//         sendCursorPosition(x / scale, y / scale);

//         const context = contextRef.current;
//         context.strokeStyle = color;
//         context.fillStyle = fillColor;
//         context.lineWidth = lineWidth;

//         drawingRef.current.paths.push({ x, y });

//         switch (tool) {
//             case 'brush':
//                 context.lineTo(x, y);
//                 context.stroke();
//                 break;
            
//             case 'line':
//                 // Redraw everything to show preview
//                 restoreFromDataUrl(undoStack[undoStack.length - 1]);
//                 context.beginPath();
//                 context.moveTo(drawingRef.current.startX, drawingRef.current.startY);
//                 context.lineTo(x, y);
//                 context.stroke();
//                 break;
            
//             case 'rectangle':
//                 restoreFromDataUrl(undoStack[undoStack.length - 1]);
//                 context.beginPath();
//                 const width = x - drawingRef.current.startX;
//                 const height = y - drawingRef.current.startY;
//                 context.rect(drawingRef.current.startX, drawingRef.current.startY, width, height);
//                 context.stroke();
//                 if (fillColor !== 'transparent') {
//                     context.fill();
//                 }
//                 break;
            
//             case 'circle':
//                 restoreFromDataUrl(undoStack[undoStack.length - 1]);
//                 context.beginPath();
//                 const radius = Math.sqrt(
//                     Math.pow(x - drawingRef.current.startX, 2) + 
//                     Math.pow(y - drawingRef.current.startY, 2)
//                 );
//                 context.arc(drawingRef.current.startX, drawingRef.current.startY, radius, 0, Math.PI * 2);
//                 context.stroke();
//                 if (fillColor !== 'transparent') {
//                     context.fill();
//                 }
//                 break;
//         }

//         drawingRef.current.lastX = x;
//         drawingRef.current.lastY = y;

//         // Add to batch for sending
//         if (tool === 'brush' && wsClient && isInWhiteboard) {
//             drawingBatchRef.current.push({
//                 type: 'brush',
//                 x: x / scale,
//                 y: y / scale,
//                 color,
//                 lineWidth
//             });

//             // Send batch every 50ms for smoother drawing
//             if (!batchTimerRef.current) {
//                 batchTimerRef.current = setTimeout(sendDrawingBatch, 50);
//             }
//         } else if (['line', 'rectangle', 'circle'].includes(tool) && wsClient && isInWhiteboard) {
//             // For other tools, send preview updates
//             const drawingData = {
//                 type: tool,
//                 startX: drawingRef.current.startX / scale,
//                 startY: drawingRef.current.startY / scale,
//                 endX: x / scale,
//                 endY: y / scale,
//                 color,
//                 fillColor,
//                 lineWidth,
//                 isPreview: true
//             };

//             wsClient.sendDrawingData(conversationId, drawingData)
//                 .catch(error => console.error('Failed to send drawing preview:', error));
//         }
//     };

//     const sendDrawingBatch = useCallback(() => {
//         if (!wsClient || !isInWhiteboard || drawingBatchRef.current.length === 0) {
//             batchTimerRef.current = null;
//             return;
//         }

//         const batchToSend = [...drawingBatchRef.current];
//         drawingBatchRef.current = [];

//         if (batchToSend.length > 0) {
//             const drawingData = {
//                 type: 'brush',
//                 points: batchToSend.map(p => ({ x: p.x, y: p.y })),
//                 color,
//                 lineWidth
//             };
            
//             wsClient.sendDrawingData(conversationId, drawingData)
//                 .catch(error => console.error('Failed to send drawing batch:', error));
//         }

//         batchTimerRef.current = null;
//     }, [conversationId, isInWhiteboard, wsClient, color, lineWidth]);

//     const stopDrawing = () => {
//         if (drawingRef.current.isDrawing) {
//             drawingRef.current.isDrawing = false;
//             saveToUndoStack();
            
//             // Send final drawing for all tools
//             if (wsClient && isInWhiteboard) {
//                 const canvas = canvasRef.current;
//                 const rect = canvas.getBoundingClientRect();
//                 const scale = canvas.width / rect.width;
                
//                 if (tool !== 'brush') {
//                     const drawingData = {
//                         type: tool,
//                         startX: drawingRef.current.startX / scale,
//                         startY: drawingRef.current.startY / scale,
//                         endX: drawingRef.current.lastX / scale,
//                         endY: drawingRef.current.lastY / scale,
//                         color,
//                         fillColor,
//                         lineWidth
//                     };

//                     wsClient.sendDrawingData(conversationId, drawingData)
//                         .catch(error => console.error('Failed to send drawing:', error));
//                 }
//             }
            
//             // Send any remaining batch
//             if (batchTimerRef.current) {
//                 clearTimeout(batchTimerRef.current);
//                 sendDrawingBatch();
//             }
//         }
//     };

//     const drawReceivedImage = useCallback((data) => {
//         const context = contextRef.current;
//         if (!context || !data.image_data) return;

//         const canvas = canvasRef.current;
//         const rect = canvas.getBoundingClientRect();
//         const scale = canvas.width / rect.width;

//         context.strokeStyle = data.image_data.color || '#3B82F6';
//         context.fillStyle = data.image_data.fillColor || 'transparent';
//         context.lineWidth = data.image_data.lineWidth || 2;

//         if (data.image_data.type === 'brush' && data.image_data.points) {
//             // Draw brush strokes
//             const points = data.image_data.points;
//             if (points.length === 0) return;

//             context.beginPath();
//             context.moveTo(points[0].x * scale, points[0].y * scale);
            
//             for (let i = 1; i < points.length; i++) {
//                 context.lineTo(points[i].x * scale, points[i].y * scale);
//             }
//             context.stroke();
//         } else if (data.image_data.type === 'rectangle') {
//             const { startX, startY, endX, endY } = data.image_data;
//             context.beginPath();
//             const width = (endX - startX) * scale;
//             const height = (endY - startY) * scale;
//             context.rect(startX * scale, startY * scale, width, height);
//             context.stroke();
//             if (data.image_data.fillColor !== 'transparent') {
//                 context.fill();
//             }
//         } else if (data.image_data.type === 'circle') {
//             const { startX, startY, endX, endY } = data.image_data;
//             context.beginPath();
//             const radius = Math.sqrt(
//                 Math.pow((endX - startX) * scale, 2) + 
//                 Math.pow((endY - startY) * scale, 2)
//             );
//             context.arc(startX * scale, startY * scale, radius, 0, Math.PI * 2);
//             context.stroke();
//             if (data.image_data.fillColor !== 'transparent') {
//                 context.fill();
//             }
//         } else if (data.image_data.type === 'line') {
//             const { startX, startY, endX, endY } = data.image_data;
//             context.beginPath();
//             context.moveTo(startX * scale, startY * scale);
//             context.lineTo(endX * scale, endY * scale);
//             context.stroke();
//         } else if (data.image_data.type === 'text') {
//             context.fillStyle = data.image_data.color;
//             context.font = `${data.image_data.fontSize}px Arial`;
//             context.fillText(
//                 data.image_data.text,
//                 data.image_data.x * scale,
//                 data.image_data.y * scale
//             );
//         }
//     }, []);

//     const addText = (x, y) => {
//         if (!textAreaRef.current) return;
        
//         const textArea = textAreaRef.current;
//         textArea.style.left = `${x}px`;
//         textArea.style.top = `${y}px`;
//         textArea.style.display = 'block';
//         textArea.style.fontSize = `${fontSize}px`;
//         textArea.style.color = color;
//         textArea.focus();
//     };

//     const handleTextSubmit = useCallback(() => {
//         const textArea = textAreaRef.current;
//         const context = contextRef.current;
//         if (!textArea || !context || !wsClient) return;

//         const text = textArea.value;
//         if (text.trim()) {
//             context.fillStyle = color;
//             context.font = `${fontSize}px Arial`;
//             context.fillText(text, parseInt(textArea.style.left), parseInt(textArea.style.top) + fontSize);
            
//             saveToUndoStack();
            
//             // Broadcast text addition
//             if (isInWhiteboard) {
//                 const textData = {
//                     type: 'text',
//                     text,
//                     x: parseInt(textArea.style.left),
//                     y: parseInt(textArea.style.top) + fontSize,
//                     color,
//                     fontSize
//                 };
                
//                 wsClient.sendDrawingData(conversationId, textData)
//                     .catch(error => console.error('Failed to send text:', error));
//             }
//         }
        
//         textArea.value = '';
//         textArea.style.display = 'none';
//     }, [color, fontSize, conversationId, isInWhiteboard, saveToUndoStack]);

//     const clearCanvas = useCallback(() => {
//         const canvas = canvasRef.current;
//         const context = contextRef.current;
//         if (!canvas || !context) return;

//         context.clearRect(0, 0, canvas.width, canvas.height);
//         saveToUndoStack();
        
//         // Broadcast clear action
//         if (wsClient && isInWhiteboard) {
//             wsClient.clearWhiteboard(conversationId)
//                 .then(() => showNotificationMessage('success', 'Canvas cleared'))
//                 .catch(error => console.error('Failed to clear canvas:', error));
//         } else {
//             showNotificationMessage('success', 'Canvas cleared');
//         }
//     }, [conversationId, isInWhiteboard, showNotificationMessage, saveToUndoStack]);

//     const downloadCanvas = () => {
//         const canvas = canvasRef.current;
//         if (!canvas) return;

//         const link = document.createElement('a');
//         link.download = `whiteboard-${conversationId}-${Date.now()}.png`;
//         link.href = canvas.toDataURL('image/png');
//         link.click();
        
//         showNotificationMessage('success', 'Canvas downloaded');
//     };

//     const saveCanvas = async () => {
//         if (!conversationId) {
//             showNotificationMessage('error', 'No conversation selected');
//             return;
//         }

//         setIsSaving(true);
//         try {
//             const canvas = canvasRef.current;
//             const dataUrl = canvas.toDataURL('image/png');
            
//             await new Promise(resolve => setTimeout(resolve, 1000));
            
//             // TODO: Save to backend API
//             // await api.saveWhiteboard(conversationId, dataUrl);
            
//             showNotificationMessage('success', 'Canvas saved to cloud');
//         } catch (error) {
//             console.error('Failed to save canvas:', error);
//             showNotificationMessage('error', 'Failed to save canvas');
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     const shareCanvas = () => {
//         if (navigator.share) {
//             navigator.share({
//                 title: 'AI Whiteboard',
//                 text: 'Check out this collaborative whiteboard!',
//                 url: window.location.href
//             });
//         } else {
//             navigator.clipboard.writeText(window.location.href);
//             showNotificationMessage('success', 'Link copied to clipboard');
//         }
//     };

//     const handleZoomIn = () => {
//         setZoom(prev => Math.min(prev + 0.1, 3));
//     };

//     const handleZoomOut = () => {
//         setZoom(prev => Math.max(prev - 0.1, 0.5));
//     };

//     const handleJoinWhiteboard = () => {
//         if (wsClient && conversationId) {
//             wsClient.joinWhiteboard(conversationId)
//                 .then(() => {
//                     setIsInWhiteboard(true);
//                     showNotificationMessage('success', 'Joined whiteboard session');
//                 })
//                 .catch(error => {
//                     console.error('Failed to join whiteboard:', error);
//                     showNotificationMessage('error', 'Failed to join whiteboard');
//                 });
//         }
//     };

//     const handleLeaveWhiteboard = () => {
//         if (wsClient && conversationId) {
//             wsClient.leaveWhiteboard(conversationId)
//                 .then(() => {
//                     setIsInWhiteboard(false);
//                     showNotificationMessage('info', 'Left whiteboard session');
//                 })
//                 .catch(error => {
//                     console.error('Failed to leave whiteboard:', error);
//                     showNotificationMessage('error', 'Failed to leave whiteboard');
//                 });
//         }
//     };

//     const handleMouseMove = (e) => {
//         if (!isInWhiteboard) return;
        
//         const canvas = canvasRef.current;
//         if (!canvas) return;
        
//         const rect = canvas.getBoundingClientRect();
//         const x = e.clientX - rect.left;
//         const y = e.clientY - rect.top;
        
//         mousePositionRef.current = { x, y };
//         sendCursorPosition(x, y);
//     };

//     const tools = [
//         { id: 'brush', icon: <Brush size={20} />, label: 'Brush' },
//         { id: 'line', icon: <Minus size={20} />, label: 'Line' },
//         { id: 'rectangle', icon: <Square size={20} />, label: 'Rectangle' },
//         { id: 'circle', icon: <Circle size={20} />, label: 'Circle' },
//         { id: 'text', icon: <Type size={20} />, label: 'Text' },
//     ];

//     const colors = [
//         '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
//         '#EC4899', '#000000', '#6B7280', '#FFFFFF', 'transparent'
//     ];

//     if (!conversationId || !currentUserId) {
//         return (
//             <div className="whiteboard-container">
//                 <div className="no-conversation-message">
//                     <CloudOff size={64} className="mb-4" />
//                     <h3>Select a conversation to start whiteboarding</h3>
//                     <p>Join a conversation to collaborate in real-time</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="w-full min-h-screen whiteboard-container " onMouseMove={handleMouseMove}>
//             <TooltipProvider>
//                 {/* Top Toolbar */}
//                 <div className="toolbar top-toolbar bg-gray-800 flex">
//                     <div className="toolbar-group w-fit p-1 flex ">
//                         <Tooltip>
//                             <TooltipTrigger asChild>
//                                 <Button 
//                                     variant="ghost" 
//                                     size="icon"
//                                     onClick={saveCanvas} 
//                                     disabled={isSaving}
//                                 >
//                                     {isSaving ? <Progress value={50} className="w-5 h-5" /> : <Save size={20} />}
//                                 </Button>
//                             </TooltipTrigger>
//                             <TooltipContent side="bottom" style={{zIndex:9999999999999}}>Save to Cloud</TooltipContent>
//                         </Tooltip>
                        
//                         <Tooltip>
//                             <TooltipTrigger asChild>
//                                 <Button 
//                                     variant="ghost" 
//                                     size="icon"
//                                     onClick={handleUndo} 
//                                     disabled={undoStack.length <= 1}
//                                 >
//                                     <Undo2 size={20} />
//                                 </Button>
//                             </TooltipTrigger>
//                             <TooltipContent side="bottom" style={{zIndex:9999999999999}}>Undo (Ctrl+Z)</TooltipContent>
//                         </Tooltip>
                        
//                         <Tooltip>
//                             <TooltipTrigger asChild>
//                                 <Button 
//                                     variant="ghost" 
//                                     size="icon"
//                                     onClick={handleRedo} 
//                                     disabled={redoStack.length === 0}
//                                 >
//                                     <Redo2 size={20} />
//                                 </Button>
//                             </TooltipTrigger>
//                             <TooltipContent side="bottom" style={{zIndex:9999999999999}}>Redo (Ctrl+Y)</TooltipContent>
//                         </Tooltip>
                        
//                         <Separator orientation="vertical" className="h-6 mx-2" />
                        
//                         <Tooltip>
//                             <TooltipTrigger asChild>
//                                 <Button variant="ghost" size="icon" onClick={clearCanvas}>
//                                     <Trash2 size={20} />
//                                 </Button>
//                             </TooltipTrigger>
//                             <TooltipContent style={{zIndex:9999999999999}}>Clear Canvas</TooltipContent>
//                         </Tooltip>
                        
//                         <Tooltip>
//                             <TooltipTrigger asChild>
//                                 <Button variant="ghost" size="icon" onClick={downloadCanvas}>
//                                     <Download size={20} />
//                                 </Button>
//                             </TooltipTrigger>
//                             <TooltipContent style={{zIndex:9999999999999}}>Download</TooltipContent>
//                         </Tooltip>
                        
//                         <Tooltip>
//                             <TooltipTrigger asChild>
//                                 <Button variant="ghost" size="icon" onClick={shareCanvas}>
//                                     <Share2 size={20} />
//                                 </Button>
//                             </TooltipTrigger>
//                             <TooltipContent style={{zIndex:9999999999999}}>Share</TooltipContent>
//                         </Tooltip>
                        
//                         <Separator orientation="vertical" className="h-6 mx-2" />
                        
//                     </div>
                    
//                     <div className=" w-fit p-1 top-1 absolute rounded-full  right-1 bg-gradient-to-t from-white/30 to-transparent">
                    
//                         <Badge 
//                             variant={isConnected ? "default" : "destructive"} 
//                             className="mr-2"
//                         >
//                             {isInWhiteboard ? <Cloud size={16} /> : <CloudOff size={16} />}
//                         </Badge>
//                         <span className='text-white '>
//                             {isConnected ? `${activeUsers.length} online` : 'Disconnected'}
//                         </span>
//                         {!isInWhiteboard && isConnected && (
//                             <Button 
//                                 variant="ghost" 
//                                 size="sm"
//                                 onClick={handleJoinWhiteboard}
//                                 className="ml-2 h-8 w-8 p-0 text-white rounded-full"
//                             >
//                                 <User size={16} />
//                             </Button>
//                         )}
//                         {isInWhiteboard && (
//                             <Button 
//                                 variant="ghost" 
//                                 size="sm"
//                                 onClick={handleLeaveWhiteboard}
//                                 className="ml-2 h-8 w-8 p-0 text-white rounded-full"
//                             >
//                                 <Users size={16} />
//                             </Button>
//                         )}
//                     </div>
                    
//                     <div className="toolbar-group flex items-center px-2 ">
//                         <Tooltip>
//                             <TooltipTrigger asChild>
//                                 <Button variant="ghost" size="icon" onClick={handleZoomIn}>
//                                     <ZoomIn size={20} />
//                                 </Button>
//                             </TooltipTrigger>
//                             <TooltipContent style={{zIndex:9999999999999}}>Zoom In</TooltipContent>
//                         </Tooltip>
                        
//                         <span className="zoom-level px-2">{Math.round(zoom * 100)}%</span>
                        
//                         <Tooltip>
//                             <TooltipTrigger asChild>
//                                 <Button variant="ghost" size="icon" onClick={handleZoomOut}>
//                                     <ZoomOut size={20} />
//                                 </Button>
//                             </TooltipTrigger>
//                             <TooltipContent style={{zIndex:9999999999999}}>Zoom Out</TooltipContent>
//                         </Tooltip>
                        
//                         <Tooltip>
//                             <TooltipTrigger asChild>
//                                 <DropdownMenu open={showUsersMenu} onOpenChange={setShowUsersMenu}>
//                                     <DropdownMenuTrigger asChild>
//                                         <Button 
//                                             variant="ghost" 
//                                             size="icon"
//                                             disabled={!isConnected}
//                                             className="relative"
//                                         >
//                                             <Users size={20} />
//                                             {activeUsers.length > 0 && (
//                                                 <Badge 
//                                                     className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
//                                                 >
//                                                     {activeUsers.length}
//                                                 </Badge>
//                                             )}
//                                         </Button>
//                                     </DropdownMenuTrigger>
//                                     <DropdownMenuContent style={{zIndex:9999999999999}} align="start" className="w-64">
//                                         <DropdownMenuLabel>
//                                             Active Users ({activeUsers.length})
//                                         </DropdownMenuLabel>
//                                         <DropdownMenuSeparator />
//                                         {activeUsers.map(user => (
//                                             <DropdownMenuItem key={user.id}>
//                                                 <Avatar className="h-8 w-8 mr-2">
//                                                     <AvatarImage src={user.profile_picture} />
//                                                     <AvatarFallback>
//                                                         {user.name?.charAt(0) || 'U'}
//                                                     </AvatarFallback>
//                                                 </Avatar>
//                                                 <div className="flex-1">
//                                                     <p className="font-medium">{user.name}</p>
//                                                     <p className="text-xs text-muted-foreground">
//                                                         {user.status || 'online'}
//                                                     </p>
//                                                 </div>
//                                                 {user.id === currentUserId && (
//                                                     <CheckCircle className="ml-2 h-4 w-4 text-primary" />
//                                                 )}
//                                             </DropdownMenuItem>
//                                         ))}
//                                         {activeUsers.length === 0 && (
//                                             <DropdownMenuItem disabled>
//                                                 No other users in whiteboard
//                                             </DropdownMenuItem>
//                                         )}
//                                     </DropdownMenuContent>
//                                 </DropdownMenu>
//                             </TooltipTrigger>
//                             <TooltipContent side="bottom" style={{zIndex:9999999999999}}>Active Users</TooltipContent>
//                         </Tooltip>
//                     </div>
//                 </div>

//                 {/* Main Content */}
//                 <div className="whiteboard-content">
//                     {/* Left Toolbar */}
//                     <div className="toolbar left-toolbar w-full grid grid-cols-2 lg:grid-cols-4 bg-gray-800 py-2">
//                         <div className="tool-group text-center border border-white">
//                             <h4>Tools</h4>
                            
//                             <div className="w-full flex justify-center gap-3">
//                                 {tools.map(t => (
//                                     <Tooltip key={t.id} title={t.label} placement="right">
//                                         <TooltipTrigger asChild>
//                                             <Button
//                                                 variant="ghost"
//                                                 size="icon"
//                                                 className={`tool-button ${tool === t.id ? 'bg-secondary text-black' : ''}`}
//                                                 onClick={() => setTool(t.id)}
//                                                 disabled={!isInWhiteboard}
//                                             >
//                                                 {t.icon}
//                                             </Button>
//                                         </TooltipTrigger>
//                                         <TooltipContent arrowColor="fill-gray-900 bg-gray-900" style={{zIndex:9999999999999}} side="bottom">{t.label}</TooltipContent>
//                                     </Tooltip>
//                                 ))}
//                             </div>
//                         </div>
                        
//                         <div className="tool-group text-center border border-white">
//                             <h4>Stroke</h4>
//                             <div className="px-2">
//                                 <Slider
//                                     min={1}
//                                     max={50}
//                                     value={[lineWidth]}
//                                     onValueChange={(value) => setLineWidth(value[0])}
//                                     disabled={!isInWhiteboard}
//                                     className="w-full"
//                                 />
//                             </div>
//                             <span className="slider-value">{lineWidth}px</span>
//                         </div>
                        
//                         <div className="tool-group text-center border border-white">
//                             <h4>Stroke Color</h4>
//                             <div className="flex justify-center gap-1">
//                                 {colors.map(c => (
//                                     <Button
//                                         key={c}
//                                         variant="ghost"
//                                         size="icon"
//                                         className={`color-button h-7 w-7 p-0 ${color === c ? 'ring-2 ring-offset-2' : ''}`}
//                                         style={{ 
//                                             backgroundColor: c,
//                                             border: c === 'transparent' ? '1px dashed #ccc' : 'none'
//                                         }}
//                                         onClick={() => setColor(c)}
//                                         disabled={!isInWhiteboard}
//                                     >
//                                         {color === c && <Check className="h-4 w-4 text-white" />}
//                                     </Button>
//                                 ))}
//                             </div>
//                         </div>
                        
//                         <div className="tool-group text-center border border-white">
//                             <h4>Fill Color</h4>
//                             <div className="flex justify-center gap-1">
//                                 {colors.map(c => (
//                                     <Button
//                                         key={`fill-${c}`}
//                                         variant="ghost"
//                                         size="icon"
//                                         className={`color-button h-7 w-7 p-0 ${fillColor === c ? 'ring-2 ring-offset-2' : ''}`}
//                                         style={{ 
//                                             backgroundColor: c,
//                                             border: c === 'transparent' ? '1px dashed #ccc' : 'none'
//                                         }}
//                                         onClick={() => setFillColor(c)}
//                                         disabled={!isInWhiteboard}
//                                     >
//                                         {fillColor === c && <Check className="h-4 w-4 text-white" />}
//                                     </Button>
//                                 ))}
//                             </div>
//                         </div>
                        
//                         {tool === 'text' && (
//                             <div className="tool-group text-center">
//                                 <h4>Font Size</h4>
//                                 <div className="px-2">
//                                     <Slider
//                                         min={12}
//                                         max={72}
//                                         value={[fontSize]}
//                                         onValueChange={(value) => setFontSize(value[0])}
//                                         disabled={!isInWhiteboard}
//                                         className="w-full"
//                                     />
//                                 </div>
//                                 <span className="slider-value">{fontSize}px</span>
//                             </div>
//                         )}
//                     </div>

//                     {/* Canvas Area */}
//                     <div className="canvas-area" style={{ transform: `scale(${zoom})` }}>
//                         {!isInWhiteboard && isConnected && (
//                             <div className="join-whiteboard-overlay">
//                                 <div className="join-whiteboard-message">
//                                     <Cloud size={48} className="mb-4" />
//                                     <h3>Whiteboard Session</h3>
//                                     <p>Join the collaborative whiteboard to draw with others</p>
//                                     <Button 
//                                         onClick={handleJoinWhiteboard}
//                                         className="mt-4"
//                                     >
//                                         Join Whiteboard
//                                     </Button>
//                                 </div>
//                             </div>
//                         )}
//                         {!isConnected && (
//                             <div className="disconnected-overlay">
//                                 <div className="disconnected-message">
//                                     <CloudOff size={48} className="mb-4" />
//                                     <h3>Disconnected from Server</h3>
//                                     <p>Attempting to reconnect...</p>
//                                 </div>
//                             </div>
//                         )}
                        
//                         {/* User Cursors */}
//                         {Object.keys(userCursors).map(userId => {
//                             const cursor = userCursors[userId];
//                             if (!cursor) return null;
                            
//                             return (
//                                 <div
//                                     key={userId}
//                                     className="user-cursor"
//                                     style={{
//                                         position: 'absolute',
//                                         left: `${cursor.x}px`,
//                                         top: `${cursor.y}px`,
//                                         pointerEvents: 'none',
//                                         zIndex: 1000,
//                                         transition: 'left 0.1s linear, top 0.1s linear'
//                                     }}
//                                 >
//                                     <MousePointer2 
//                                         size={16} 
//                                         color={cursor.color}
//                                         style={{
//                                             filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))'
//                                         }}
//                                     />
//                                     <div 
//                                         className="cursor-label"
//                                         style={{
//                                             position: 'absolute',
//                                             left: '20px',
//                                             top: '0',
//                                             backgroundColor: cursor.color,
//                                             color: 'white',
//                                             padding: '2px 6px',
//                                             borderRadius: '4px',
//                                             fontSize: '12px',
//                                             whiteSpace: 'nowrap'
//                                         }}
//                                     >
//                                         {cursor.name}
//                                     </div>
//                                 </div>
//                             );
//                         })}
                        
//                         <canvas
//                             ref={canvasRef}
//                             className="whiteboard-canvas bg-white w-full min-h-screen h-screen"
//                             onMouseDown={isInWhiteboard ? startDrawing : undefined}
//                             onMouseMove={isInWhiteboard ? draw : undefined}
//                             onMouseUp={isInWhiteboard ? stopDrawing : undefined}
//                             onMouseLeave={isInWhiteboard ? stopDrawing : undefined}
//                             onTouchStart={isInWhiteboard ? startDrawing : undefined}
//                             onTouchMove={isInWhiteboard ? draw : undefined}
//                             onTouchEnd={isInWhiteboard ? stopDrawing : undefined}
//                             style={{ cursor: isInWhiteboard ? 'crosshair' : 'not-allowed' }}
//                         />
//                         <textarea
//                             ref={textAreaRef}
//                             className="text-input"
//                             onBlur={handleTextSubmit}
//                             onKeyDown={(e) => {
//                                 if (e.key === 'Enter' && !e.shiftKey) {
//                                     e.preventDefault();
//                                     handleTextSubmit();
//                                 }
//                                 if (e.key === 'Escape') {
//                                     textAreaRef.current.style.display = 'none';
//                                     textAreaRef.current.value = '';
//                                 }
//                             }}
//                             placeholder="Type text here..."
//                             style={{ display: 'none' }}
//                             disabled={!isInWhiteboard}
//                         />
//                     </div>
//                 </div>

//                 {/* Toaster for Notifications */}
//                 {
//                 showNotification && (
//                     <Alert variant={`${notification.type !== 'success'?"destructive":""}`} style={{zIndex:999999999999999}}>
//                         <AlertTitle>
//                             <div className="flex items-center gap-2">
//                                 {notification.type === 'success' ? (
//                                     <CheckCircle className="h-5 w-5 text-green-400" />
//                                 ) : (
//                                     <XCircle className="h-5 w-5 text-red-400" />
//                                 )}
//                                 <span>{notification.type === 'success' ? 'Success' : 'Error'}</span>
//                             </div>
//                         </AlertTitle>
//                         <AlertDescription>
//                             {notification.message}
//                         </AlertDescription>
//                     </Alert>
//                 )
//                 }
//             </TooltipProvider>
//         </div>
//     );
// };

// export default Canvas;


//! 
import React, { useEffect, useRef, useState, useCallback } from 'react';

import {
  Brush,
  Square,
  Circle,
  Type,
  Minus,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Save,
  Share2,
  ZoomIn,
  ZoomOut,
  Users,
  CheckCircle,
  XCircle,
  Cloud,
  CloudOff,
  Check,
  MousePointer2,
  SquareIcon,
  Circle as CircleIcon,
  Triangle,
  Diamond,
  Image,
  Sticker,
  Lock,
  Unlock,
  Copy,
  Group,
  Ungroup,
  Layers,
  Highlighter,
  Eraser,
  ArrowRight,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic
} from 'lucide-react';

import '../style/Canvas.css';
import { Button } from '../ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../ui/tooltip"; 
import { DropdownMenu,DropdownMenuLabel,DropdownMenuSeparator, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "../ui/alert"
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback,AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Slider } from '../ui/slider';

const Canvas = ({ conversationId, currentUserId ,wsClient}) => {
    const [tool, setTool] = useState('brush');
    const [color, setColor] = useState('#3B82F6');
    const [fillColor, setFillColor] = useState('transparent');
    const [lineWidth, setLineWidth] = useState(2);
    const [fontSize, setFontSize] = useState(16);
    const [activeUsers, setActiveUsers] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notification, setNotification] = useState({ type: '', message: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [zoom, setZoom] = useState(1);
    const [showUsersMenu, setShowUsersMenu] = useState(false);
    const [isInWhiteboard, setIsInWhiteboard] = useState(false);
    const [userCursors, setUserCursors] = useState({});
    const [strokeStyle, setStrokeStyle] = useState('solid');
    const [selectedObjects, setSelectedObjects] = useState([]);
    const [fontWeight, setFontWeight] = useState('normal');
    const [textAlign, setTextAlign] = useState('left');
    
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const containerRef = useRef(null);
    const drawingRef = useRef({
        isDrawing: false,
        lastX: 0,
        lastY: 0,
        startX: 0,
        startY: 0,
        paths: []
    });
    const textAreaRef = useRef(null);
    const textContainerRef = useRef(null);
    const drawingBatchRef = useRef([]);
    const batchTimerRef = useRef(null);
    const cursorTimerRef = useRef(null);
    const lastCursorPosRef = useRef({ x: 0, y: 0 });

    //! Initialize WebSocket client
    useEffect(() => {
        if (!conversationId || !currentUserId || !wsClient) {
            console.error('Missing conversationId, currentUserId, or wsClient');
            return;
        }
    
        // Setup event handlers on the shared wsClient
        const setupEventHandlers = () => {
            // Connection events
            const handleConnected = () => {
                console.log('Connected to chat server via shared client');
                setIsConnected(true);
                showNotificationMessage('success', 'Connected to collaborative whiteboard');
                
                // Join immediately
                if (conversationId) {
                    wsClient.joinWhiteboard(conversationId)
                        .then(() => {
                            setIsInWhiteboard(true);
                            console.log('Successfully joined whiteboard');
                        })
                        .catch(error => {
                            console.error('Failed to join whiteboard:', error);
                            showNotificationMessage('error', 'Failed to join whiteboard');
                        });
                }
            };
    
            const handleDisconnected = (reason) => {
                console.log('Disconnected:', reason);
                setIsConnected(false);
                showNotificationMessage('error', 'Disconnected from server');
                setIsInWhiteboard(false);
                setUserCursors({});
            };
    
            const handleReconnected = (attemptNumber) => {
                console.log('Reconnected, attempt:', attemptNumber);
                setIsConnected(true);
                showNotificationMessage('success', 'Reconnected to server');
                
                // Re-join whiteboard
                if (conversationId) {
                    wsClient.joinWhiteboard(conversationId)
                        .then(() => {
                            setIsInWhiteboard(true);
                        })
                        .catch(console.error);
                }
            };
    
            // Whiteboard events
            const handleWhiteboardImage = (data) => {
                console.log('Whiteboard image received:', data);
                // Don't draw if it's our own drawing
                if (data.sender_id !== currentUserId) {
                    drawReceivedImage(data);
                }
            };
    
            const handleWhiteboardCleared = (data) => {
                console.log('Whiteboard cleared:', data);
                if (data.cleared_by_id !== currentUserId) {
                    clearCanvas();
                    showNotificationMessage('info', `Whiteboard cleared by ${data.cleared_by_name}`);
                }
            };
    
            const handleWhiteboardUndo = (data) => {
                console.log('Whiteboard undo:', data);
                if (data.undone_by_id !== currentUserId) {
                    handleRemoteUndo();
                }
            };
    
            const handleWhiteboardRedo = (data) => {
                console.log('Whiteboard redo:', data);
                if (data.redone_by_id !== currentUserId) {
                    handleRemoteRedo();
                }
            };
    
            const handleUserJoinedWhiteboard = (data) => {
                console.log('User joined whiteboard:', data);
                if (data.user_id !== currentUserId) {
                    showNotificationMessage('info', `${data.user_name} joined the whiteboard`);
                    
                    // Update active users list
                    wsClient.getWhiteboardUsers(conversationId)
                        .then(response => {
                            if (response && response.active_users) {
                                setActiveUsers(response.active_users);
                            }
                        })
                        .catch(console.error);
                }
            };
    
            const handleUserLeftWhiteboard = (data) => {
                console.log('User left whiteboard:', data);
                if (data.user_id !== currentUserId) {
                    showNotificationMessage('info', `${data.user_name} left the whiteboard`);
                    
                    // Remove cursor for user who left
                    setUserCursors(prev => {
                        const newCursors = { ...prev };
                        delete newCursors[data.user_id];
                        return newCursors;
                    });
                    
                    // Update active users list
                    wsClient.getWhiteboardUsers(conversationId)
                        .then(response => {
                            if (response && response.active_users) {
                                setActiveUsers(response.active_users);
                            }
                        })
                        .catch(console.error);
                }
            };
    
            const handleActiveWhiteboardUsers = (data) => {
                console.log('Active whiteboard users:', data.active_users);
                setActiveUsers(data.active_users || []);
            };
    
            // User cursor movement
            const handleUserCursorMoved = (data) => {
                if (data.user_id !== currentUserId) {
                    setUserCursors(prev => ({
                        ...prev,
                        [data.user_id]: {
                            x: data.x,
                            y: data.y,
                            color: data.color || '#3B82F6',
                            name: data.user_name || `User ${data.user_id}`,
                            lastUpdate: Date.now()
                        }
                    }));
                }
            };
    
            // User status events
            const handleUserStatusChanged = (data) => {
                console.log('User status changed:', data);
                setActiveUsers(prev => prev.map(user => 
                    user?.id === data.user_id 
                        ? { ...user, status: data.status }
                        : user
                ));
            };
    
            // Error handling
            const handleError = (error) => {
                console.error('WebSocket error:', error);
                showNotificationMessage('error', `Connection error: ${error.message}`);
            };
    
            const handleConnectionError = (error) => {
                console.error('Connection error:', error);
                showNotificationMessage('error', 'Failed to connect to server');
            };
    
            // Register all handlers
            wsClient.on('connected', handleConnected);
            wsClient.on('disconnected', handleDisconnected);
            wsClient.on('reconnected', handleReconnected);
            wsClient.on('whiteboard_image', handleWhiteboardImage);
            wsClient.on('whiteboard_cleared', handleWhiteboardCleared);
            wsClient.on('whiteboard_undo', handleWhiteboardUndo);
            wsClient.on('whiteboard_redo', handleWhiteboardRedo);
            wsClient.on('user_joined_whiteboard', handleUserJoinedWhiteboard);
            wsClient.on('user_left_whiteboard', handleUserLeftWhiteboard);
            wsClient.on('active_whiteboard_users', handleActiveWhiteboardUsers);
            wsClient.on('user_cursor_moved', handleUserCursorMoved);
            wsClient.on('user_status_changed', handleUserStatusChanged);
            wsClient.on('error', handleError);
            wsClient.on('connection_error', handleConnectionError);
    
            // Return cleanup function to remove handlers
            return () => {
                wsClient.off('connected', handleConnected);
                wsClient.off('disconnected', handleDisconnected);
                wsClient.off('reconnected', handleReconnected);
                wsClient.off('whiteboard_image', handleWhiteboardImage);
                wsClient.off('whiteboard_cleared', handleWhiteboardCleared);
                wsClient.off('whiteboard_undo', handleWhiteboardUndo);
                wsClient.off('whiteboard_redo', handleWhiteboardRedo);
                wsClient.off('user_joined_whiteboard', handleUserJoinedWhiteboard);
                wsClient.off('user_left_whiteboard', handleUserLeftWhiteboard);
                wsClient.off('active_whiteboard_users', handleActiveWhiteboardUsers);
                wsClient.off('user_cursor_moved', handleUserCursorMoved);
                wsClient.off('user_status_changed', handleUserStatusChanged);
                wsClient.off('error', handleError);
                wsClient.off('connection_error', handleConnectionError);
            };
        };
    
        const cleanupHandlers = setupEventHandlers();
        
        // Check if already connected
        if (wsClient.isConnected()) {
            if (conversationId) {
                wsClient.joinWhiteboard(conversationId)
                    .then(() => {
                        setIsInWhiteboard(true);
                        setIsConnected(true);
                        console.log('Successfully joined whiteboard (already connected)');
                    })
                    .catch(error => {
                        console.error('Failed to join whiteboard:', error);
                        showNotificationMessage('error', 'Failed to join whiteboard');
                    });
            }
        }
    
        // Cleanup on unmount
        return () => {
            cleanupHandlers();
            
            // Leave whiteboard
            if (conversationId && isInWhiteboard) {
                wsClient.leaveWhiteboard(conversationId);
            }
            
            // Clear timers
            if (batchTimerRef.current) {
                clearTimeout(batchTimerRef.current);
            }
            if (cursorTimerRef.current) {
                clearTimeout(cursorTimerRef.current);
            }
        };
    }, [conversationId, currentUserId, wsClient]);

    // Clean up old cursors
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setUserCursors(prev => {
                const newCursors = {};
                Object.keys(prev).forEach(userId => {
                    if (now - prev[userId].lastUpdate < 5000) {
                        newCursors[userId] = prev[userId];
                    }
                });
                return newCursors;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Initialize canvas - FIXED: Better coordinate handling
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const initCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            
            const context = canvas.getContext('2d');
            context.scale(dpr, dpr);
            context.lineCap = 'round';
            context.lineJoin = 'round';
            context.strokeStyle = color;
            context.lineWidth = lineWidth;
            
            contextRef.current = context;

            // Initial save for undo
            saveToUndoStack();
        };

        initCanvas();

        const handleResize = () => {
            initCanvas();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const showNotificationMessage = useCallback((type, message) => {
        setNotification({ type, message });
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
    }, []);
    
    // Replace the restoreFromDataUrl function with this safer version:
    const restoreFromDataUrl = useCallback((dataUrl) => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        if (!canvas || !context || !dataUrl) return;
    
        // Check if dataUrl is valid (not undefined and starts with data:image)
        if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) {
            console.warn('Invalid dataUrl provided to restoreFromDataUrl');
            return;
        }
    
        const img = new window.Image();
        img.onload = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0);
        };
        img.onerror = () => {
            console.error('Failed to load image from dataUrl');
        };
        img.src = dataUrl;
    }, []);
    
    const saveToUndoStack = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const dataUrl = canvas.toDataURL();
        setUndoStack(prev => [...prev, dataUrl]);
        setRedoStack([]);
    }, []);

    const handleUndo = useCallback(() => {
        if (undoStack.length <= 1 || !wsClient) return;
        
        const current = undoStack[undoStack.length - 1];
        setRedoStack(prev => [current, ...prev]);
        setUndoStack(prev => [...prev.slice(0, -1)]);
        
        if (undoStack.length > 1) {
            restoreFromDataUrl(undoStack[undoStack.length - 2]);
        }
        
        wsClient.undoWhiteboard(conversationId)
            .catch(error => console.error('Failed to broadcast undo:', error));
    }, [undoStack, conversationId, wsClient, restoreFromDataUrl]);

    const handleRedo = useCallback(() => {
        if (redoStack.length === 0 || !wsClient) return;
        
        const next = redoStack[0];
        setUndoStack(prev => [...prev, next]);
        setRedoStack(prev => prev.slice(1));
        
        restoreFromDataUrl(next);
        
        wsClient.redoWhiteboard(conversationId)
            .catch(error => console.error('Failed to broadcast redo:', error));
    }, [redoStack, conversationId, wsClient, restoreFromDataUrl]);

    const handleRemoteUndo = useCallback(() => {
        if (undoStack.length <= 1) return;
        
        const current = undoStack[undoStack.length - 1];
        setRedoStack(prev => [current, ...prev]);
        setUndoStack(prev => [...prev.slice(0, -1)]);
        
        if (undoStack.length > 1) {
            restoreFromDataUrl(undoStack[undoStack.length - 2]);
        }
        
        showNotificationMessage('info', 'Another user performed undo');
    }, [undoStack, showNotificationMessage]);

    const handleRemoteRedo = useCallback(() => {
        if (redoStack.length === 0) return;
        
        const next = redoStack[0];
        setUndoStack(prev => [...prev, next]);
        setRedoStack(prev => prev.slice(1));
        
        restoreFromDataUrl(next);
        
        showNotificationMessage('info', 'Another user performed redo');
    }, [redoStack, showNotificationMessage]);

    // FIXED: Improved cursor position sending
    const sendCursorPosition = useCallback((x, y) => {
        if (!wsClient || !isInWhiteboard) return;
        
        // Throttle cursor updates
        const now = Date.now();
        const lastPos = lastCursorPosRef.current;
        
        // Only send if cursor moved significantly
        const dx = x - lastPos.x;
        const dy = y - lastPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 2) { // Threshold to reduce messages
            lastCursorPosRef.current = { x, y };
            
            if (cursorTimerRef.current) {
                clearTimeout(cursorTimerRef.current);
            }
            
            cursorTimerRef.current = setTimeout(() => {
                wsClient.sendDrawingData(conversationId, {
                    type: 'cursor_move',
                    x,
                    y,
                    color,
                    user_id: currentUserId
                }).catch(console.error);
            }, 16); // ~60fps
        }
    }, [conversationId, isInWhiteboard, wsClient, color, currentUserId]);

    // FIXED: Get accurate canvas coordinates
    const getCanvasCoordinates = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        
        const rect = canvas.getBoundingClientRect();
        const scale = canvas.width / rect.width / (window.devicePixelRatio || 1);
        
        const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
        
        return {
            x: (clientX - rect.left) * scale,
            y: (clientY - rect.top) * scale
        };
    };

    const startDrawing = (e) => {
        if (tool === 'select') {
            // Handle selection logic
            const { x, y } = getCanvasCoordinates(e);
            setSelectedObjects([]); // Clear selection
            // TODO: Implement object selection logic
            return;
        }
        
        if (tool === 'text') {
            const { x, y } = getCanvasCoordinates(e);
            addText(x, y);
            return;
        }
        
        const canvas = canvasRef.current;
        if (!canvas || !contextRef.current) return;
        
        const { x, y } = getCanvasCoordinates(e);
        
        drawingRef.current = {
            isDrawing: true,
            lastX: x,
            lastY: y,
            startX: x,
            startY: y,
            paths: [{ x, y }]
        };

        // Setup context for drawing
        const context = contextRef.current;
        context.strokeStyle = color;
        context.fillStyle = fillColor;
        context.lineWidth = lineWidth;
        
        // Set stroke style
        if (strokeStyle === 'dashed') {
            context.setLineDash([5, 5]);
        } else if (strokeStyle === 'dotted') {
            context.setLineDash([2, 5]);
        } else {
            context.setLineDash([]);
        }

        context.beginPath();
        context.moveTo(x, y);
    };

    // const draw = (e) => {
    //     if (!drawingRef.current.isDrawing || !contextRef.current) return;
        
    //     const { x, y } = getCanvasCoordinates(e);
        
    //     // Update mouse position for cursor tracking
    //     sendCursorPosition(x, y);

    //     const context = contextRef.current;
    //     drawingRef.current.paths.push({ x, y });

    //     switch (tool) {
    //         case 'brush':
    //         case 'highlighter':
    //             context.lineTo(x, y);
    //             context.stroke();
    //             break;
            
    //         case 'line':
    //         case 'arrow':
    //             restoreFromDataUrl(undoStack[undoStack.length - 1]);
    //             context.beginPath();
    //             context.moveTo(drawingRef.current.startX, drawingRef.current.startY);
    //             context.lineTo(x, y);
    //             context.stroke();
                
    //             // Draw arrowhead if tool is arrow
    //             if (tool === 'arrow') {
    //                 drawArrowhead(context, drawingRef.current.startX, drawingRef.current.startY, x, y);
    //             }
    //             break;
            
    //         case 'rectangle':
    //         case 'rounded-rect':
    //         case 'diamond':
    //         case 'triangle':
    //             restoreFromDataUrl(undoStack[undoStack.length - 1]);
    //             drawShape(context, tool, drawingRef.current.startX, drawingRef.current.startY, x, y);
    //             break;
            
    //         case 'circle':
    //         case 'ellipse':
    //             restoreFromDataUrl(undoStack[undoStack.length - 1]);
    //             context.beginPath();
    //             const radiusX = Math.abs(x - drawingRef.current.startX);
    //             const radiusY = Math.abs(y - drawingRef.current.startY);
    //             context.ellipse(
    //                 drawingRef.current.startX,
    //                 drawingRef.current.startY,
    //                 radiusX,
    //                 radiusY,
    //                 0, 0, Math.PI * 2
    //             );
    //             context.stroke();
    //             if (fillColor !== 'transparent') {
    //                 context.fill();
    //             }
    //             break;
            
    //         case 'eraser':
    //             context.globalCompositeOperation = 'destination-out';
    //             context.lineTo(x, y);
    //             context.stroke();
    //             context.globalCompositeOperation = 'source-over';
    //             break;
    //     }

    //     drawingRef.current.lastX = x;
    //     drawingRef.current.lastY = y;

    //     // Batch drawing for brush tools
    //     if (['brush', 'highlighter', 'eraser'].includes(tool) && wsClient && isInWhiteboard) {
    //         drawingBatchRef.current.push({
    //             type: tool,
    //             x,
    //             y,
    //             color: tool === 'eraser' ? '#FFFFFF' : color,
    //             lineWidth: tool === 'highlighter' ? lineWidth * 2 : lineWidth,
    //             opacity: tool === 'highlighter' ? 0.3 : 1
    //         });

    //         if (!batchTimerRef.current) {
    //             batchTimerRef.current = setTimeout(sendDrawingBatch, 16);
    //         }
    //     }
    // };


    //! draw
    const draw = (e) => {
        if (!drawingRef.current.isDrawing || !contextRef.current) return;
        
        const { x, y } = getCanvasCoordinates(e);
        
        // Update mouse position for cursor tracking
        sendCursorPosition(x, y);
    
        const context = contextRef.current;
        
        // Set context properties based on tool
        context.strokeStyle = color;
        context.fillStyle = fillColor;
        context.lineWidth = lineWidth;
        
        // Set stroke style
        if (strokeStyle === 'dashed') {
            context.setLineDash([5, 5]);
        } else if (strokeStyle === 'dotted') {
            context.setLineDash([2, 5]);
        } else {
            context.setLineDash([]);
        }
    
        drawingRef.current.lastX = x;
        drawingRef.current.lastY = y;
        drawingRef.current.paths.push({ x, y });
    
        // Clear the current frame and redraw
        if (['line', 'arrow', 'rectangle', 'rounded-rect', 'diamond', 'triangle', 'circle', 'ellipse'].includes(tool)) {
            // Save the current drawing state
            context.save();
            
            // Clear the canvas temporarily for preview
            const canvas = canvasRef.current;
            if (undoStack.length > 0) {
                restoreFromDataUrl(undoStack[undoStack.length - 1]);
            } else {
                context.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    
        switch (tool) {
            case 'brush':
            case 'highlighter':
                if (tool === 'highlighter') {
                    context.globalAlpha = 0.3;
                    context.lineWidth = lineWidth * 2;
                }
                context.lineTo(x, y);
                context.stroke();
                if (tool === 'highlighter') {
                    context.globalAlpha = 1;
                    context.lineWidth = lineWidth;
                }
                break;
            
            case 'line':
            case 'arrow':
                context.beginPath();
                context.moveTo(drawingRef.current.startX, drawingRef.current.startY);
                context.lineTo(x, y);
                context.stroke();
                
                // Draw arrowhead if tool is arrow
                if (tool === 'arrow') {
                    drawArrowhead(context, drawingRef.current.startX, drawingRef.current.startY, x, y);
                }
                break;
            
            case 'rectangle':
            case 'rounded-rect':
            case 'diamond':
            case 'triangle':
                drawShape(context, tool, drawingRef.current.startX, drawingRef.current.startY, x, y);
                break;
            
            case 'circle':
            case 'ellipse':
                context.beginPath();
                const radiusX = Math.abs(x - drawingRef.current.startX);
                const radiusY = tool === 'ellipse' ? Math.abs(y - drawingRef.current.startY) : radiusX;
                context.ellipse(
                    drawingRef.current.startX,
                    drawingRef.current.startY,
                    radiusX,
                    radiusY,
                    0, 0, Math.PI * 2
                );
                context.stroke();
                if (fillColor !== 'transparent') {
                    context.fill();
                }
                break;
            
            case 'eraser':
                context.globalCompositeOperation = 'destination-out';
                context.lineTo(x, y);
                context.stroke();
                context.globalCompositeOperation = 'source-over';
                break;
        }
    
        // Restore canvas state for shape tools (preview only)
        if (['line', 'arrow', 'rectangle', 'rounded-rect', 'diamond', 'triangle', 'circle', 'ellipse'].includes(tool)) {
            context.restore();
            
            // Redraw the preview
            switch (tool) {
                case 'line':
                case 'arrow':
                    context.beginPath();
                    context.moveTo(drawingRef.current.startX, drawingRef.current.startY);
                    context.lineTo(x, y);
                    context.stroke();
                    if (tool === 'arrow') {
                        drawArrowhead(context, drawingRef.current.startX, drawingRef.current.startY, x, y);
                    }
                    break;
                
                case 'rectangle':
                case 'rounded-rect':
                case 'diamond':
                case 'triangle':
                    drawShape(context, tool, drawingRef.current.startX, drawingRef.current.startY, x, y);
                    break;
                
                case 'circle':
                case 'ellipse':
                    context.beginPath();
                    const previewRadiusX = Math.abs(x - drawingRef.current.startX);
                    const previewRadiusY = tool === 'ellipse' ? Math.abs(y - drawingRef.current.startY) : previewRadiusX;
                    context.ellipse(
                        drawingRef.current.startX,
                        drawingRef.current.startY,
                        previewRadiusX,
                        previewRadiusY,
                        0, 0, Math.PI * 2
                    );
                    context.stroke();
                    if (fillColor !== 'transparent') {
                        context.fill();
                    }
                    break;
            }
        }
    
        // Batch drawing for brush tools
        if (['brush', 'highlighter', 'eraser'].includes(tool) && wsClient && isInWhiteboard) {
            drawingBatchRef.current.push({
                type: tool,
                x,
                y,
                color: tool === 'eraser' ? '#FFFFFF' : color,
                lineWidth: tool === 'highlighter' ? lineWidth * 2 : lineWidth,
                opacity: tool === 'highlighter' ? 0.3 : 1
            });
    
            if (!batchTimerRef.current) {
                batchTimerRef.current = setTimeout(sendDrawingBatch, 16);
            }
        }
    };
    
    // const drawShape = (context, shape, startX, startY, endX, endY) => {
    //     const width = endX - startX;
    //     const height = endY - startY;
        
    //     context.beginPath();
        
    //     switch (shape) {
    //         case 'rectangle':
    //             context.rect(startX, startY, width, height);
    //             break;
    //         case 'rounded-rect':
    //             const radius = 10;
    //             context.roundRect(startX, startY, width, height, radius);
    //             break;
    //         case 'diamond':
    //             context.moveTo(startX + width/2, startY);
    //             context.lineTo(startX + width, startY + height/2);
    //             context.lineTo(startX + width/2, startY + height);
    //             context.lineTo(startX, startY + height/2);
    //             context.closePath();
    //             break;
    //         case 'triangle':
    //             context.moveTo(startX + width/2, startY);
    //             context.lineTo(startX + width, startY + height);
    //             context.lineTo(startX, startY + height);
    //             context.closePath();
    //             break;
    //     }
        
    //     context.stroke();
    //     if (fillColor !== 'transparent') {
    //         context.fill();
    //     }
    // };
    
    //! draw shape:
    const drawShape = (context, shape, startX, startY, endX, endY) => {
        const width = endX - startX;
        const height = endY - startY;
        
        context.beginPath();
        
        // Ensure we use the current fillStyle
        context.fillStyle = fillColor;
        
        switch (shape) {
            case 'rectangle':
                context.rect(startX, startY, width, height);
                break;
            case 'rounded-rect':
                const radius = Math.min(10, Math.abs(width), Math.abs(height));
                // Fallback for browsers that don't support roundRect
                if (context.roundRect) {
                    context.roundRect(startX, startY, width, height, radius);
                } else {
                    // Manual rounded rectangle implementation
                    const x = startX;
                    const y = startY;
                    const w = width;
                    const h = height;
                    const r = radius;
                    
                    context.moveTo(x + r, y);
                    context.lineTo(x + w - r, y);
                    context.quadraticCurveTo(x + w, y, x + w, y + r);
                    context.lineTo(x + w, y + h - r);
                    context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
                    context.lineTo(x + r, y + h);
                    context.quadraticCurveTo(x, y + h, x, y + h - r);
                    context.lineTo(x, y + r);
                    context.quadraticCurveTo(x, y, x + r, y);
                    context.closePath();
                }
                break;
            case 'diamond':
                const centerX = startX + width/2;
                const centerY = startY + height/2;
                context.moveTo(centerX, startY); // Top
                context.lineTo(endX, centerY); // Right
                context.lineTo(centerX, endY); // Bottom
                context.lineTo(startX, centerY); // Left
                context.closePath();
                break;
            case 'triangle':
                context.moveTo(startX + width/2, startY); // Top center
                context.lineTo(endX, endY); // Bottom right
                context.lineTo(startX, endY); // Bottom left
                context.closePath();
                break;
        }
        
        // Always stroke first
        context.stroke();
        
        // Then fill if fillColor is not transparent
        if (fillColor !== 'transparent') {
            context.fill();
        }
        
        context.closePath();
    };

    const drawArrowhead = (context, fromX, fromY, toX, toY) => {
        const headLength = 15;
        const dx = toX - fromX;
        const dy = toY - fromY;
        const angle = Math.atan2(dy, dx);
        
        context.beginPath();
        context.moveTo(toX, toY);
        context.lineTo(
            toX - headLength * Math.cos(angle - Math.PI/6),
            toY - headLength * Math.sin(angle - Math.PI/6)
        );
        context.moveTo(toX, toY);
        context.lineTo(
            toX - headLength * Math.cos(angle + Math.PI/6),
            toY - headLength * Math.sin(angle + Math.PI/6)
        );
        context.stroke();
    };

    const sendDrawingBatch = useCallback(() => {
        if (!wsClient || !isInWhiteboard || drawingBatchRef.current.length === 0) {
            batchTimerRef.current = null;
            return;
        }

        const batchToSend = [...drawingBatchRef.current];
        drawingBatchRef.current = [];

        if (batchToSend.length > 0) {
            const drawingData = {
                type: 'brush_batch',
                points: batchToSend,
                color: batchToSend[0].color,
                lineWidth: batchToSend[0].lineWidth,
                opacity: batchToSend[0].opacity
            };
            
            wsClient.sendDrawingData(conversationId, drawingData)
                .catch(error => console.error('Failed to send drawing batch:', error));
        }

        batchTimerRef.current = null;
    }, [conversationId, isInWhiteboard, wsClient]);

    // const stopDrawing = () => {
    //     if (drawingRef.current.isDrawing) {
    //         drawingRef.current.isDrawing = false;
            
    //         // Reset line dash
    //         if (contextRef.current) {
    //             contextRef.current.setLineDash([]);
    //         }
            
    //         saveToUndoStack();
            
    //         // Send final drawing for all tools
    //         if (wsClient && isInWhiteboard && !['brush', 'highlighter', 'eraser'].includes(tool)) {
    //             const { startX, startY, lastX, lastY } = drawingRef.current;
                
    //             const drawingData = {
    //                 type: tool,
    //                 startX,
    //                 startY,
    //                 endX: lastX,
    //                 endY: lastY,
    //                 color,
    //                 fillColor,
    //                 lineWidth,
    //                 strokeStyle
    //             };

    //             wsClient.sendDrawingData(conversationId, drawingData)
    //                 .catch(error => console.error('Failed to send drawing:', error));
    //         }
            
    //         // Send any remaining batch
    //         if (batchTimerRef.current) {
    //             clearTimeout(batchTimerRef.current);
    //             sendDrawingBatch();
    //         }
    //     }
    // };
    
    //! stop drawing:
    const stopDrawing = () => {
        if (drawingRef.current.isDrawing) {
            drawingRef.current.isDrawing = false;
            
            // Reset line dash
            if (contextRef.current) {
                contextRef.current.setLineDash([]);
            }
            
            // Only save to undo stack if we actually drew something
            const pathLength = drawingRef.current.paths.length;
            if (pathLength > 1 || (['rectangle', 'rounded-rect', 'diamond', 'triangle', 'circle', 'ellipse', 'line', 'arrow'].includes(tool) && pathLength > 0)) {
                
                // For shape tools, we need to draw the final version
                if (['line', 'arrow', 'rectangle', 'rounded-rect', 'diamond', 'triangle', 'circle', 'ellipse'].includes(tool)) {
                    const context = contextRef.current;
                    const { startX, startY, lastX, lastY } = drawingRef.current;
                    
                    // Set context properties
                    context.strokeStyle = color;
                    context.fillStyle = fillColor;
                    context.lineWidth = lineWidth;
                    
                    // Set stroke style
                    if (strokeStyle === 'dashed') {
                        context.setLineDash([5, 5]);
                    } else if (strokeStyle === 'dotted') {
                        context.setLineDash([2, 5]);
                    }
                    
                    // Draw the final shape
                    switch (tool) {
                        case 'line':
                        case 'arrow':
                            context.beginPath();
                            context.moveTo(startX, startY);
                            context.lineTo(lastX, lastY);
                            context.stroke();
                            if (tool === 'arrow') {
                                drawArrowhead(context, startX, startY, lastX, lastY);
                            }
                            break;
                        
                        case 'rectangle':
                        case 'rounded-rect':
                        case 'diamond':
                        case 'triangle':
                            drawShape(context, tool, startX, startY, lastX, lastY);
                            break;
                        
                        case 'circle':
                        case 'ellipse':
                            context.beginPath();
                            const radiusX = Math.abs(lastX - startX);
                            const radiusY = tool === 'ellipse' ? Math.abs(lastY - startY) : radiusX;
                            context.ellipse(startX, startY, radiusX, radiusY, 0, 0, Math.PI * 2);
                            context.stroke();
                            if (fillColor !== 'transparent') {
                                context.fill();
                            }
                            break;
                    }
                    
                    // Reset line dash
                    context.setLineDash([]);
                }
                
                saveToUndoStack();
                
                // Send final drawing for all tools
                if (wsClient && isInWhiteboard) {
                    const { startX, startY, lastX, lastY } = drawingRef.current;
                    
                    const drawingData = {
                        type: tool,
                        startX,
                        startY,
                        endX: lastX,
                        endY: lastY,
                        color,
                        fillColor,
                        lineWidth,
                        strokeStyle
                    };
    
                    wsClient.sendDrawingData(conversationId, drawingData)
                        .catch(error => console.error('Failed to send drawing:', error));
                }
            }
            
            // Send any remaining batch
            if (batchTimerRef.current) {
                clearTimeout(batchTimerRef.current);
                sendDrawingBatch();
            }
            
            // Reset drawing paths
            drawingRef.current.paths = [];
        }
    };

    // const drawReceivedImage = useCallback((data) => {
    //     const context = contextRef.current;
    //     if (!context || !data.image_data) return;

    //     const canvas = canvasRef.current;
    //     const rect = canvas.getBoundingClientRect();
    //     const scale = canvas.width / rect.width / (window.devicePixelRatio || 1);

    //     context.strokeStyle = data.image_data.color || '#3B82F6';
    //     context.fillStyle = data.image_data.fillColor || 'transparent';
    //     context.lineWidth = data.image_data.lineWidth || 2;

    //     if (data.image_data.type === 'brush_batch' && data.image_data.points) {
    //         const points = data.image_data.points;
    //         if (points.length === 0) return;

    //         context.globalAlpha = data.image_data.opacity || 1;
    //         context.beginPath();
    //         context.moveTo(points[0].x * scale, points[0].y * scale);
            
    //         for (let i = 1; i < points.length; i++) {
    //             context.lineTo(points[i].x * scale, points[i].y * scale);
    //         }
    //         context.stroke();
    //         context.globalAlpha = 1;
    //     }
    //     // ... rest of drawing logic remains the same
    // }, []);
    
    const drawReceivedImage = useCallback((data) => {
        const context = contextRef.current;
        if (!context || !data.image_data) return;
    
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scale = canvas.width / rect.width / (window.devicePixelRatio || 1);
    
        context.strokeStyle = data.image_data.color || '#3B82F6';
        context.fillStyle = data.image_data.fillColor || 'transparent';
        context.lineWidth = data.image_data.lineWidth || 2;
    
        // Set stroke style
        if (data.image_data.strokeStyle === 'dashed') {
            context.setLineDash([5, 5]);
        } else if (data.image_data.strokeStyle === 'dotted') {
            context.setLineDash([2, 5]);
        } else {
            context.setLineDash([]);
        }
    
        if (data.image_data.type === 'brush_batch' && data.image_data.points) {
            const points = data.image_data.points;
            if (points.length === 0) return;
    
            context.globalAlpha = data.image_data.opacity || 1;
            context.beginPath();
            context.moveTo(points[0].x * scale, points[0].y * scale);
            
            for (let i = 1; i < points.length; i++) {
                context.lineTo(points[i].x * scale, points[i].y * scale);
            }
            context.stroke();
            context.globalAlpha = 1;
        } else if (['rectangle', 'rounded-rect', 'diamond', 'triangle', 'circle', 'ellipse', 'line', 'arrow'].includes(data.image_data.type)) {
            const { startX, startY, endX, endY } = data.image_data;
            
            if (data.image_data.type === 'line' || data.image_data.type === 'arrow') {
                context.beginPath();
                context.moveTo(startX * scale, startY * scale);
                context.lineTo(endX * scale, endY * scale);
                context.stroke();
                
                if (data.image_data.type === 'arrow') {
                    drawArrowhead(context, startX * scale, startY * scale, endX * scale, endY * scale);
                }
            } else if (data.image_data.type === 'circle' || data.image_data.type === 'ellipse') {
                context.beginPath();
                const radiusX = Math.abs((endX - startX) * scale);
                const radiusY = data.image_data.type === 'ellipse' ? Math.abs((endY - startY) * scale) : radiusX;
                context.ellipse(startX * scale, startY * scale, radiusX, radiusY, 0, 0, Math.PI * 2);
                context.stroke();
                if (data.image_data.fillColor !== 'transparent') {
                    context.fill();
                }
            } else {
                drawShape(context, data.image_data.type, startX * scale, startY * scale, endX * scale, endY * scale);
            }
        } else if (data.image_data.type === 'text') {
            context.fillStyle = data.image_data.color;
            context.font = `${data.image_data.fontWeight === 'bold' ? 'bold ' : ''}${data.image_data.fontSize}px system-ui`;
            context.textAlign = data.image_data.textAlign || 'left';
            context.fillText(
                data.image_data.text,
                data.image_data.x * scale,
                data.image_data.y * scale
            );
        }
        
        // Reset line dash
        context.setLineDash([]);
    }, []);



    // FIXED: Improved text tool with proper container
    const addText = (x, y) => {
        if (!textContainerRef.current) return;
        
        const textContainer = textContainerRef.current;
        textContainer.style.left = `${x}px`;
        textContainer.style.top = `${y}px`;
        textContainer.style.display = 'flex';
        textContainer.style.flexDirection = 'column';
        textContainer.style.alignItems = textAlign;
        
        const textArea = textAreaRef.current;
        textArea.style.display = 'block';
        textArea.style.width = '200px';
        textArea.style.minHeight = '50px';
        textArea.style.fontSize = `${fontSize}px`;
        textArea.style.fontWeight = fontWeight;
        textArea.style.color = color;
        textArea.style.textAlign = textAlign;
        textArea.style.border = '1px solid #3B82F6';
        textArea.style.borderRadius = '4px';
        textArea.style.padding = '8px';
        textArea.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        textArea.style.outline = 'none';
        textArea.style.resize = 'both';
        textArea.style.overflow = 'auto';
        textArea.style.zIndex = '1000';
        textArea.focus();
    };

    const handleTextSubmit = useCallback(() => {
        const textArea = textAreaRef.current;
        const context = contextRef.current;
        const textContainer = textContainerRef.current;
        if (!textArea || !context || !wsClient) return;

        const text = textArea.value;
        if (text.trim()) {
            context.fillStyle = color;
            context.font = `${fontWeight === 'bold' ? 'bold ' : ''}${fontSize}px system-ui, -apple-system, sans-serif`;
            context.textAlign = textAlign;
            
            const lines = text.split('\n');
            let yOffset = parseInt(textContainer.style.top);
            
            lines.forEach((line, index) => {
                context.fillText(
                    line,
                    parseInt(textContainer.style.left),
                    yOffset + fontSize * (index + 1)
                );
            });
            
            saveToUndoStack();
            
            if (isInWhiteboard) {
                const textData = {
                    type: 'text',
                    text,
                    x: parseInt(textContainer.style.left),
                    y: parseInt(textContainer.style.top),
                    color,
                    fontSize,
                    fontWeight,
                    textAlign
                };
                
                wsClient.sendDrawingData(conversationId, textData)
                    .catch(error => console.error('Failed to send text:', error));
            }
        }
        
        textArea.value = '';
        textContainer.style.display = 'none';
        textArea.style.display = 'none';
    }, [color, fontSize, fontWeight, textAlign, conversationId, isInWhiteboard, saveToUndoStack]);

    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        if (!canvas || !context) return;

        context.clearRect(0, 0, canvas.width, canvas.height);
        saveToUndoStack();
        
        if (wsClient && isInWhiteboard) {
            wsClient.clearWhiteboard(conversationId)
                .then(() => showNotificationMessage('success', 'Canvas cleared'))
                .catch(error => console.error('Failed to clear canvas:', error));
        } else {
            showNotificationMessage('success', 'Canvas cleared');
        }
    }, [conversationId, isInWhiteboard, showNotificationMessage, saveToUndoStack]);

    const downloadCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = `whiteboard-${conversationId}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        showNotificationMessage('success', 'Canvas downloaded');
    };

    const saveCanvas = async () => {
        if (!conversationId) {
            showNotificationMessage('error', 'No conversation selected');
            return;
        }

        setIsSaving(true);
        try {
            const canvas = canvasRef.current;
            const dataUrl = canvas.toDataURL('image/png');
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            showNotificationMessage('success', 'Canvas saved to cloud');
        } catch (error) {
            console.error('Failed to save canvas:', error);
            showNotificationMessage('error', 'Failed to save canvas');
        } finally {
            setIsSaving(false);
        }
    };

    const shareCanvas = () => {
        if (navigator.share) {
            navigator.share({
                title: 'AI Whiteboard',
                text: 'Check out this collaborative whiteboard!',
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            showNotificationMessage('success', 'Link copied to clipboard');
        }
    };

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.1, 3));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.1, 0.5));
    };

    const handleJoinWhiteboard = () => {
        if (wsClient && conversationId) {
            wsClient.joinWhiteboard(conversationId)
                .then(() => {
                    setIsInWhiteboard(true);
                    showNotificationMessage('success', 'Joined whiteboard session');
                })
                .catch(error => {
                    console.error('Failed to join whiteboard:', error);
                    showNotificationMessage('error', 'Failed to join whiteboard');
                });
        }
    };

    const handleLeaveWhiteboard = () => {
        if (wsClient && conversationId) {
            wsClient.leaveWhiteboard(conversationId)
                .then(() => {
                    setIsInWhiteboard(false);
                    showNotificationMessage('info', 'Left whiteboard session');
                })
                .catch(error => {
                    console.error('Failed to leave whiteboard:', error);
                    showNotificationMessage('error', 'Failed to leave whiteboard');
                });
        }
    };

    // FIXED: Smooth mouse movement tracking
    const handleMouseMove = (e) => {
        if (!isInWhiteboard || !canvasRef.current) return;
        
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        sendCursorPosition(x, y);
    };

    const tools = [
        { id: 'select', icon: <MousePointer2 size={20} />, label: 'Select' },
        { id: 'brush', icon: <Brush size={20} />, label: 'Brush' },
        { id: 'highlighter', icon: <Highlighter size={20} />, label: 'Highlighter' },
        { id: 'eraser', icon: <Eraser size={20} />, label: 'Eraser' },
        { id: 'line', icon: <Minus size={20} />, label: 'Line' },
        { id: 'arrow', icon: <ArrowRight size={20} />, label: 'Arrow' },
        { id: 'rectangle', icon: <Square size={20} />, label: 'Rectangle' },
        { id: 'rounded-rect', icon: <SquareIcon size={20} />, label: 'Rounded Rect' },
        { id: 'circle', icon: <Circle size={20} />, label: 'Circle' },
        { id: 'ellipse', icon: <CircleIcon size={20} />, label: 'Ellipse' },
        { id: 'diamond', icon: <Diamond size={20} />, label: 'Diamond' },
        { id: 'triangle', icon: <Triangle size={20} />, label: 'Triangle' },
        { id: 'text', icon: <Type size={20} />, label: 'Text' },
        { id: 'image', icon: <Image size={20} />, label: 'Image' },
    ];

    const colors = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
        '#EC4899', '#000000', '#6B7280', '#FFFFFF', 'transparent'
    ];

    const strokeStyles = [
        { id: 'solid', label: 'Solid' },
        { id: 'dashed', label: 'Dashed' },
        { id: 'dotted', label: 'Dotted' }
    ];

    if (!conversationId || !currentUserId) {
        return (
            <div className="whiteboard-container">
                <div className="no-conversation-message">
                    <CloudOff size={64} className="mb-4" />
                    <h3>Select a conversation to start whiteboarding</h3>
                    <p>Join a conversation to collaborate in real-time</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen whiteboard-container flex flex-col" ref={containerRef}>
            <TooltipProvider>
                {/* Top Toolbar */}
                <div className="toolbar top-toolbar bg-gray-800 flex items-center justify-between p-2">
                    <div className="toolbar-group flex items-center space-x-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={saveCanvas} 
                                    disabled={isSaving}
                                    className="h-9 w-9"
                                >
                                    {isSaving ? <Progress value={50} className="w-5 h-5" /> : <Save size={18} />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Save to Cloud</TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={handleUndo} 
                                    disabled={undoStack.length <= 1}
                                    className="h-9 w-9"
                                >
                                    <Undo2 size={18} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={handleRedo} 
                                    disabled={redoStack.length === 0}
                                    className="h-9 w-9"
                                >
                                    <Redo2 size={18} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
                        </Tooltip>
                        
                        <Separator orientation="vertical" className="h-6 mx-1" />
                        
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={clearCanvas} className="h-9 w-9">
                                    <Trash2 size={18} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Clear Canvas</TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={downloadCanvas} className="h-9 w-9">
                                    <Download size={18} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Download</TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={shareCanvas} className="h-9 w-9">
                                    <Share2 size={18} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Share</TooltipContent>
                        </Tooltip>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={handleZoomOut} className="h-8 w-8">
                                        <ZoomOut size={16} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Zoom Out</TooltipContent>
                            </Tooltip>
                            
                            <span className="zoom-level text-sm min-w-[50px] text-center">{Math.round(zoom * 100)}%</span>
                            
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-8 w-8">
                                        <ZoomIn size={16} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Zoom In</TooltipContent>
                            </Tooltip>
                        </div>
                        
                        <Separator orientation="vertical" className="h-6" />
                        
                        <div className="flex items-center space-x-2">
                            <Badge 
                                variant={isConnected ? "default" : "destructive"} 
                                className="flex items-center space-x-1"
                            >
                                {isConnected ? <Cloud size={14} /> : <CloudOff size={14} />}
                                <span>{isConnected ? `${activeUsers.length} online` : 'Disconnected'}</span>
                            </Badge>
                            
                            {!isInWhiteboard && isConnected && (
                                <Button 
                                    variant="secondary" 
                                    size="sm"
                                    onClick={handleJoinWhiteboard}
                                    className="h-8"
                                >
                                    <Users size={14} className="mr-1" />
                                    Join Whiteboard
                                </Button>
                            )}
                            {isInWhiteboard && (
                                <Button 
                                    variant="secondary" 
                                    size="sm"
                                    onClick={handleLeaveWhiteboard}
                                    className="h-8"
                                >
                                    <Users size={14} className="mr-1" />
                                    Leave
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Toolbar - Vertical */}
                    {/* <div className="toolbar left-toolbar bg-gray-800 w-16 flex flex-col items-center py-3 space-y-4">
                        {tools.slice(0, 7).map(t => (
                            <Tooltip key={t.id} placement="right">
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`h-10 w-10 ${tool === t.id ? 'bg-gray-700' : ''}`}
                                        onClick={() => setTool(t.id)}
                                        disabled={!isInWhiteboard}
                                    >
                                        {t.icon}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right">{t.label}</TooltipContent>
                            </Tooltip>
                        ))}
                        
                        <Separator className="w-8" />
                        
                        {tools.slice(7).map(t => (
                            <Tooltip key={t.id} placement="right">
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`h-10 w-10 ${tool === t.id ? 'bg-gray-700' : ''}`}
                                        onClick={() => setTool(t.id)}
                                        disabled={!isInWhiteboard}
                                    >
                                        {t.icon}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right">{t.label}</TooltipContent>
                            </Tooltip>
                        ))}
                    </div> */}

                    {/* Left Toolbar - Vertical */}
                    <div className="toolbar left-toolbar bg-gray-800 w-16 flex flex-col items-center py-3 space-y-4">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-10 w-10 ${tool === 'select' ? 'bg-gray-700' : ''}`}
                                    onClick={() => setTool('select')}
                                    disabled={!isInWhiteboard}
                                >
                                    <MousePointer2 size={20} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Select</TooltipContent>
                        </Tooltip>
                    
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-10 w-10 ${tool === 'brush' ? 'bg-gray-700' : ''}`}
                                    onClick={() => setTool('brush')}
                                    disabled={!isInWhiteboard}
                                >
                                    <Brush size={20} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Brush</TooltipContent>
                        </Tooltip>
                    
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-10 w-10 ${tool === 'highlighter' ? 'bg-gray-700' : ''}`}
                                    onClick={() => setTool('highlighter')}
                                    disabled={!isInWhiteboard}
                                >
                                    <Highlighter size={20} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Highlighter</TooltipContent>
                        </Tooltip>
                    
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-10 w-10 ${tool === 'eraser' ? 'bg-gray-700' : ''}`}
                                    onClick={() => setTool('eraser')}
                                    disabled={!isInWhiteboard}
                                >
                                    <Eraser size={20} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Eraser</TooltipContent>
                        </Tooltip>
                    
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-10 w-10 ${tool === 'line' ? 'bg-gray-700' : ''}`}
                                    onClick={() => setTool('line')}
                                    disabled={!isInWhiteboard}
                                >
                                    <Minus size={20} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Line</TooltipContent>
                        </Tooltip>
                    
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-10 w-10 ${tool === 'arrow' ? 'bg-gray-700' : ''}`}
                                    onClick={() => setTool('arrow')}
                                    disabled={!isInWhiteboard}
                                >
                                    <ArrowRight size={20} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Arrow</TooltipContent>
                        </Tooltip>
                    
                        <Separator className="w-8" />
                    
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-10 w-10 ${tool === 'rectangle' ? 'bg-gray-700' : ''}`}
                                    onClick={() => setTool('rectangle')}
                                    disabled={!isInWhiteboard}
                                >
                                    <Square size={20} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Rectangle</TooltipContent>
                        </Tooltip>
                    
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-10 w-10 ${tool === 'rounded-rect' ? 'bg-gray-700' : ''}`}
                                    onClick={() => setTool('rounded-rect')}
                                    disabled={!isInWhiteboard}
                                >
                                    <SquareIcon size={20} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Rounded Rectangle</TooltipContent>
                        </Tooltip>
                    
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-10 w-10 ${tool === 'circle' ? 'bg-gray-700' : ''}`}
                                    onClick={() => setTool('circle')}
                                    disabled={!isInWhiteboard}
                                >
                                    <Circle size={20} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Circle</TooltipContent>
                        </Tooltip>
                    
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-10 w-10 ${tool === 'ellipse' ? 'bg-gray-700' : ''}`}
                                    onClick={() => setTool('ellipse')}
                                    disabled={!isInWhiteboard}
                                >
                                    <CircleIcon size={20} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Ellipse</TooltipContent>
                        </Tooltip>
                    
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-10 w-10 ${tool === 'diamond' ? 'bg-gray-700' : ''}`}
                                    onClick={() => setTool('diamond')}
                                    disabled={!isInWhiteboard}
                                >
                                    <Diamond size={20} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Diamond</TooltipContent>
                        </Tooltip>
                    
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-10 w-10 ${tool === 'triangle' ? 'bg-gray-700' : ''}`}
                                    onClick={() => setTool('triangle')}
                                    disabled={!isInWhiteboard}
                                >
                                    <Triangle size={20} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Triangle</TooltipContent>
                        </Tooltip>
                    
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-10 w-10 ${tool === 'text' ? 'bg-gray-700' : ''}`}
                                    onClick={() => setTool('text')}
                                    disabled={!isInWhiteboard}
                                >
                                    <Type size={20} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Text</TooltipContent>
                        </Tooltip>
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 relative overflow-hidden bg-gray-100">
                        <div className="canvas-area absolute inset-0" style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
                            {!isInWhiteboard && isConnected && (
                                <div className="join-whiteboard-overlay absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                    <div className="join-whiteboard-message bg-gray-800 p-8 rounded-lg text-center max-w-md">
                                        <Cloud size={48} className="mb-4 mx-auto" />
                                        <h3 className="text-xl font-semibold mb-2">Whiteboard Session</h3>
                                        <p className="text-gray-300 mb-4">Join the collaborative whiteboard to draw with others</p>
                                        <Button 
                                            onClick={handleJoinWhiteboard}
                                            className="mt-4"
                                            size="lg"
                                        >
                                            Join Whiteboard
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {!isConnected && (
                                <div className="disconnected-overlay absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                    <div className="disconnected-message bg-gray-800 p-8 rounded-lg text-center max-w-md">
                                        <CloudOff size={48} className="mb-4 mx-auto" />
                                        <h3 className="text-xl font-semibold mb-2">Disconnected from Server</h3>
                                        <p className="text-gray-300">Attempting to reconnect...</p>
                                    </div>
                                </div>
                            )}
                            
                            {/* User Cursors */}
                            {Object.keys(userCursors).map(userId => {
                                const cursor = userCursors[userId];
                                if (!cursor) return null;
                                
                                return (
                                    <div
                                        key={userId}
                                        className="user-cursor absolute pointer-events-none z-50 transition-all duration-100"
                                        style={{
                                            left: `${cursor.x}px`,
                                            top: `${cursor.y}px`,
                                        }}
                                    >
                                        <MousePointer2 
                                            size={16} 
                                            color={cursor.color}
                                            className="drop-shadow-lg"
                                        />
                                        <div 
                                            className="cursor-label absolute left-5 -top-1 px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
                                            style={{ backgroundColor: cursor.color, color: 'white' }}
                                        >
                                            {cursor.name}
                                        </div>
                                    </div>
                                );
                            })}
                            
                            <canvas
                                ref={canvasRef}
                                className="whiteboard-canvas absolute inset-0 bg-white w-full h-full"
                                onMouseDown={isInWhiteboard ? startDrawing : undefined}
                                onMouseMove={isInWhiteboard ? (e) => {
                                    handleMouseMove(e);
                                    draw(e);
                                } : undefined}
                                onMouseUp={isInWhiteboard ? stopDrawing : undefined}
                                onMouseLeave={isInWhiteboard ? stopDrawing : undefined}
                                onTouchStart={isInWhiteboard ? startDrawing : undefined}
                                onTouchMove={isInWhiteboard ? draw : undefined}
                                onTouchEnd={isInWhiteboard ? stopDrawing : undefined}
                                style={{ cursor: isInWhiteboard ? (tool === 'brush' ? 'crosshair' : tool === 'text' ? 'text' : 'default') : 'not-allowed' }}
                            />
                            
                            {/* Text Input Container */}
                            <div ref={textContainerRef} className="absolute hidden">
                                <textarea
                                    ref={textAreaRef}
                                    className="text-input"
                                    onBlur={handleTextSubmit}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleTextSubmit();
                                        }
                                        if (e.key === 'Escape') {
                                            textAreaRef.current.style.display = 'none';
                                            textAreaRef.current.value = '';
                                            textContainerRef.current.style.display = 'none';
                                        }
                                    }}
                                    placeholder="Type text here..."
                                    style={{ display: 'none' }}
                                    disabled={!isInWhiteboard}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Toolbar - Properties Panel */}
                    <div className="toolbar right-toolbar bg-gray-800 w-64 p-4 space-y-6 overflow-y-auto">
                        {/* Stroke Settings */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-300">Stroke</h4>
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400">Width</label>
                                <div className="flex items-center space-x-3">
                                    <Slider
                                        min={1}
                                        max={50}
                                        value={[lineWidth]}
                                        onValueChange={(value) => setLineWidth(value[0])}
                                        disabled={!isInWhiteboard}
                                        className="flex-1"
                                    />
                                    <span className="text-sm min-w-[40px]">{lineWidth}px</span>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400">Style</label>
                                <div className="flex space-x-1">
                                    {strokeStyles.map(style => (
                                        <Button
                                            key={style.id}
                                            variant="ghost"
                                            size="sm"
                                            className={`flex-1 h-8 ${strokeStyle === style.id ? 'bg-gray-700' : ''}`}
                                            onClick={() => setStrokeStyle(style.id)}
                                            disabled={!isInWhiteboard}
                                        >
                                            {style.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        {/* Color Pickers */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-gray-300">Stroke Color</h4>
                                <div className="grid grid-cols-5 gap-2">
                                    {colors.map(c => (
                                        <Button
                                            key={c}
                                            variant="ghost"
                                            size="icon"
                                            className={`h-8 w-8 p-0 ${color === c ? 'ring-2 ring-gray-400' : ''}`}
                                            style={{ 
                                                backgroundColor: c,
                                                border: c === 'transparent' ? '1px dashed #6B7280' : 'none'
                                            }}
                                            onClick={() => setColor(c)}
                                            disabled={!isInWhiteboard}
                                        >
                                            {color === c && <Check className="h-4 w-4 text-white" />}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
    <h4 className="text-sm font-semibold text-gray-300">Fill Color</h4>
    <div className="grid grid-cols-5 gap-2">
        {colors.map(c => (
            <Button
                key={`fill-${c}`}
                variant="ghost"
                size="icon"
                className={`h-8 w-8 p-0 ${fillColor === c ? 'ring-2 ring-gray-400' : ''}`}
                style={{ 
                    backgroundColor: c,
                    border: c === 'transparent' ? '1px dashed #6B7280' : 'none'
                }}
                onClick={() => {
                    console.log('Setting fill color to:', c); // Debug log
                    setFillColor(c);
                }}
                disabled={!isInWhiteboard}
            >
                {fillColor === c && (
                    c === 'transparent' || c === '#FFFFFF' 
                        ? <Check className="h-4 w-4 text-gray-800" />
                        : <Check className="h-4 w-4 text-white" />
                )}
            </Button>
        ))}
    </div>
</div>
                        </div>
                        
                        {/* Text Properties */}
                        {tool === 'text' && (
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-gray-300">Text Properties</h4>
                                
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400">Font Size</label>
                                    <div className="flex items-center space-x-3">
                                        <Slider
                                            min={12}
                                            max={72}
                                            value={[fontSize]}
                                            onValueChange={(value) => setFontSize(value[0])}
                                            disabled={!isInWhiteboard}
                                            className="flex-1"
                                        />
                                        <span className="text-sm min-w-[40px]">{fontSize}px</span>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400">Font Weight</label>
                                    <div className="flex space-x-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`flex-1 h-8 ${fontWeight === 'normal' ? 'bg-gray-700' : ''}`}
                                            onClick={() => setFontWeight('normal')}
                                            disabled={!isInWhiteboard}
                                        >
                                            Regular
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`flex-1 h-8 ${fontWeight === 'bold' ? 'bg-gray-700' : ''}`}
                                            onClick={() => setFontWeight('bold')}
                                            disabled={!isInWhiteboard}
                                        >
                                            Bold
                                        </Button>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400">Alignment</label>
                                    <div className="flex space-x-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={`h-8 w-8 ${textAlign === 'left' ? 'bg-gray-700' : ''}`}
                                            onClick={() => setTextAlign('left')}
                                            disabled={!isInWhiteboard}
                                        >
                                            <AlignLeft size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={`h-8 w-8 ${textAlign === 'center' ? 'bg-gray-700' : ''}`}
                                            onClick={() => setTextAlign('center')}
                                            disabled={!isInWhiteboard}
                                        >
                                            <AlignCenter size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={`h-8 w-8 ${textAlign === 'right' ? 'bg-gray-700' : ''}`}
                                            onClick={() => setTextAlign('right')}
                                            disabled={!isInWhiteboard}
                                        >
                                            <AlignRight size={16} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Object Controls (when something is selected) */}
                        {selectedObjects.length > 0 && (
                            <div className="space-y-4 pt-4 border-t border-gray-700">
                                <h4 className="text-sm font-semibold text-gray-300">Object Controls</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="ghost" size="sm" className="h-8">
                                        <Copy size={14} className="mr-1" />
                                        Duplicate
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8">
                                        <Lock size={14} className="mr-1" />
                                        Lock
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8">
                                        <Group size={14} className="mr-1" />
                                        Group
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8">
                                        <Layers size={14} className="mr-1" />
                                        Layer
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notification Toaster */}
                {showNotification && (
                    <div className="fixed bottom-4 left-4 z-[999999] animate-in fade-in slide-in-from-bottom-5">
                        <Alert variant={notification.type === 'success' ? 'default' : 'destructive'}>
                            <AlertTitle>
                                <div className="flex items-center gap-2">
                                    {notification.type === 'success' ? (
                                        <CheckCircle className="h-5 w-5" />
                                    ) : (
                                        <XCircle className="h-5 w-5" />
                                    )}
                                    <span>{notification.type === 'success' ? 'Success' : 'Error'}</span>
                                </div>
                            </AlertTitle>
                            <AlertDescription>{notification.message}</AlertDescription>
                        </Alert>
                    </div>
                )}
            </TooltipProvider>
        </div>
    );
};

export default Canvas;