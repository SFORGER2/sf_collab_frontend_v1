import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, MessageCircle, ChevronLeft, Search, Archive, ChevronDown, ChevronRight } from "lucide-react";
import ConversationItem from '@/components/chat (previous)/ConversationItem';
import ChatHeader from '@/components/chat (previous)/ChatHeader';
import MessageBubble from '@/components/chat (previous)/MessageBubble';
import ChatInput from '@/components/chat (previous)/ChatInput';
import TypingIndicator from '@/components/chat (previous)/TypingIndicator';
import DateSeparator, { shouldShowDateSeparator } from '@/components/chat (previous)/DateSeparator';
import Avatar from '@/components/chat (previous)/Avatar';
import { getProfilePicture } from '@/utils/getProfilePicture';

const MobileChatPage = ({
  conversations,
  activeConversation,
  setActiveConversation,
  messages,
  isLoading,
  typingUsers,
  onlineUsers,
  currentUserId,
  activeTab,
  handleSetActiveTab,
  searchTerm,
  setSearchTerm,
  handleSendMessage,
  handleFileUpload,
  handleInputChange,
  messageInput,
  socket,
  archivedConversations,
  handleArchive,
  handleUnarchive,
  handlePin,
  handleUnpin,
  lastActiveAt,
  lastSeenAt,
  nowTs,
  headerStatusText,
  headerPresenceStatus,
  handleOpenProfile,
  setShowNewMessage,
  filteredConversations,
  shouldShowAvatar,
  shouldShowSenderName,
  otherParticipant
}) => {
  return (
    <div className="h-[calc(100vh-64px)] bg-zinc-950 flex flex-col relative overflow-hidden">
      <AnimatePresence mode="wait">
        {!activeConversation ? (
          /* 1. CONVERSATION LIST VIEW */
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <header className="p-4 border-b border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-white tracking-tight">Messages</h1>
                <button 
                  onClick={() => setShowNewMessage(true)}
                  className="w-10 h-10 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center text-zinc-400"
                >
                  <Edit3 size={18} />
                </button>
              </div>
              
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-2.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['all', 'friends', 'groups', 'startups'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleSetActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      activeTab === tab ? "bg-amber-500 text-zinc-950" : "bg-zinc-900 text-zinc-500 border border-white/5"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-2">
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
                  <MessageCircle size={40} className="mb-4 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest">No conversations</p>
                </div>
              ) : (
                filteredConversations.map((conv, idx) => (
                  <ConversationItem
                    key={idx}
                    conversation={conv}
                    isActive={false}
                    onClick={() => setActiveConversation(conv)}
                    onlineUsers={onlineUsers}
                    currentUserId={currentUserId}
                    lastActiveAt={lastActiveAt}
                    lastSeenAt={lastSeenAt}
                    nowTs={nowTs}
                    isMobile={true}
                  />
                ))
              )}

              {activeTab !== 'archived' && archivedConversations.length > 0 && (
                <button
                  onClick={() => handleSetActiveTab('archived')}
                  className="w-full flex items-center gap-3 p-4 mt-2 rounded-2xl bg-zinc-900/30 text-zinc-500 text-xs font-bold"
                >
                  <Archive size={14} />
                  <span>Archived ({archivedConversations.length})</span>
                  <ChevronRight size={14} className="ml-auto" />
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          /* 2. ACTIVE CHAT VIEW */
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col bg-zinc-950"
          >
            <ChatHeader
              conversation={activeConversation}
              currentUserId={currentUserId}
              presenceStatus={headerPresenceStatus}
              statusText={headerStatusText}
              onAvatarClick={handleOpenProfile}
              onBack={() => setActiveConversation(null)}
              isMobile={true}
            />

            <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-600">
                   <Avatar
                    src={getProfilePicture(otherParticipant)}
                    name={otherParticipant?.firstName || ""}
                    size="xl"
                  />
                  <p className="mt-4 font-bold text-white">{otherParticipant?.firstName} {otherParticipant?.lastName}</p>
                  <p className="text-[10px] uppercase tracking-widest font-black text-zinc-700 mt-2">Start a conversation</p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const prevMessage = index > 0 ? messages[index - 1] : null;
                  const isOwn = String(message.sender_id) === String(currentUserId);
                  return (
                    <React.Fragment key={index}>
                      {shouldShowDateSeparator(message, prevMessage) && (
                        <DateSeparator date={message.created_at} />
                      )}
                      <MessageBubble
                        message={message}
                        isOwn={isOwn}
                        showAvatar={shouldShowAvatar(message, index)}
                        currentUserId={currentUserId}
                        conversationId={activeConversation?.id}
                        conversationType={activeConversation?.conversation_type}
                        showSenderName={shouldShowSenderName(messages, index)}
                      />
                    </React.Fragment>
                  );
                })
              )}
              <TypingIndicator users={typingUsers} />
            </div>

            <div className="p-2 border-t border-white/5 bg-zinc-950/80 backdrop-blur-xl pb-6">
              <ChatInput
                value={messageInput}
                onChange={handleInputChange}
                onSend={handleSendMessage}
                onFileUpload={handleFileUpload}
                disabled={!activeConversation}
                isMobile={true}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileChatPage;
