import { env } from '../config/env';
import { logger } from './logger';

const WS_BASE_URL = env.VITE_API_BASE_WS_URL;

type WebSocketEvent = 'status_update' | 'mobile_payment' | 'device_status' | 'error' | 'card_reader';

export interface WebSocketMessage {
  type: WebSocketEvent;
  order_id?: string;
  status?: string;
  transaction_id?: string;
  timestamp: string;
}

type EventListener = (data: WebSocketMessage) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private listeners: Map<WebSocketEvent, EventListener[]> = new Map();
  public isConnected = false;
  private connectionTimeout: ReturnType<typeof setTimeout> | null = null;
  private lastLoggedMessages: Map<string, number> = new Map(); 
  private logDeduplicationWindow: number = 1000;

  constructor() {
    this.initializeConnection();
  }

  private async initializeConnection() {
    setTimeout(() => {
      this.connect();
    }, 1000);
  }

  connect() { 
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(`${WS_BASE_URL}/ws/orders/status/`);
      this.isConnected = false;

      this.connectionTimeout = setTimeout(() => {
        if (!this.isConnected) {
          this.handleReconnect();
        }
      }, 5000);
      
      this.ws.onopen = () => {
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        this.reconnectAttempts = 0;
        this.isConnected = true;
        logger.trackSocketEvent('connection_open', {
          url: `${WS_BASE_URL}/ws/orders/status/`,
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          
          const messageKey = `${data.type}-${data.order_id || 'no-order'}-${data.status || 'no-status'}-${data.timestamp || 'no-timestamp'}`;
          const now = Date.now();
          const lastLogTime = this.lastLoggedMessages.get(messageKey) || 0;
          
          const shouldLog = (now - lastLogTime) > this.logDeduplicationWindow;
          
          if (shouldLog) {
            logger.trackSocketEvent(data.type, {
              orderId: data.order_id,
              status: data.status,
              transactionId: data.transaction_id,
              rawData: data,
            });
            this.lastLoggedMessages.set(messageKey, now);
            
            if (this.lastLoggedMessages.size > 1000) {
              const entriesToDelete = Array.from(this.lastLoggedMessages.entries())
                .filter(([_, time]) => now - time > this.logDeduplicationWindow * 10)
                .slice(0, 500);
              entriesToDelete.forEach(([key]) => this.lastLoggedMessages.delete(key));
            }
          }
          
          this.notifyListeners(data);
        } catch (error) {
          logger.error('WebSocket message parse error', error);
        }
      };

      this.ws.onerror = () => {
        this.isConnected = false;
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        logger.trackSocketEvent('connection_error', {});
      };

      this.ws.onclose = (event) => {
        this.isConnected = false;
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        logger.trackSocketEvent('connection_close', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });
        this.handleReconnect();
      };

    } catch (error) {
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), this.reconnectInterval);
    }
  }

  addListener(eventType: WebSocketEvent, listener: EventListener) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);

    return () => this.removeListener(eventType, listener);
  }

  removeListener(eventType: WebSocketEvent, listener: EventListener) {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      this.listeners.set(eventType, eventListeners.filter(l => l !== listener));
    }
  }

  private notifyListeners(data: WebSocketMessage) {
    const eventListeners = this.listeners.get(data.type as WebSocketEvent);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          logger.error('Error in WebSocket listener:', error);
        }
      });
    }
  }

  close() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
    this.isConnected = false;
  }
}

export const globalWebSocketManager = new WebSocketManager();