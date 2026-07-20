import React, { useState, useEffect } from 'react';
import BaseChatLayout from '../views/BaseChatLayout';
import { chatAPI } from '@/utils/APIs/chatApi';
import { useSelector } from 'react-redux';

const AllChat = () => {
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
        const activeConvos = convos.filter((c) => !c?.is_archived);
        if (active) {
          setConversations(activeConvos);
        }
      } catch (err) {
        console.error("AllChat failed to fetch:", err);
        if (active) setConversations([]);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [token]);

  return (
    <BaseChatLayout
      category="all"
      conversations={conversations}
      setConversations={setConversations}
      isLoading={isLoading}
    />
  );
};

export default AllChat;
