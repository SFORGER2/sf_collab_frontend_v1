import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Send,
  Search,
  MoreVertical,
  File,
  X,
  Download,
  ChevronUp,
  ChevronDown,
  Mic,
  Play,
  Pause,
} from "lucide-react";
import io from "socket.io-client";
import RecordRTC from "recordrtc";
import React from "react";
import { SOCKET_API_URL } from "@/utils/config";

// Default contacts data
const defaultContacts = [
  {
    id: "1",
    name: "Elmer Laverty",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnN8ZW58MHx8MHx8fDA%3D",
    status: "online",
    isOnline: false,
    lastMessage: "",
    unreadCount: 0,
  },
  {
    id: "2",
    name: "Tom Julies",
    avatar:
      "https://images.unsplash.com/photo-1672863601285-253fc82db868?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHVzZXJzfGVufDB8fDB8fHww",
    status: "online",
    isOnline: false,
    lastMessage: "",
    unreadCount: 0,
  },
  {
    id: "3",
    name: "Lavern Laboy",
    avatar:
      "https://images.unsplash.com/photo-1685903772095-f07172808761?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHVzZXJzfGVufDB8fDB8fHww",
    status: "online",
    isOnline: false,
    lastMessage: "",
    unreadCount: 0,
  },
  {
    id: "4",
    name: "Titus Kitsemura",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8dXNlcnN8ZW58MHx8MHx8fDA%3D",
    status: "online",
    isOnline: false,
    lastMessage: "",
    unreadCount: 0,
  },
  {
    id: "5",
    name: "Geoffrey Mott",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=580&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "online",
    isOnline: false,
    lastMessage: "",
    unreadCount: 0,
  },
  {
    id: "6",
    name: "Alfonso Schuessler",
    avatar:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dXNlcnN8ZW58MHx8MHx8fDA%3D",
    status: "online",
    isOnline: false,
    lastMessage: "",
    unreadCount: 0,
  },
];

