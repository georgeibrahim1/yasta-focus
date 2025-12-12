import { useEffect, useState, useCallback } from 'react';
import socketService from '../services/socketService';

export const useRoomChat = (roomCode, communityId, isInRoom) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isInRoom || !roomCode || !communityId) return;

    // Request message history
    socketService.getMessages(parseInt(roomCode), communityId);
    setIsLoading(true);

    // Listen for message history
    const handleMessageHistory = (history) => {
      setMessages(history);
      setIsLoading(false);
    };

    // Listen for new messages
    const handleNewMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    socketService.on('message_history', handleMessageHistory);
    socketService.on('new_message', handleNewMessage);

    return () => {
      socketService.off('message_history', handleMessageHistory);
      socketService.off('new_message', handleNewMessage);
    };
  }, [roomCode, communityId, isInRoom]);

  const sendMessage = useCallback((content) => {
    if (!content.trim()) return;
    socketService.sendMessage(parseInt(roomCode), communityId, content);
  }, [roomCode, communityId]);

  return { messages, sendMessage, isLoading };
};
