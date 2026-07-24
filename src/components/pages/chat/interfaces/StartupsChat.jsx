import React, { useState, useEffect } from 'react';
import BaseChatLayout from '../views/BaseChatLayout';
import { chatAPI } from '@/utils/APIs/chatApi';
import { useSelector } from 'react-redux';

const StartupsChat = () => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { access_token: token } = useSelector((state) => state.auth);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!token) return;
      try {
        const data = await chatAPI.getAllChats();
        const convos = Array.isArray(data?.conversations)
          ? data.conversations
          : Array.isArray(data?.data?.conversations)
            ? data.data.conversations
            : [];
        const activeStartups = convos.filter((c) => !c?.is_archived && (c.conversation_type === 'startup' || c.conversation_type === 'team'));
        
        if (active) {
          setConversations(activeStartups);
        }
      } catch (err) {
        console.error("StartupsChat failed to fetch:", err);
        if (active) {
          setConversations([]);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [token]);

  const handleBroadcast = async (content) => {
    // Send message to all 2 startups simultaneously
    await Promise.all(
      conversations.map((convo) => chatAPI.sendMessage(convo.id, content))
    );
  };

  return (
    <BaseChatLayout
      category="startups"
      conversations={conversations}
      setConversations={setConversations}
      isLoading={isLoading}
      onBroadcast={handleBroadcast}
    />
  );
};

export default StartupsChat;
