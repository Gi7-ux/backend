import { toast } from "@/components/ui/sonner";

type WebSocketMessageType = 
  | 'status_update'
  | 'admin_comment'
  | 'job_status_change'
  | 'new_task'
  | 'task_status_change';

interface WebSocketMessage {
  type: WebSocketMessageType;
  data: any;
}

type MessageHandler = (data: any) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;
  private messageHandlers: Map<WebSocketMessageType, MessageHandler[]> = new Map();
  private isConnecting = false;

  constructor() {
    // Initialize message handlers map
    this.messageHandlers.set('status_update', []);
    this.messageHandlers.set('admin_comment', []);
    this.messageHandlers.set('job_status_change', []);
    this.messageHandlers.set('new_task', []);
    this.messageHandlers.set('task_status_change', []);
  }

  /**
   * Connect to the WebSocket server
   */
  connect(token: string): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (this.isConnecting) {
      return Promise.resolve();
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = process.env.VITE_WS_URL || 'ws://localhost:8000/ws';
        this.socket = new WebSocket(`${wsUrl}?token=${token}`);

        this.socket.onopen = () => {
          console.log('WebSocket connection established');
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.socket.onclose = (event) => {
          console.log('WebSocket connection closed:', event.code, event.reason);
          this.socket = null;
          this.isConnecting = false;

          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectTimeout = window.setTimeout(() => {
              this.reconnectAttempts++;
              this.connect(token);
            }, 1000 * Math.pow(2, this.reconnectAttempts));
          }
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Register a handler for a specific message type
   */
  on(type: WebSocketMessageType, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(type) || [];
    handlers.push(handler);
    this.messageHandlers.set(type, handlers);
  }

  /**
   * Remove a handler for a specific message type
   */
  off(type: WebSocketMessageType, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(type) || [];
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
      this.messageHandlers.set(type, handlers);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    const { type, data } = message;
    const handlers = this.messageHandlers.get(type) || [];

    // Call all registered handlers for this message type
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in ${type} handler:`, error);
      }
    });

    // Show toast notifications for certain message types
    switch (type) {
      case 'status_update':
        toast({
          title: 'New Status Update',
          description: `${data.architect_name} submitted an update for project "${data.job_title}"`,
        });
        break;
      case 'admin_comment':
        toast({
          title: 'New Admin Comment',
          description: `${data.admin_name} commented on your status update for "${data.job_title}"`,
        });
        break;
      case 'job_status_change':
        toast({
          title: 'Job Status Changed',
          description: `Project "${data.job_title}" status changed to ${data.status}`,
        });
        break;
    }
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
