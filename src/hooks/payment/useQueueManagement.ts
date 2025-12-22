import { useEffect, useCallback, useRef } from 'react';
import { getOrderById } from '../../api/services/payment';
import { PaymentState } from '../../state/paymentStateMachine';
import { EOrderStatus } from '../../components/state/order/orderSlice';
import { logger } from '../../util/logger';
import useStore from '../../components/state/store';
import { NavigateFunction } from 'react-router-dom';
import { globalWebSocketManager } from '../../util/websocketManager';
import type { WebSocketMessage } from '../../util/websocketManager';
import { navigateToPaymentSuccess } from '../../utils/navigation';

interface UseQueueManagementOptions {
  orderId: string | undefined;
  navigate?: NavigateFunction;
}

export function useQueueManagement({ orderId, navigate }: UseQueueManagementOptions) {
  const {
    order,
    queuePosition,
    setOrder,
    setQueuePosition,
    setQueueNumber,
    setPaymentState,
  } = useStore();

  const isMountedRef = useRef(true);
  const hasFetchedOnCompletedRef = useRef<string | null>(null);

  const fetchOrderDetails = useCallback(async (orderId: string, reason: string) => {
    try {
      logger.debug(`[QueueManagement] Fetching order details: ${reason}`);
      const orderDetails = await getOrderById(orderId);
      
      if (!isMountedRef.current) return;

      if (orderDetails.queue_position !== undefined) {
        const newQueuePosition = orderDetails.queue_position;
        const previousQueuePosition = useStore.getState().queuePosition;
        setQueuePosition(newQueuePosition);
        logger.debug(`[QueueManagement] Queue position updated from ${previousQueuePosition} to ${newQueuePosition}`);
        
        if (newQueuePosition > 0) {
          setPaymentState(PaymentState.QUEUE_WAITING);
        } else if (newQueuePosition === 0 && previousQueuePosition !== null && previousQueuePosition > 0 && navigate) {
          const currentPaymentState = useStore.getState().paymentState;
          const isPaymentAlreadySuccess = 
            currentPaymentState === PaymentState.PAYMENT_SUCCESS ||
            currentPaymentState === PaymentState.STARTING_ROBOT ||
            currentPaymentState === PaymentState.ROBOT_STARTED;
          
          if (!isPaymentAlreadySuccess) {
            logger.info(`[QueueManagement] Queue position became 0 (was ${previousQueuePosition}), navigating to success page`);
            navigateToPaymentSuccess(navigate);
          } else {
            logger.debug(`[QueueManagement] Queue position became 0 but payment is already in success state (${currentPaymentState}), skipping navigation`);
          }
        }
      }
      
      if (orderDetails.queue_number !== undefined) {
        setQueueNumber(orderDetails.queue_number);
      }

      if (orderDetails.status && order?.status !== orderDetails.status) {
        setOrder({
          id: orderId,
          status: orderDetails.status,
          programId: order?.programId,
          paymentMethod: order?.paymentMethod,
          createdAt: order?.createdAt || new Date().toISOString(),
        });
      }
    } catch (error) {
      logger.error('[QueueManagement] Error fetching order details', error);
    }
  }, [order, setOrder, setQueuePosition, setQueueNumber, setPaymentState, navigate]);

  useEffect(() => {
    if (!orderId) return;

    isMountedRef.current = true;

    const handleStatusUpdate = async (data: WebSocketMessage) => {
      if (data.type !== 'status_update' || !data.order_id) return;

      const orderStatus = data.status as EOrderStatus | undefined;
      if (!orderStatus) return;

      if (orderStatus === EOrderStatus.COMPLETED && data.order_id !== orderId) {
        if (hasFetchedOnCompletedRef.current === data.order_id) {
          return;
        }
        
        hasFetchedOnCompletedRef.current = data.order_id;
        
        const currentQueuePosition = useStore.getState().queuePosition;
        const currentPaymentState = useStore.getState().paymentState;
        const isPaymentAlreadySuccess = 
          currentPaymentState === PaymentState.PAYMENT_SUCCESS ||
          currentPaymentState === PaymentState.STARTING_ROBOT ||
          currentPaymentState === PaymentState.ROBOT_STARTED;
        
        if (currentQueuePosition === 1 && navigate && !isPaymentAlreadySuccess) {
          logger.info(`[QueueManagement] Another order ${data.order_id} completed and we're at position 1, navigating to success page immediately`);
          navigateToPaymentSuccess(navigate);
          await fetchOrderDetails(orderId, `another order ${data.order_id} completed`);
        } else {
          if (isPaymentAlreadySuccess) {
            logger.debug(`[QueueManagement] Another order ${data.order_id} completed but payment is already in success state (${currentPaymentState}), skipping navigation`);
          }
          logger.info(`[QueueManagement] Another order ${data.order_id} completed, fetching our order details to check queue position`);
          await fetchOrderDetails(orderId, `another order ${data.order_id} completed`);
        }
      }
    };

    const removeListener = globalWebSocketManager.addListener('status_update', handleStatusUpdate);

    return () => {
      isMountedRef.current = false;
      removeListener();
      hasFetchedOnCompletedRef.current = null;
    };
  }, [orderId, order?.status, fetchOrderDetails, navigate]);

  return {
    queuePosition,
  };
}