export default function Chat() {
  // States
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [unsentMessages, setUnsentMessages] = useState([]);
  const [contactSearch, setContactSearch] = useState("");
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);

  // Refs
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Configuration
  const SOCKET_URL = SOCKET_API_URL

  // Toggle search input
  const toggleInput = () => {
    setIsInputVisible(!isInputVisible);
    if (!isInputVisible) {
      setSearchQuery("");
      setCurrentMatchIndex(0);
      setSearchResults([]);
    }
  };

  // Scroll to specific message
  const scrollToMessage = (messageId) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("bg-gray-700", "bg-opacity-200");
      setTimeout(() => {
        element.classList.remove("bg-gray-700", "bg-opacity-200");
      }, 2000);
    }
  };

  // Get user ID from URL or default
  const getSessionUserKey = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("testUserId") || "1";
  };

  // Update contact online status based on onlineUsers Set
  const updateContactsWithOnlineStatus = (contacts) => {
    return contacts.map((contact) => ({
      ...contact,
      isOnline: onlineUsers.has(contact.id),
      status: onlineUsers.has(contact.id) ? "online" : "offline",
    }));
  };

  // Initialize application
  useEffect(() => {
    const initializeApp = () => {
      const sessionUserId = getSessionUserKey();
      setCurrentUserId(sessionUserId);

      // Load contacts from localStorage or use default
      let initialContacts = defaultContacts;
      const savedContacts = localStorage.getItem("chatContacts");
      if (savedContacts) {
        try {
          initialContacts = JSON.parse(savedContacts);
        } catch (err) {
          console.error("Error parsing savedContacts:", err);
          localStorage.removeItem("chatContacts");
          localStorage.setItem("chatContacts", JSON.stringify(defaultContacts));
          initialContacts = defaultContacts;
        }
      } else {
        localStorage.setItem("chatContacts", JSON.stringify(defaultContacts));
      }

      const updatedContacts = updateContactsWithOnlineStatus(initialContacts);
      setContacts(updatedContacts);
      console.log("Initial contacts set:", updatedContacts);

      const firstContact = updatedContacts.find(
        (contact) => contact.id !== sessionUserId
      );
      setSelectedContact(firstContact || null);

      // Load messages from localStorage
      const savedMessages = localStorage.getItem("chatMessages");
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages).map((msg) => ({
            ...msg,
            id:
              msg.id.startsWith("msg_") || msg.id.startsWith("temp_msg_")
                ? msg.id
                : `msg_${msg.id}`,
          }));
          const sortedMessages = parsedMessages.sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );
          setMessages(sortedMessages);
        } catch (err) {
          console.error("Error parsing savedMessages:", err);
          localStorage.removeItem("chatMessages"); // Clear corrupted data
        }
      }

      // Initialize socket connection
      const newSocket = io(SOCKET_URL, {
        autoConnect: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        transports: ["websocket"],
      });

      setSocket(newSocket);

      newSocket.on("connection:established", ({ userId }) => {
        console.log(`Connection established for user ${userId}`);
        setIsConnected(true);
        setConnectionStatus("connected");
      });

      newSocket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
        setConnectionStatus("error");
        setIsConnected(false);
      });

      return () => {
        newSocket.disconnect();
      };
    };

    initializeApp();
  }, []);

  // Handle reconnection and sending queued messages
  useEffect(() => {
    if (!socket || !isConnected || unsentMessages.length === 0) return;

    const sendQueuedMessages = async () => {
      const successfulMessages = [];
      const failedMessages = [];

      for (const message of unsentMessages) {
        try {
          await new Promise((resolve, reject) => {
            socket.emit(
              "sendMessage",
              {
                recipientId: message.recipientId,
                content: message.content,
                file: message.file,
                senderName: "You",
                tempId: message.tempId,
              },
              (response) => {
                if (response?.status === "success") {
                  successfulMessages.push(message.tempId);
                  updateMessageStatus(
                    message.tempId,
                    "delivered",
                    response.message
                  );
                  resolve();
                } else {
                  failedMessages.push(message.tempId);
                  updateMessageStatus(message.tempId, "failed");
                  reject(new Error("Failed to send message"));
                }
              }
            );
          });
        } catch (err) {
          console.error("Error sending queued message:", err);
          failedMessages.push(message.tempId);
        }
      }

      setUnsentMessages((prev) =>
        prev.filter((msg) => !successfulMessages.includes(msg.tempId))
      );
    };

    sendQueuedMessages();
  }, [isConnected, socket, unsentMessages]);

  // Update message status in state and localStorage
  const updateMessageStatus = (tempId, status, serverMessage = null) => {
    setMessages((prevMessages) => {
      const updatedMessages = prevMessages.map((msg) => {
        if (
          msg.id === tempId ||
          (tempId.startsWith("temp_msg_") &&
            msg.id === `msg_${tempId.replace("temp_msg_", "")}`)
        ) {
          return serverMessage
            ? { ...serverMessage, isOwn: true }
            : { ...msg, status };
        }
        return msg;
      });

      localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));
      return updatedMessages;
    });
  };

  // Calculate unread counts for each contact
  const calculateUnreadCounts = () => {
    const counts = {};

    messages.forEach((message) => {
      if (
        message.recipientId === currentUserId &&
        !message.isRead &&
        message.senderId !== currentUserId
      ) {
        counts[message.senderId] = (counts[message.senderId] || 0) + 1;
      }
    });

    return counts;
  };

  // Update contacts with last message and unread counts
  useEffect(() => {
    const newUnreadCounts = calculateUnreadCounts();

    setContacts((prevContacts) => {
      const updatedContacts = prevContacts.map((contact) => {
        const relevantMessages = messages
          .filter(
            (msg) =>
              (msg.senderId === contact.id &&
                msg.recipientId === currentUserId) ||
              (msg.senderId === currentUserId && msg.recipientId === contact.id)
          )
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const lastMessage = relevantMessages[0]
          ? relevantMessages[0].content ||
            (relevantMessages[0].file
              ? `File: ${relevantMessages[0].file.name}`
              : "")
          : "";

        return {
          ...contact,
          lastMessage,
          unreadCount: newUnreadCounts[contact.id] || 0,
        };
      });

      localStorage.setItem("chatContacts", JSON.stringify(updatedContacts));
      return updatedContacts;
    });

    setUnreadCounts(newUnreadCounts);
  }, [messages, currentUserId]);

  // Mark messages as read when a contact is selected
  useEffect(() => {
    if (!selectedContact || !socket || !currentUserId || !isConnected) return;

    const unreadMessageIds = messages
      .filter(
        (msg) =>
          msg.senderId === selectedContact.id &&
          msg.recipientId === currentUserId &&
          !msg.isRead
      )
      .map((msg) => (msg.id.startsWith("msg_") ? msg.id : `msg_${msg.id}`));

    if (unreadMessageIds.length > 0) {
      const timeout = setTimeout(() => {
        setMessages((prevMessages) => {
          const updatedMessages = prevMessages.map((msg) =>
            unreadMessageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
          );
          localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));
          return updatedMessages;
        });

        socket.emit("markAsRead", unreadMessageIds, (response) => {
          if (response?.status !== "success") {
            console.error("Failed to mark messages as read on server:", response);
            setMessages((prevMessages) => {
              const revertedMessages = prevMessages.map((msg) =>
                unreadMessageIds.includes(msg.id)
                  ? { ...msg, isRead: false }
                  : msg
              );
              localStorage.setItem(
                "chatMessages",
                JSON.stringify(revertedMessages)
              );
              return revertedMessages;
            });
          }
        });
      }, 500); // Delay by 500ms to ensure socket is ready

      return () => clearTimeout(timeout);
    }
  }, [selectedContact, messages, socket, currentUserId, isConnected]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !currentUserId) return;

    const onConnect = () => {
      console.log("Socket connected, emitting setUser");
      socket.emit("setUser", currentUserId, (response) => {
        if (response?.status !== "success") {
          console.error("Failed to set user:", response);
        }
      });
    };

    const onDisconnect = () => {
      setIsConnected(false);
      setConnectionStatus("disconnected");
      console.log("Disconnected from server");
    };

    const onConnectError = (err) => {
      console.error("Connection error:", err);
      setConnectionStatus("error");
      setIsConnected(false);
    };

    const onReconnectAttempt = (attempt) => {
      setConnectionStatus(`reconnecting (${attempt}/5)`);
      console.log(`Reconnection attempt ${attempt}`);
    };

    const onReconnectFailed = () => {
      setConnectionStatus("failed");
      console.error("Reconnection failed");
    };

    const handleIncomingMessage = (message, callback) => {
      const normalizedMessage = {
        ...message,
        id: message.id.startsWith("msg_") ? message.id : `msg_${message.id}`,
      };

      setMessages((prevMessages) => {
        if (prevMessages.some((m) => m.id === normalizedMessage.id))
          return prevMessages;

        const updatedMessages = [...prevMessages, normalizedMessage].sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );

        localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));
        return updatedMessages;
      });

      // Acknowledge receipt of the message
      if (callback) {
        callback({ status: "success" });
      }
    };

    const handleInitialOnlineStatus = (onlineUserIds) => {
      console.log("Initial online users:", onlineUserIds);
      setOnlineUsers(new Set(onlineUserIds));
    };

    const handleUserOnline = (userId) => {
      console.log(`User ${userId} is online`);
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.add(userId);
        return newSet;
      });
    };

    const handleUserOffline = (userId) => {
      console.log(`User ${userId} is offline`);
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    const handleUnreadCountUpdate = ({ count }) => {
      console.log(`Unread count updated: ${count}`);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("reconnect_attempt", onReconnectAttempt);
    socket.on("reconnect_failed", onReconnectFailed);
    socket.on("newMessage", handleIncomingMessage);
    socket.on("initialOnlineStatus", handleInitialOnlineStatus);
    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);
    socket.on("unreadCountUpdate", handleUnreadCountUpdate);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("reconnect_attempt", onReconnectAttempt);
      socket.off("reconnect_failed", onReconnectFailed);
      socket.off("newMessage", handleIncomingMessage);
      socket.off("initialOnlineStatus", handleInitialOnlineStatus);
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
      socket.off("unreadCountUpdate", handleUnreadCountUpdate);
    };
  }, [socket, currentUserId]);

  // Update contacts when onlineUsers changes
  useEffect(() => {
    setContacts((prevContacts) => {
      const updatedContacts = updateContactsWithOnlineStatus(prevContacts);
      console.log("Updated contacts with online status:", updatedContacts);
      return updatedContacts;
    });

    if (selectedContact) {
      setSelectedContact((prev) => ({
        ...prev,
        isOnline: onlineUsers.has(prev.id),
        status: onlineUsers.has(prev.id) ? "online" : "offline",
      }));
    }
  }, [onlineUsers]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update search results when search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = messages
        .filter(
          (msg) =>
            (msg.senderId === selectedContact?.id &&
              msg.recipientId === currentUserId) ||
            (msg.senderId === currentUserId &&
              msg.recipientId === selectedContact?.id)
        )
        .filter((msg) =>
          msg.content?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((msg) => msg.id);

      setSearchResults(results);
      setCurrentMatchIndex(0);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, messages, selectedContact, currentUserId]);

  // Send message function
  const sendMessage = async () => {
    if (!currentUserId || !selectedContact) {
      console.error("Cannot send message - missing user or contact");
      return;
    }

    if (!newMessage.trim() && !selectedFile) return;

    const tempId = `temp_msg_${Date.now()}`;
    let fileData = null;

    if (selectedFile) {
      try {
        const fileBuffer = await selectedFile.arrayBuffer();
        fileData = {
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          data: Array.from(new Uint8Array(fileBuffer)),
        };
      } catch (err) {
        console.error("Error reading file:", err);
        return;
      }
    }

    const message = {
      id: tempId,
      senderId: currentUserId,
      senderName: "You",
      recipientId: selectedContact.id,
      content: newMessage,
      file: fileData,
      timestamp: new Date().toISOString(),
      isOwn: true,
      status: "sending",
      isRead: false,
    };

    setMessages((prev) => [...prev, message]);

    if (isConnected && socket) {
      socket.emit(
        "sendMessage",
        {
          recipientId: selectedContact.id,
          content: newMessage,
          file: fileData,
          senderName: "You",
          tempId,
        },
        (response) => {
          if (response?.status === "success") {
            setMessages((prev) =>
              prev.map((m) => (m.id === tempId ? response.message : m))
            );

            const savedMessages = JSON.parse(
              localStorage.getItem("chatMessages") || "[]"
            );
            const updatedMessages = savedMessages
              .filter((m) => m.id !== tempId)
              .concat(response.message);
            localStorage.setItem(
              "chatMessages",
              JSON.stringify(updatedMessages)
            );
          } else {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === tempId ? { ...m, status: "failed" } : m
              )
            );
          }
        }
      );
    } else {
      setUnsentMessages((prev) => [...prev, { ...message, tempId }]);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: "queued" } : m))
      );
    }

    setNewMessage("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle file download
  const handleDownload = (file) => {
    if (!file.data) return;

    const byteArray = new Uint8Array(file.data);
    const blob = new Blob([byteArray], { type: file.type });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Start recording voice note
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = {
        type: "audio",
        mimeType: "audio/webm;codecs=opus",
        recorderType: RecordRTC.StereoAudioRecorder,
        desiredSampRate: 16000,
        numberOfAudioChannels: 1,
      };

      const newRecorder = new RecordRTC(stream, options);

      newRecorder.startRecording();
      setRecorder(newRecorder);
      setIsRecording(true);
      setRecordingTime(0);

      const timer = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    } catch (err) {
      console.error("Error starting recording:", err);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  // Stop recording voice note
  const stopRecording = () => {
    if (!recorder) return;

    recorder.stopRecording(async () => {
      const blob = recorder.getBlob();
      setAudioBlob(blob);
      setAudioURL(URL.createObjectURL(blob));
      setIsRecording(false);

      await sendVoiceNote(blob);

      recorder.stream?.getTracks().forEach((track) => track.stop());
    });
  };

  // Cancel recording voice note
  const cancelRecording = () => {
    if (!recorder) return;

    recorder.stopRecording(() => {
      setIsRecording(false);
      setAudioBlob(null);
      setAudioURL("");
      recorder.stream?.getTracks().forEach((track) => track.stop());
    });
  };

  // Send voice note
  const sendVoiceNote = async (blob) => {
    if (!selectedContact || !currentUserId) return;

    const tempId = `temp_voice_${Date.now()}`;
    const fileName = `voice_note_${Date.now()}.webm`;

    const arrayBuffer = await blob.arrayBuffer();
    const fileData = {
      name: fileName,
      type: "audio/webm;codecs=opus",
      size: blob.size,
      data: Array.from(new Uint8Array(arrayBuffer)),
      isVoiceNote: true,
      duration: recordingTime || 1,
    };

    const message = {
      id: tempId,
      senderId: currentUserId,
      senderName: "You",
      recipientId: selectedContact.id,
      content: "Voice note",
      file: fileData,
      timestamp: new Date().toISOString(),
      isOwn: true,
      status: "sending",
      isRead: false,
    };

    setMessages((prev) => [...prev, message]);

    if (isConnected && socket) {
      socket.emit(
        "sendMessage",
        {
          recipientId: selectedContact.id,
          content: "Voice note",
          file: fileData,
          senderName: "You",
          tempId,
        },
        (response) => {
          if (response?.status === "success") {
            setMessages((prev) =>
              prev.map((m) => (m.id === tempId ? response.message : m))
            );

            const savedMessages = JSON.parse(
              localStorage.getItem("chatMessages") || "[]"
            );
            const updatedMessages = savedMessages
              .filter((m) => m.id !== tempId)
              .concat(response.message);
            localStorage.setItem(
              "chatMessages",
              JSON.stringify(updatedMessages)
            );
          } else {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === tempId ? { ...m, status: "failed" } : m
              )
            );
          }
        }
      );
    } else {
      setUnsentMessages((prev) => [...prev, { ...message, tempId }]);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: "queued" } : m))
      );
    }

    setAudioBlob(null);
    setAudioURL("");
    setRecordingTime(0);
  };

  return (
    <div className="flex flex-col h-screen bg-[#181818] text-white md:flex-row pt-13">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#000] border-b border-[#222]">
        <button
          className="text-white focus:outline-none"
          onClick={() => setSidebarOpen(true)}
        >
          <svg
            width="28"
            height="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold">Messages</h1>
        <div className="text-sm bg-[#181818] px-2 py-1 rounded">
          {contacts.length}
        </div>
      </div>

      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed z-50 top-0 left-0 h-full w-72 bg-[#000] flex flex-col transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0 md:w-80 md:z-0 md:h-auto
        `}
        style={{ maxWidth: "100vw" }}
      >
        {/* Close button for mobile */}
        <div className="md:hidden flex justify-end p-4">
          <button
            className="text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="p-4 pt-0 md:pt-4">
          <div className="hidden md:flex gap-4 items-center mb-4">
            <h1 className="text-xl font-semibold">Messages</h1>
            <div className="text-sm bg-[#181818] px-2 py-1 rounded">
              {contacts.length}
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value.toLowerCase())}
              placeholder="Search contacts"
              className="w-full px-3 py-2 bg-[#181818] border-[#2d2d2d] border rounded-lg text-white placeholder-gray-400"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Contacts List */}
        <div className="overflow-y-auto flex-1">
          {contacts.length === 0 && (
            <div className="p-4 text-gray-400">No contacts available</div>
          )}
          {contacts
            .filter(
              (c) =>
                c.id !== currentUserId &&
                (contactSearch === "" ||
                  c.name.toLowerCase().includes(contactSearch))
            )
            .map((contact) => (
              <div
                key={contact.id}
                onClick={() => {
                  setSelectedContact(contact);
                  setSidebarOpen(false);
                }}
                className={`p-4 cursor-pointer hover:bg-[#181818] transition ${
                  selectedContact?.id === contact.id ? "bg-[#181818]" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-10 h-10 rounded-full bg-gray-600"
                    />
                    {contact.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        contact.unreadCount > 0 ? "font-bold" : ""
                      }`}
                    >
                      {contact.name}
                    </p>
                    <p
                      className={`text-sm truncate ${
                        contact.unreadCount > 0
                          ? "text-white font-semibold"
                          : "text-gray-400"
                      }`}
                    >
                      {contact.lastMessage}
                    </p>
                  </div>
                  {contact.unreadCount > 0 && (
                    <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {contact.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full min-h-0">
        {/* Chat Header */}
        {selectedContact && (
          <div className="p-4 flex justify-between items-center border-b border-[#222] bg-[#181818]">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={selectedContact.avatar}
                  alt={selectedContact.name}
                  className="w-10 h-10 rounded-full bg-gray-600"
                />
                {selectedContact.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></div>
                )}
              </div>
              <div>
                <h2 className="font-semibold text-base sm:text-lg">
                  {selectedContact.name}
                </h2>
                <p
                  className={`text-xs sm:text-sm ${
                    selectedContact.isOnline
                      ? "text-green-400"
                      : "text-gray-400"
                  }`}
                >
                  {selectedContact.isOnline ? "online" : "offline"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <AnimatePresence>
                {isInputVisible && (
                  <motion.div
                    key="search-input"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center"
                  >
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        const query = e.target.value;
                        setSearchQuery(query);
                      }}
                      className="pl-4 py-1 rounded-3xl bg-gray-800 text-white"
                      placeholder="Search message..."
                      autoFocus
                    />

                    {searchResults.length > 0 && (
                      <div className="ml-2 text-xs text-gray-400">
                        {currentMatchIndex + 1}/{searchResults.length}
                      </div>
                    )}

                    {searchResults.length > 0 && (
                      <div className="flex ml-2">
                        <button
                          onClick={() => {
                            const newIndex =
                              (currentMatchIndex - 1 + searchResults.length) %
                              searchResults.length;
                            setCurrentMatchIndex(newIndex);
                            scrollToMessage(searchResults[newIndex]);
                          }}
                          className="p-1 text-gray-400 hover:text-white"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const newIndex =
                              (currentMatchIndex + 1) % searchResults.length;
                            setCurrentMatchIndex(newIndex);
                            scrollToMessage(searchResults[newIndex]);
                          }}
                          className="p-1 text-gray-400 hover:text-white"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={toggleInput}
                className="text-gray-400 px-3 py-1.5 sm:px-4 sm:py-2 hover:text-white flex items-center text-xs sm:text-sm rounded"
              >
                {isInputVisible ? (
                  <X className="w-4 h-4 mr-1" />
                ) : (
                  <Search className="w-4 h-4 mr-1" />
                )}
              </button>

              <button className="text-gray-400 bg-zinc-700 px-3 py-1.5 sm:px-4 sm:py-2 hover:text-white flex items-center text-xs sm:text-sm rounded">
                <Phone className="w-4 h-4 mr-1" />
                <span className="hidden xs:inline">Call</span>
              </button>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 scroll-auto min-h-0">
          {messages
            .filter(
              (msg) =>
                (msg.senderId === selectedContact?.id &&
                  msg.recipientId === currentUserId) ||
                (msg.senderId === currentUserId &&
                  msg.recipientId === selectedContact?.id)
            )
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            .map((message) => {
              const isOwn = message.senderId === currentUserId;
              const isFailed = message.status === "failed";
              const isQueued = message.status === "queued";
              const isSending = message.status === "sending";

              return (
                <div
                  id={`message-${message.id}`}
                  key={message.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"} ${
                    searchResults.includes(message.id) ? "highlight" : ""
                  }`}
                >
                  <div className="flex items-start space-x-2 max-w-[80vw] sm:max-w-xs md:max-w-md">
                    {!isOwn && (
                      <img
                        src={selectedContact?.avatar}
                        alt={selectedContact?.name}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-black"
                      />
                    )}
                    <div
                      className={`px-3 py-2 sm:px-4 sm:py-2 rounded-2xl break-words relative ${
                        isOwn
                          ? "bg-[#2B3135] text-white"
                          : "bg-white text-black"
                      } ${isFailed || isQueued ? "opacity-70" : ""}`}
                    >
                      {(isFailed || isQueued || isSending) && (
                        <div
                          className={`absolute -top-2 -right-2 text-white text-xs px-1 rounded-full ${
                            isFailed
                              ? "bg-red-500"
                              : isQueued
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                          }`}
                        >
                          {isFailed
                            ? "Failed"
                            : isQueued
                            ? "Queued"
                            : "Sending..."}
                        </div>
                      )}
                      {message.file && message.file.isVoiceNote ? (
                        <VoiceNotePlayer file={message.file} key={message.id} />
                      ) : message.file ? (
                        <div className="mb-1 bg-gray-200 text-black p-2 rounded">
                          <div className="text-xs text-gray-600">
                            {message.file.name}
                          </div>
                          <button
                            onClick={() => handleDownload(message.file)}
                            className="mt-1 text-xs bg-gray-200 text-white px-2 py-1 rounded"
                          >
                            <Download className="mr-4 text-black text-xs mt-2 hover:text-gray-400" />
                          </button>
                        </div>
                      ) : null}
                      <p className="text-xs sm:text-sm">
                        {message.content && searchQuery ? (
                          <span
                            dangerouslySetInnerHTML={{
                              __html: message.content.replace(
                                new RegExp(searchQuery, "gi"),
                                (match) =>
                                  `<span className="bg-yellow-300 text-black">${match}</span>`
                              ),
                            }}
                          />
                        ) : (
                          message.content
                        )}
                      </p>
                      <div className="text-right text-xs text-gray-400 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-2 sm:p-4 bg-[#181818]">
          <div className="flex items-center space-x-2">
            <div className="relative">
              {!selectedFile ? (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-400 hover:text-white"
                    disabled={!isConnected && unsentMessages.length > 0}
                  >
                    <File className="w-5 h-5" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,video/*,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    disabled={!isConnected && unsentMessages.length > 0}
                  />
                </>
              ) : (
                <div className="flex items-center space-x-1 bg-gray-700 px-2 py-1 rounded">
                  {selectedFile.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="preview"
                      className="w-8 h-8 object-cover rounded"
                    />
                  ) : selectedFile.type.startsWith("video/") ? (
                    <video
                      src={URL.createObjectURL(selectedFile)}
                      className="w-8 h-8 object-cover rounded"
                      controls
                    />
                  ) : (
                    <span className="text-xs truncate max-w-[80px]">
                      {selectedFile.name}
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-red-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={
                  isConnected
                    ? isRecording
                      ? `Recording... (${recordingTime}s)`
                      : "Type a message..."
                    : unsentMessages.length > 0
                    ? "Reconnecting... (messages queued)"
                    : "Connecting..."
                }
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !isRecording) {
                    sendMessage();
                  }
                }}
                className={`w-full px-3 sm:px-4 py-2 pr-10 border rounded-full text-white placeholder-gray-400 text-xs sm:text-sm ${
                  isConnected
                    ? "border-[#2B3135] bg-[#2B3135]"
                    : "border-gray-700 bg-gray-800"
                }`}
                disabled={!isConnected && unsentMessages.length > 0}
              />
              <button
                onClick={() => {
                  if ((newMessage.trim() || selectedFile) && !isRecording) {
                    sendMessage();
                  } else {
                    isRecording ? stopRecording() : startRecording();
                  }
                }}
                disabled={!isConnected && unsentMessages.length > 0}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded ${
                  isConnected || unsentMessages.length > 0
                    ? "text-white hover:bg-[#1e1e1e]"
                    : "text-gray-500 cursor-not-allowed"
                }`}
                style={{ lineHeight: 0 }}
              >
                {isRecording ? (
                  <Mic className="w-4 h-4 text-red-500" />
                ) : newMessage.trim() || selectedFile ? (
                  <Send className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            </div>
            {isRecording && (
              <button
                onClick={cancelRecording}
                className="p-2 text-red-400 hover:text-red-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const VoiceNotePlayer = React.memo(({ file }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const blobUrlRef = useRef(null);

  const audioSrc = useMemo(() => {
    if (!file?.data || !file?.type || !Array.isArray(file.data)) {
      console.error("Invalid file data or type:", file);
      setError("Invalid audio file");
      return null;
    }
    try {
      const byteArray = new Uint8Array(file.data);
      if (byteArray.length === 0) {
        console.error("Empty file data:", file);
        setError("Empty audio file");
        return null;
      }
      const blob = new Blob([byteArray], { type: file.type });
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      return url;
    } catch (err) {
      console.error("Error creating blob:", err);
      setError("Failed to load audio");
      return null;
    }
  }, [file]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    const handleError = (e) => {
      console.error("Audio error:", e);
      setError("Failed to load audio");
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      if (audio) {
        audio.currentTime = 0;
      }
    };

    const handleTimeUpdate = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    audio.addEventListener("error", handleError);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    audio.src = audioSrc;

    return () => {
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [audioSrc]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) {
      setError("Audio source not available");
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setError(null);
        })
        .catch((err) => {
          console.error("Play error:", err);
          setError("Failed to play audio");
          setIsPlaying(false);
        });
    }
  }, [isPlaying, audioSrc]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (error) {
    return (
      <div className="flex items-center bg-gray-200 p-2 rounded-lg w-full text-red-600 text-xs">
        {error}
      </div>
    );
  }

  return (
    <div className="flex items-center bg-gray-200 p-2 rounded-lg w-full">
      <button
        onClick={togglePlay}
        className="p-2 bg-blue-500 text-white rounded-full flex-shrink-0"
        disabled={!audioSrc}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </button>

      <div className="ml-2 flex-1 min-w-0">
        <div className="text-xs text-gray-700 mb-1">Voice message</div>
        <div className="relative h-1 bg-gray-300 rounded-full w-full">
          <div
            className="absolute h-1 bg-blue-500 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatTime((file.duration * progress) / 100 || 0)}</span>
          <span>{formatTime(file.duration || 1)}</span>
        </div>
      </div>

      {audioSrc && <audio ref={audioRef} hidden />}
    </div>
  );
});