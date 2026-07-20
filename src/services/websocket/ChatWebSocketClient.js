import { SOCKET_API_URL } from '@/utils/config';
import { getSocketInstance } from '@/utils/getSocketInstance';
import io from 'socket.io-client';

class ChatWebSocketClient {
  constructor(serverUrl, userId, options = {}) {
    this.serverUrl = serverUrl;
    this.userId = userId;
    this.socket = null;
    this.eventHandlers = {};
    this.typingTimeouts = {};
    this.whiteboardTimeouts = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.options = options;
    this.activeWhiteboards = new Set(); // Track active whiteboard sessions
  }
  startHeartbeat(interval = 25000) {
    this.stopHeartbeat();

    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.socket.emit('ping_alive', { t: Date.now() });
      };
    }, interval);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      };
  };
  startConnectionWatchdog(timeout = 60000) {
    this.lastPong = Date.now();

    this.socket.on('pong_alive', () => {
      this.lastPong = Date.now();
    });

    this.watchdogInterval = setInterval(() => {
      if (Date.now() - this.lastPong > timeout) {
        console.warn('Socket stale, forcing reconnect');
        this.socket.disconnect();
        this.socket.connect();
      }
    }, 10000);
  }

  // Initialize and connect to WebSocket server
  // Initialize and connect to WebSocket server
  connect() {
    this.socket = getSocketInstance()
    this.setupDefaultHandlers();
    return this.socket;
  }

  // Setup default event handlers
  setupDefaultHandlers() {
    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to chat server');
      this.reconnectAttempts = 0;
      this.trigger('connected');
      this.startHeartbeat();
      //this.startConnectionWatchdog();
      // IMPORTANT: Wait a bit before joining conversations to ensure socket is fully registered
      setTimeout(() => {
        // Join all user's conversation rooms
        this.joinUserConversations();
      }, 500);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from chat server:', reason);
      this.trigger('disconnected', reason);
      this.stopHeartbeat();
      // Leave all whiteboards on disconnect
      this.activeWhiteboards.forEach(conversationId => {
        this.leaveWhiteboard(conversationId);
      });
      this.activeWhiteboards.clear();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.trigger('connection_error', error);
    });

    // Reconnection events
    this.socket.on('reconnect', () => {
      this.joinUserConversations();

      // Rejoin whiteboards safely
      [...this.activeWhiteboards].forEach(id => {
        this.joinWhiteboard(id).catch(() => {
          this.activeWhiteboards.delete(id);
        });
      });
    });


    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Reconnection attempt:', attemptNumber);
      this.reconnectAttempts = attemptNumber;
      this.trigger('reconnect_attempt', attemptNumber);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Reconnection failed after all attempts');
      this.trigger('reconnect_failed');
    });

    // ========== CHAT EVENTS ==========
    
    // User status events
    this.socket.on('user_online', (data) => {
      console.log(`User ${data.user_id} is now online`);
      this.trigger('user_online', data);
    });

    this.socket.on('user_offline', (data) => {
      console.log(`User ${data.user_id} is now offline`);
      this.trigger('user_offline', data);
    });

    this.socket.on('user_status_changed', (data) => {
      console.log(`User ${data.user_id} status changed to ${data.status}`);
      this.trigger('user_status_changed', data);
    });

    // Message events
    this.socket.on('new_message', (data) => {
      console.log('New message received:', data);
      this.trigger('new_message', data);
    });

    this.socket.on('message_edited', (data) => {
      console.log('Message edited:', data);
      this.trigger('message_edited', data);
    });

    this.socket.on('message_deleted', (data) => {
      console.log('Message deleted:', data);
      this.trigger('message_deleted', data);
    });

    this.socket.on('mark_message_read', (data) => {
      console.log('Message read:', data);
      this.trigger('mark_message_read', data);
    });

    // Typing events
    this.socket.on('user_typing', (data) => {
      console.log('User typing:', data);
      this.trigger('user_typing', data);
    });

    // Conversation events
    this.socket.on('conversation_created', (data) => {
      console.log('New conversation created:', data);
      this.trigger('conversation_created', data);
    });

    this.socket.on('conversation_updated', (data) => {
      console.log('Conversation updated:', data);
      this.trigger('conversation_updated', data);
    });

    // Participant events
    this.socket.on('participant_added', (data) => {
      console.log('Participant added:', data);
      this.trigger('participant_added', data);
    });

    this.socket.on('participant_removed', (data) => {
      console.log('Participant removed:', data);
      this.trigger('participant_removed', data);
    });

    this.socket.on('added_to_conversation', (data) => {
      console.log('Added to conversation:', data);
      this.trigger('added_to_conversation', data);
    });

    this.socket.on('removed_from_conversation', (data) => {
      console.log('Removed from conversation:', data);
      this.trigger('removed_from_conversation', data);
    });

    // ========== WHITEBOARD EVENTS ==========
    
    // Whiteboard drawing events
    this.socket.on('whiteboard_image', (data) => {
      console.log('Whiteboard drawing received:', data);
      this.trigger('whiteboard_image', data);
    });

    this.socket.on('whiteboard_cleared', (data) => {
      console.log('Whiteboard cleared:', data);
      this.trigger('whiteboard_cleared', data);
    });

    this.socket.on('whiteboard_undo', (data) => {
      console.log('Whiteboard undo:', data);
      this.trigger('whiteboard_undo', data);
    });

    this.socket.on('whiteboard_redo', (data) => {
      console.log('Whiteboard redo:', data);
      this.trigger('whiteboard_redo', data);
    });

    // Whiteboard user events
    this.socket.on('user_joined_whiteboard', (data) => {
      console.log(`User ${data.user_name} joined whiteboard`);
      this.trigger('user_joined_whiteboard', data);
    });

    this.socket.on('user_left_whiteboard', (data) => {
      console.log(`User ${data.user_name} left whiteboard`);
      this.trigger('user_left_whiteboard', data);
    });

    this.socket.on('active_whiteboard_users', (data) => {
      console.log('Active whiteboard users:', data.active_users);
      this.trigger('active_whiteboard_users', data);
    });

    // Error event (for custom emits)
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.trigger('error', error);
    });
    
    
    this.socket.on('user_cursor_moved', (data) => {
      console.log('User cursor moved:', data);
      this.trigger('user_cursor_moved', data);
    });
  }

  // ========== CHAT METHODS ==========
  
  // Join all user's conversation rooms
  joinUserConversations(maxRetries = 3) {
    const attemptJoin = (attempt = 1) => {
        return this.emitWithCallback('join_user_conversations', {
            user_id: this.userId
        }).catch(error => {
            if (attempt < maxRetries && error.message.includes('Socket not ready')) {
                console.log(`Attempt ${attempt} failed, retrying in 200ms...`);
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(attemptJoin(attempt + 1));
                    }, 200);
                });
            }
            throw error;
        });
    };
    
    return attemptJoin();
  } 

  // Join a specific conversation room
  joinConversation(conversationId) {
    return this.emitWithCallback('join_conversation', {
      conversation_id: conversationId,
      user_id: this.userId
    });
  }

  // Leave a conversation room
  leaveConversation(conversationId) {
    return this.emitWithCallback('leave_conversation', {
      conversation_id: conversationId,
      user_id: this.userId
    });
  }

  // Send a new message
  sendMessage(conversationId, content, messageType = 'text', metadata = {}, replyToId = null) {
    return this.socket.emit('send_message', {
      conversation_id: conversationId,
      user_id: this.userId,
      content: content,
      message_type: messageType,
      metadata: metadata,
      reply_to_id: replyToId
    });
  }

  // Start typing indicator
  startTyping(conversationId) {
    return this.emitWithCallback('start_typing', {
      conversation_id: conversationId,
      user_id: this.userId
    });
  }

  // Stop typing indicator
  stopTyping(conversationId) {
    return this.emitWithCallback('stop_typing', {
      conversation_id: conversationId,
      user_id: this.userId
    });
  }

  // Auto-stop typing after delay with improved handling
  handleTyping(conversationId, delay = 3000) {
    // Clear existing timeout
    if (this.typingTimeouts[conversationId]) {
      clearTimeout(this.typingTimeouts[conversationId]);
      delete this.typingTimeouts[conversationId];
    }

    // Start typing
    this.startTyping(conversationId);

    // Set new timeout to stop typing
    this.typingTimeouts[conversationId] = setTimeout(() => {
      this.stopTyping(conversationId);
      delete this.typingTimeouts[conversationId];
    }, delay);
  }

  // Mark message as read
  markMessageRead(conversationId, messageId) {
    return this.emitWithCallback('mark_message_read', {
      conversation_id: conversationId,
      user_id: this.userId,
      message_id: messageId
    });
  }

  // Edit a message
  editMessage(conversationId, messageId, newContent, metadata = {}) {
    return this.emitWithCallback('edit_message', {
      conversation_id: conversationId,
      user_id: this.userId,
      message_id: messageId,
      content: newContent,
      metadata: metadata
    });
  }

  // Delete a message
  deleteMessage(conversationId, messageId) {
    return this.emitWithCallback('delete_message', {
      conversation_id: conversationId,
      user_id: this.userId,
      message_id: messageId
    });
  }

  // ========== WHITEBOARD METHODS ==========
  
  // Join a whiteboard session
  joinWhiteboard(conversationId) {
    this.activeWhiteboards.add(conversationId);
    return this.emitWithCallback('join_whiteboard', {
      conversation_id: conversationId,
      user_id: this.userId
    });
  }

  // Leave a whiteboard session
  leaveWhiteboard(conversationId) {
    this.activeWhiteboards.delete(conversationId);
    return this.emitWithCallback('leave_whiteboard', {
      conversation_id: conversationId,
      user_id: this.userId
    });
  }

  // Send whiteboard drawing data (optimized with debouncing)
  sendWhiteboardDrawing(conversationId, imageData, debounceDelay = 100) {
    // Clear existing timeout
    if (this.whiteboardTimeouts[conversationId]) {
      clearTimeout(this.whiteboardTimeouts[conversationId]);
    }

    // Debounce drawing events to prevent flooding
    return new Promise((resolve, reject) => {
      this.whiteboardTimeouts[conversationId] = setTimeout(() => {
        this.emitWithCallback('whiteboard_drawing', {
          conversation_id: conversationId,
          user_id: this.userId,
          image_data: imageData
        })
        .then(resolve)
        .catch(reject);
        
        delete this.whiteboardTimeouts[conversationId];
      }, debounceDelay);
    });
  }

  // Clear whiteboard
  clearWhiteboard(conversationId) {
    return this.emitWithCallback('whiteboard_clear', {
      conversation_id: conversationId,
      user_id: this.userId
    });
  }

  // Whiteboard undo
  undoWhiteboard(conversationId) {
    return this.emitWithCallback('whiteboard_undo', {
      conversation_id: conversationId,
      user_id: this.userId
    });
  }

  // Whiteboard redo
  redoWhiteboard(conversationId) {
    return this.emitWithCallback('whiteboard_redo', {
      conversation_id: conversationId,
      user_id: this.userId
    });
  }

  // Get active whiteboard users
  getWhiteboardUsers(conversationId) {
    return this.emitWithCallback('get_whiteboard_users', {
      conversation_id: conversationId
    });
  }

  // Send drawing in real-time (for smooth drawing)
  sendDrawingData(conversationId, drawingData) {
    // For real-time drawing, send immediately without debouncing
    return this.emitWithCallback('whiteboard_drawing', {
      conversation_id: conversationId,
      user_id: this.userId,
      image_data: drawingData
    });
  }

  // Batch send multiple drawing operations
  sendBatchDrawings(conversationId, drawingsArray) {
    return this.emitWithCallback('whiteboard_batch_drawings', {
      conversation_id: conversationId,
      user_id: this.userId,
      drawings: drawingsArray
    });
  }

  // ========== UTILITY METHODS ==========
  
  // Utility method for emitting with optional callback
  emitWithCallback(event, data, callback) {
    if (!this.isConnected()) {
      console.error(`Cannot emit ${event}: Not connected`);
      const error = new Error('Not connected to server');
      if (callback) callback(error);
      return Promise.reject(error);
    }

    return new Promise((resolve, reject) => {
      this.socket.emit(event, data, (response) => {
        if (response && response.error) {
          console.error(`Error in ${event}:`, response.error);
          const error = new Error(response.error || 'Unknown error');
          reject(error);
          if (callback) callback(error);
        } else {
          resolve(response);
          if (callback) callback(null, response);
        }
      });
    });
  }

  // Event handler registration
  on(event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  // Remove event handler
  off(event, handler) {
    if (!this.eventHandlers[event]) return;
    
    this.eventHandlers[event] = this.eventHandlers[event].filter(
      h => h !== handler
    );
  }

  // Remove all handlers for an event
  offAll(event) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
  }

  // Trigger event handlers
  trigger(event, data) {
    if (!this.eventHandlers[event]) return;
    
    // Create a copy of handlers to avoid issues if handlers are removed during execution
    const handlers = [...this.eventHandlers[event]];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in ${event} handler:`, error);
      }
    });
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      // Leave all whiteboards before disconnecting
      this.activeWhiteboards.forEach(conversationId => {
        this.leaveWhiteboard(conversationId);
      });
      this.activeWhiteboards.clear();
      
      this.socket.disconnect();
      this.socket = null;
    }
    
    // Clear all timeouts
    Object.keys(this.typingTimeouts).forEach(conversationId => {
      clearTimeout(this.typingTimeouts[conversationId]);
    });
    this.typingTimeouts = {};
    
    Object.keys(this.whiteboardTimeouts).forEach(conversationId => {
      clearTimeout(this.whiteboardTimeouts[conversationId]);
    });
    this.whiteboardTimeouts = {};
  }

  // Check if connected
  isConnected() {
    return this.socket && this.socket.connected;
  }

  // Get socket ID
  getSocketId() {
    return this.socket ? this.socket.id : null;
  }

  // Manual reconnect
  reconnect() {
    if (this.socket) {
      this.socket.connect();
    }
  }

  // Check if user is in a specific whiteboard
  isInWhiteboard(conversationId) {
    return this.activeWhiteboards.has(conversationId);
  }

  // Get list of active whiteboards
  getActiveWhiteboards() {
    return Array.from(this.activeWhiteboards);
  }

  // Set user status (online/away/busy)
  setUserStatus(status) {
    return this.emitWithCallback('set_user_status', {
      user_id: this.userId,
      status: status
    });
  }

  // Get connection statistics
  getConnectionStats() {
    return {
      isConnected: this.isConnected(),
      socketId: this.getSocketId(),
      reconnectAttempts: this.reconnectAttempts,
      activeWhiteboards: this.getActiveWhiteboards(),
      serverUrl: this.serverUrl
    };
  }
}

export default ChatWebSocketClient;