import { useCallback, useEffect } from 'react';
import { startRobot, getOrderById } from '../../api/services/payment';
import { EOrderStatus } from '../../components/state/order/orderSlice';
import { PaymentState } from '../../state/paymentStateMachine';
import { logger } from '../../util/logger';
import useStore from '../../components/state/store';
import { navigateToQueueWaiting, navigateToPaymentSuccess } from '../../utils/navigation';
import { NavigateFunction } from 'react-router-dom';

interface UseRobotStartOptions {
  orderId: string | undefined;
  navigate: NavigateFunction;
}

export function useRobotStart({ orderId, navigate }: UseRobotStartOptions) {
  const {
    order,
    queuePosition,
    setIsLoading,
    setPaymentState,
    setQueuePosition,
    setQueueNumber,
    setOrder,
  } = useStore();

  const handleStartRobot = useCallback(async () => {
    if (!orderId) {
      logger.warn('[RobotStart] Cannot start robot: no order ID');
      return;
    }

    const paymentState = useStore.getState().paymentState;
    if (paymentState !== PaymentState.PAYMENT_SUCCESS) {
      logger.warn('[RobotStart] Cannot start robot: payment not confirmed');
      return;
    }

    try {
      logger.info('[RobotStart] Starting robot for order:', orderId);
      setIsLoading(true);
      setPaymentState(PaymentState.STARTING_ROBOT);
      
      const response = await startRobot(orderId);

      logger.info('[RobotStart] Robot start API call successful', response);

      // Check if order is in queue (checking for Cyrillic "очереди" or "queue" in message)
      const isInQueue = response.message && (
        response.message.includes('очереди') || 
        response.message.toLowerCase().includes('queue')
      );
      
      if (isInQueue) {
        logger.info('[RobotStart] Order is in queue, fetching order details');
        
        // Fetch order details to get queue position
        const orderDetails = await getOrderById(orderId);
        
        // Update queue position and number
        if (orderDetails.queue_position !== undefined) {
          setQueuePosition(orderDetails.queue_position);
          logger.info(`[RobotStart] Queue position: ${orderDetails.queue_position}`);
        }
        
        if (orderDetails.queue_number !== undefined) {
          setQueueNumber(orderDetails.queue_number);
        }

        // Update order status if available
        if (orderDetails.status) {
          setOrder({
            id: orderId,
            status: orderDetails.status,
            programId: order?.programId,
            paymentMethod: order?.paymentMethod,
            createdAt: order?.createdAt || new Date().toISOString(),
          });
        }

        // Set payment state and navigate to queue waiting page
        // Use setTimeout to ensure state updates are flushed before navigation
        setPaymentState(PaymentState.QUEUE_WAITING);
        setIsLoading(false);
        
        // Small delay to ensure state updates are processed
        setTimeout(() => {
          logger.info('[RobotStart] Navigating to queue waiting page');
          navigateToQueueWaiting(navigate);
        }, 0);
        
        return;
      }

      // If not in queue, wait for WebSocket update with PROCESSING status
      logger.info('[RobotStart] Order not in queue, waiting for WebSocket update');
    } catch (error) {
      logger.error('[RobotStart] Error starting robot', error);
      setIsLoading(false);
      setPaymentState(PaymentState.PAYMENT_ERROR);
    }
  }, [orderId, setIsLoading, setPaymentState, setQueuePosition, setQueueNumber, setOrder, order, navigate]);

  useEffect(() => {
    if (order?.id === orderId && order?.status === EOrderStatus.PROCESSING) {
      logger.info('[RobotStart] Order status updated to PROCESSING via WebSocket');
      setPaymentState(PaymentState.ROBOT_STARTED);
      setIsLoading(false);
      
      const currentQueuePosition = queuePosition;
      if (currentQueuePosition !== null && currentQueuePosition > 0) {
        navigateToQueueWaiting(navigate);
      } else {
        navigateToPaymentSuccess(navigate);
      }
    }
  }, [order?.id, order?.status, orderId, queuePosition, navigate, setIsLoading, setPaymentState]);

  return {
    handleStartRobot,
  };
}


