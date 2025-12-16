import { globalWebSocketManager, type WebSocketMessage } from '../util/websocketManager';
import { EOrderStatus } from '../components/state/order/orderSlice';
import { logger } from '../util/logger';
import useStore from '../components/state/store';
// Navigation is handled by pages watching order status

class WebSocketService {
  private static instance: WebSocketService | null = null;
  private removeStatusListener: (() => void) | null = null;
  private removeErrorListener: (() => void) | null = null;

  private constructor() {
    this.setupListeners();
  }

  static initialize(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  private setupListeners() {
    const handleStatusUpdate = (data: WebSocketMessage) => {
      if (data.type === 'status_update' && data.order_id) {
        const currentOrder = useStore.getState().order;
        
        if (!currentOrder?.id || currentOrder.id === data.order_id) {
          logger.debug(`Updating order status globally: ${data.status} for order ${data.order_id}`);
          
          const orderStatus = data.status as EOrderStatus | undefined;

          useStore.getState().setOrder({
            ...currentOrder,
            id: data.order_id,
            status: orderStatus,
            transactionId: data.transaction_id,
          });

          if (orderStatus === EOrderStatus.COMPLETED) {
            logger.info(`Order ${data.order_id} completed`);
          }
        } else {
          logger.debug(`Ignoring status update for different order: ${data.order_id} (current order: ${currentOrder.id})`);
        }
      }
    };

    const handleError = (data: WebSocketMessage & { code?: number }) => {
      if (data.type === 'error') {
        logger.error('WebSocket error received', data);

        if (data.code !== undefined) {
          useStore.getState().setErrorCode(data.code);
        }
      }
    };

    this.removeStatusListener = globalWebSocketManager.addListener('status_update', handleStatusUpdate);
    this.removeErrorListener = globalWebSocketManager.addListener('error', handleError);
  }

  cleanup() {
    if (this.removeStatusListener) {
      this.removeStatusListener();
      this.removeStatusListener = null;
    }
    if (this.removeErrorListener) {
      this.removeErrorListener();
      this.removeErrorListener = null;
    }
  }
}

export { WebSocketService };




