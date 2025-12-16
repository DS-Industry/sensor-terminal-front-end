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
    logger.info('[RobotStart] ===== handleStartRobot CALLED =====');
    logger.info('[RobotStart] orderId:', orderId);
    logger.info('[RobotStart] Current payment state:', useStore.getState().paymentState);
    logger.info('[RobotStart] Time until robot start:', useStore.getState().timeUntilRobotStart);
    
    if (!orderId) {
      logger.warn('[RobotStart] ===== CANNOT START: NO ORDER ID =====');
      return;
    }

    const paymentState = useStore.getState().paymentState;
    const timeUntilRobotStart = useStore.getState().timeUntilRobotStart;
    
    logger.debug('[RobotStart] Payment state check:', paymentState);
    logger.debug('[RobotStart] Time until robot start:', timeUntilRobotStart);
    
    if (paymentState !== PaymentState.PAYMENT_SUCCESS) {
      logger.warn('[RobotStart] ===== CANNOT START: PAYMENT NOT CONFIRMED =====');
      logger.warn('[RobotStart] Current payment state:', paymentState);
      logger.warn('[RobotStart] Expected state:', PaymentState.PAYMENT_SUCCESS);
      return;
    }

    try {
      logger.info('[RobotStart] ===== STARTING ROBOT API CALL =====');
      logger.info('[RobotStart] Order ID:', orderId);
      logger.info('[RobotStart] Payment state BEFORE API call:', useStore.getState().paymentState);
      logger.info('[RobotStart] Time until robot start BEFORE API call:', useStore.getState().timeUntilRobotStart);
      
      setIsLoading(true);
      setPaymentState(PaymentState.STARTING_ROBOT);
      
      logger.info('[RobotStart] Set payment state to STARTING_ROBOT');
      logger.info('[RobotStart] Payment state AFTER setState:', useStore.getState().paymentState);
      logger.info('[RobotStart] Time until robot start AFTER setState:', useStore.getState().timeUntilRobotStart);
      
      logger.info('[RobotStart] Calling startRobot API...');
      const response = await startRobot(orderId);

      logger.info('[RobotStart] ===== ROBOT START API CALL SUCCESSFUL =====');
      logger.info('[RobotStart] Response:', response);
      logger.info('[RobotStart] Payment state AFTER API success:', useStore.getState().paymentState);
      logger.info('[RobotStart] Time until robot start AFTER API success:', useStore.getState().timeUntilRobotStart);

      // Check if order is in queue (checking for Cyrillic "очереди" or "queue" in message)
      const isInQueue = response.message && (
        response.message.includes('очереди') || 
        response.message.toLowerCase().includes('queue')
      );
      
      logger.debug('[RobotStart] Checking if order is in queue:', isInQueue);
      logger.debug('[RobotStart] Response message:', response.message);
      
      if (isInQueue) {
        logger.info('[RobotStart] ===== ORDER IS IN QUEUE =====');
        logger.info('[RobotStart] Payment state BEFORE queue handling:', useStore.getState().paymentState);
        logger.info('[RobotStart] Time until robot start BEFORE queue handling:', useStore.getState().timeUntilRobotStart);
        
        // Fetch order details to get queue position
        logger.info('[RobotStart] Fetching order details for queue position...');
        const orderDetails = await getOrderById(orderId);
        
        logger.info('[RobotStart] Order details fetched:', {
          queue_position: orderDetails.queue_position,
          queue_number: orderDetails.queue_number,
          status: orderDetails.status
        });
        
        // Update queue position and number
        if (orderDetails.queue_position !== undefined) {
          logger.info('[RobotStart] Setting queue position:', orderDetails.queue_position);
          setQueuePosition(orderDetails.queue_position);
        }
        
        if (orderDetails.queue_number !== undefined) {
          logger.info('[RobotStart] Setting queue number:', orderDetails.queue_number);
          setQueueNumber(orderDetails.queue_number);
        }

        // Update order status if available
        if (orderDetails.status) {
          logger.info('[RobotStart] Updating order status to:', orderDetails.status);
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
        logger.info('[RobotStart] Setting payment state to QUEUE_WAITING');
        logger.info('[RobotStart] Payment state BEFORE QUEUE_WAITING:', useStore.getState().paymentState);
        logger.info('[RobotStart] Time until robot start BEFORE QUEUE_WAITING:', useStore.getState().timeUntilRobotStart);
        
        setPaymentState(PaymentState.QUEUE_WAITING);
        setIsLoading(false);
        
        logger.info('[RobotStart] Payment state AFTER QUEUE_WAITING:', useStore.getState().paymentState);
        logger.info('[RobotStart] Time until robot start AFTER QUEUE_WAITING:', useStore.getState().timeUntilRobotStart);
        
        // Small delay to ensure state updates are processed
        setTimeout(() => {
          logger.info('[RobotStart] Navigating to queue waiting page');
          navigateToQueueWaiting(navigate);
        }, 0);
        
        logger.info('[RobotStart] ===== QUEUE HANDLING COMPLETE =====');
        return;
      }

      // If not in queue, wait for WebSocket update with PROCESSING status
      logger.info('[RobotStart] ===== ORDER NOT IN QUEUE =====');
      logger.info('[RobotStart] Waiting for WebSocket update with PROCESSING status');
      logger.info('[RobotStart] Payment state:', useStore.getState().paymentState);
      logger.info('[RobotStart] Time until robot start:', useStore.getState().timeUntilRobotStart);
    } catch (error) {
      logger.error('[RobotStart] ===== ERROR STARTING ROBOT =====');
      logger.error('[RobotStart] Error details:', error);
      logger.error('[RobotStart] Payment state BEFORE error handling:', useStore.getState().paymentState);
      logger.error('[RobotStart] Time until robot start BEFORE error handling:', useStore.getState().timeUntilRobotStart);
      
      if (error instanceof Error) {
        logger.error('[RobotStart] Error name:', error.name);
        logger.error('[RobotStart] Error message:', error.message);
        logger.error('[RobotStart] Error stack:', error.stack);
      }
      
      setIsLoading(false);
      setPaymentState(PaymentState.PAYMENT_ERROR);
      
      logger.error('[RobotStart] Payment state AFTER error handling:', useStore.getState().paymentState);
      logger.error('[RobotStart] Time until robot start AFTER error handling:', useStore.getState().timeUntilRobotStart);
      logger.error('[RobotStart] ===== ERROR HANDLED =====');
    }
  }, [orderId, setIsLoading, setPaymentState, setQueuePosition, setQueueNumber, setOrder, order, navigate]);

  useEffect(() => {
    logger.debug('[RobotStart] ===== useRobotStart EFFECT RUN =====');
    logger.debug('[RobotStart] order?.id:', order?.id);
    logger.debug('[RobotStart] orderId:', orderId);
    logger.debug('[RobotStart] order?.status:', order?.status);
    logger.debug('[RobotStart] EOrderStatus.PROCESSING:', EOrderStatus.PROCESSING);
    logger.debug('[RobotStart] queuePosition:', queuePosition);
    logger.debug('[RobotStart] Current payment state:', useStore.getState().paymentState);
    logger.debug('[RobotStart] Time until robot start:', useStore.getState().timeUntilRobotStart);
    
    if (order?.id === orderId && order?.status === EOrderStatus.PROCESSING) {
      logger.info('[RobotStart] ===== PROCESSING STATUS DETECTED =====');
      logger.info('[RobotStart] Order status updated to PROCESSING via WebSocket');
      logger.info('[RobotStart] Payment state BEFORE PROCESSING:', useStore.getState().paymentState);
      logger.info('[RobotStart] Time until robot start BEFORE PROCESSING:', useStore.getState().timeUntilRobotStart);
      
      setPaymentState(PaymentState.ROBOT_STARTED);
      setIsLoading(false);
      
      logger.info('[RobotStart] Payment state AFTER ROBOT_STARTED:', useStore.getState().paymentState);
      logger.info('[RobotStart] Time until robot start AFTER ROBOT_STARTED:', useStore.getState().timeUntilRobotStart);
      
      const currentQueuePosition = queuePosition;
      logger.info('[RobotStart] Current queue position:', currentQueuePosition);
      
      if (currentQueuePosition !== null && currentQueuePosition > 0) {
        logger.info('[RobotStart] Navigating to queue waiting page');
        navigateToQueueWaiting(navigate);
      } else {
        logger.info('[RobotStart] Navigating to payment success page');
        navigateToPaymentSuccess(navigate);
      }
      
      logger.info('[RobotStart] ===== PROCESSING HANDLING COMPLETE =====');
    } else {
      logger.debug('[RobotStart] Conditions not met for PROCESSING handling');
    }
  }, [order?.id, order?.status, orderId, queuePosition, navigate, setIsLoading, setPaymentState]);

  return {
    handleStartRobot,
  };
}




