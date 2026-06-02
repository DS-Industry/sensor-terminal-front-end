import { useCallback, useEffect } from 'react';
import { startRobot, getOrderById } from '../../api/services/payment';
import { EOrderStatus } from '../../components/state/order/orderSlice';
import { PaymentState } from '../../state/paymentStateMachine';
import { logger } from '../../util/logger';
import useStore from '../../components/state/store';
import { navigateToQueueWaiting, navigateToPaymentSuccess } from '../../utils/navigation';
import { NavigateFunction } from 'react-router-dom';
import { normalizeOrderId, orderIdsMatch } from '../../util/orderId';
import { logPaymentDiagnostic } from '../../util/paymentDiagnostics';

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
    const effectiveOrderId = normalizeOrderId(orderId || useStore.getState().order?.id);
    logPaymentDiagnostic('info', 'robot_start_invoked', undefined, orderId, {
      effectiveOrderId,
    });

    if (!effectiveOrderId) {
      logger.trackLog('RobotStart', 'warn', 'Cannot start robot: no order ID');
      logPaymentDiagnostic('warn', 'robot_start_no_order_id', 'H1', orderId);
      return;
    }

    const paymentState = useStore.getState().paymentState;
    if (paymentState !== PaymentState.PAYMENT_SUCCESS) {
      logger.trackLog('RobotStart', 'warn', 'Cannot start robot: payment not confirmed', {
        paymentState,
      });
      logPaymentDiagnostic('warn', 'robot_start_wrong_payment_state', 'H1', orderId, {
        effectiveOrderId,
        paymentState,
      });
      return;
    }

    try {
      logger.trackLog('RobotStart', 'info', 'Starting robot for order', { orderId: effectiveOrderId });
      logPaymentDiagnostic('info', 'robot_start_api_start', undefined, orderId, {
        effectiveOrderId,
      });
      setIsLoading(true);
      setPaymentState(PaymentState.STARTING_ROBOT);
      
      const response = await startRobot(effectiveOrderId);

      logger.trackLog('RobotStart', 'info', 'Robot start API call successful', {
        orderId: effectiveOrderId,
        response,
      });
      logPaymentDiagnostic('info', 'robot_start_api_ok', undefined, orderId, {
        effectiveOrderId,
        responseMessage: response.message,
      });

      // Check if order is in queue (checking for Cyrillic "очереди" or "queue" in message)
      const isInQueue = response.message && (
        response.message.includes('очереди') || 
        response.message.toLowerCase().includes('queue')
      );
      logPaymentDiagnostic('info', 'robot_start_api_response_classified', undefined, orderId, {
        effectiveOrderId,
        responseMessage: response.message,
        isInQueue: Boolean(isInQueue),
      });
      
      if (isInQueue) {
        logger.trackLog('RobotStart', 'info', 'Order is in queue, fetching order details', { orderId: effectiveOrderId });
        
        // Fetch order details to get queue position
        const orderDetails = await getOrderById(effectiveOrderId);
        
        // Update queue position and number
        if (orderDetails.queue_position !== undefined) {
          setQueuePosition(orderDetails.queue_position);
          logger.trackLog('RobotStart', 'info', 'Queue position updated', {
            orderId: effectiveOrderId,
            queuePosition: orderDetails.queue_position,
          });
        }
        
        if (orderDetails.queue_number !== undefined) {
          setQueueNumber(orderDetails.queue_number);
        }

        // Update order status if available
        if (orderDetails.status) {
          setOrder({
            id: effectiveOrderId,
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
          logger.trackLog('RobotStart', 'info', 'Navigating to queue waiting page', { orderId: effectiveOrderId });
          navigateToQueueWaiting(navigate);
        }, 0);
        
        return;
      }

      // If not in queue, wait for WebSocket update with PROCESSING status
      logger.trackLog('RobotStart', 'info', 'Order not in queue, waiting for WebSocket update', {
        orderId: effectiveOrderId,
      });
    } catch (error) {
      logger.trackError(error, { source: 'RobotStart', phase: 'handleStartRobot', orderId: effectiveOrderId });
      logger.error('[RobotStart] Error starting robot', error);
      logPaymentDiagnostic('error', 'robot_start_api_fail', 'H1', orderId, {
        effectiveOrderId,
      });
      setIsLoading(false);
      setPaymentState(PaymentState.PAYMENT_ERROR);
    }
  }, [orderId, setIsLoading, setPaymentState, setQueuePosition, setQueueNumber, setOrder, order, navigate]);

  useEffect(() => {
    const trackedOrderId = normalizeOrderId(orderId || order?.id);
    if (orderIdsMatch(order?.id, trackedOrderId) && order?.status === EOrderStatus.PROCESSING) {
      logger.trackLog('RobotStart', 'info', 'Order status updated to PROCESSING via WebSocket', {
        orderId: trackedOrderId,
      });
      setPaymentState(PaymentState.ROBOT_STARTED);
      setIsLoading(false);
      
      const currentQueuePosition = queuePosition;
      if (currentQueuePosition !== null && currentQueuePosition > 0) {
        logPaymentDiagnostic('info', 'processing_navigate_queue', 'H3', orderId, {
          trackedOrderId,
          queuePosition: currentQueuePosition,
        });
        navigateToQueueWaiting(navigate);
      } else {
        logPaymentDiagnostic('info', 'processing_navigate_success', 'H3', orderId, {
          trackedOrderId,
          queuePosition: currentQueuePosition,
        });
        navigateToPaymentSuccess(navigate);
      }
    }
  }, [order?.id, order?.status, orderId, queuePosition, navigate, setIsLoading, setPaymentState]);

  return {
    handleStartRobot,
  };
}

