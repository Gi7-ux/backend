import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import websocketService from '@/lib/websocket';
import { useApiData } from './ApiDataContext';

interface WebSocketContextType {
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, token } = useAuth();
  const { fetchStatusUpdates } = useApiData();
  const [isConnected, setIsConnected] = useState(false);

  // Connect to WebSocket when user is authenticated
  useEffect(() => {
    if (!currentUser || !token) {
      return;
    }

    const connect = async () => {
      try {
        await websocketService.connect(token);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      websocketService.disconnect();
      setIsConnected(false);
    };
  }, [currentUser, token]);

  // Register handlers for WebSocket messages
  useEffect(() => {
    if (!isConnected) {
      return;
    }

    // Handler for new status updates
    const handleStatusUpdate = (data: any) => {
      // Refresh status updates when a new one is received
      fetchStatusUpdates(data.job_id);
    };

    // Handler for new admin comments
    const handleAdminComment = (data: any) => {
      // Refresh status updates when a new comment is received
      fetchStatusUpdates(data.job_id);
    };

    // Register handlers
    websocketService.on('status_update', handleStatusUpdate);
    websocketService.on('admin_comment', handleAdminComment);

    // Clean up handlers when component unmounts
    return () => {
      websocketService.off('status_update', handleStatusUpdate);
      websocketService.off('admin_comment', handleAdminComment);
    };
  }, [isConnected, fetchStatusUpdates]);

  return (
    <WebSocketContext.Provider value={{ isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
