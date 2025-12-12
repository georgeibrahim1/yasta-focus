import { useEffect, useState, useRef } from 'react';
import socketService from '../services/socketService';

export const useSocket = (token) => {
  const [isConnected, setIsConnected] = useState(socketService.isConnected());
  const [socket, setSocket] = useState(socketService.getSocket());
  const hasConnected = useRef(false);

  useEffect(() => {
    if (!token || hasConnected.current) {
      // If already connected, just check status
      if (socketService.isConnected()) {
        setIsConnected(true);
        setSocket(socketService.getSocket());
      }
      return;
    }

    hasConnected.current = true;
    const connectedSocket = socketService.connect(token);
    setSocket(connectedSocket);

    const handleConnect = () => {
      console.log('useSocket: connected');
      setIsConnected(true);
    };
    
    const handleDisconnect = () => {
      console.log('useSocket: disconnected');
      setIsConnected(false);
    };

    connectedSocket.on('connect', handleConnect);
    connectedSocket.on('disconnect', handleDisconnect);

    // Check initial connection state
    if (connectedSocket.connected) {
      setIsConnected(true);
    }

    return () => {
      connectedSocket.off('connect', handleConnect);
      connectedSocket.off('disconnect', handleDisconnect);
      // Don't disconnect on unmount to keep connection alive
    };
  }, [token]);

  return { socket, isConnected };
};
