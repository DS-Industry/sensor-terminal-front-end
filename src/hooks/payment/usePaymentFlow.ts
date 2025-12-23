import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cancelOrder } from '../../api/services/payment';
import { EPaymentMethod } from '../../components/state/order/orderSlice';
import { PaymentState } from '../../state/paymentStateMachine';
import { PAYMENT_CONSTANTS } from '../../constants/payment';
import { logger } from '../../util/logger';
import useStore from '../../components/state/store';
import { useOrderCreation } from './useOrderCreation';
import { usePaymentWebSocket } from './usePaymentWebSocket';
import { useQueueManagement } from './useQueueManagement';
import { useRobotStart } from './useRobotStart';
import { navigateToMain } from '../../utils/navigation';

export function usePaymentFlow(paymentMethod: EPaymentMethod) {
  const navigate = useNavigate();
  const {
    order,
    selectedProgram,
    paymentState,
    paymentError,
    timeUntilRobotStart,
    queuePosition,
    queueNumber,
    setIsLoading,
    clearOrder,
    setSelectedProgram,
    setBankCheck,
    setInsertedAmount,
    setQueuePosition: setGlobalQueuePosition,
    setQueueNumber: setGlobalQueueNumber,
    resetPayment,
  } = useStore();

  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const { createOrder, cancelOrderCreation } = useOrderCreation({
    selectedProgram,
    paymentMethod,
  });

  const handleOrderCanceled = useCallback(async () => {
    logger.info(`[${paymentMethod}] Order canceled, cleaning up and navigating to main page`);
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (countdownTimeoutRef.current) {
      clearTimeout(countdownTimeoutRef.current);
      countdownTimeoutRef.current = null;
    }
    
    setIsLoading(false);
    resetPayment();
    setGlobalQueuePosition(null);
    setGlobalQueueNumber(null);
    
    if (isMountedRef.current) {
      clearOrder();
      setSelectedProgram(null);
      setBankCheck("");
      setInsertedAmount(0);
      setIsLoading(false);
      
      navigateToMain(navigate);
    }
  }, [
    paymentMethod,
    navigate,
    setIsLoading,
    resetPayment,
    setGlobalQueuePosition,
    setGlobalQueueNumber,
    clearOrder,
    setSelectedProgram,
    setBankCheck,
    setInsertedAmount,
  ]);

  usePaymentWebSocket({
    orderId: order?.id,
    selectedProgram,
    paymentMethod,
    onOrderCanceled: handleOrderCanceled,
  });

  useQueueManagement({
    orderId: order?.id,
    navigate, 
  });

  const { handleStartRobot } = useRobotStart({
    orderId: order?.id,
    navigate,
  });

  const startCountdown = useCallback(() => {
    if (countdownTimeoutRef.current) {
      return;
    }

    logger.debug(`[${paymentMethod}] Starting automatic robot start countdown`);
    const initialTime = PAYMENT_CONSTANTS.START_ROBOT_INTERVAL / 1000;
    useStore.getState().setTimeUntilRobotStart(initialTime);

    countdownTimeoutRef.current = setTimeout(() => {
      logger.info(`[${paymentMethod}] Automatic robot start triggered`);
      handleStartRobot();
    }, PAYMENT_CONSTANTS.START_ROBOT_INTERVAL);

    countdownIntervalRef.current = setInterval(() => {
      const currentTime = useStore.getState().timeUntilRobotStart;
      if (currentTime <= 1) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        useStore.getState().setTimeUntilRobotStart(0);
      } else {
        useStore.getState().setTimeUntilRobotStart(currentTime - 1);
      }
    }, 1000);
  }, [paymentMethod, handleStartRobot]);

  useEffect(() => {
    if (paymentState === PaymentState.PAYMENT_SUCCESS && !countdownTimeoutRef.current) {
      startCountdown();
    }
  }, [paymentState, startCountdown]);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (selectedProgram && paymentState === PaymentState.IDLE) {
      logger.debug(`[${paymentMethod}] Component mounted, creating order`);
      createOrder();
    }
    
    return () => {
      isMountedRef.current = false;
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      if (countdownTimeoutRef.current) {
        clearTimeout(countdownTimeoutRef.current);
        countdownTimeoutRef.current = null;
      }
    };
  }, [selectedProgram, paymentMethod, paymentState, createOrder]);

  const handleBack = useCallback(async () => {
    logger.info(`[${paymentMethod}] Handling back navigation - cleaning up everything`);
    
    const { setIsCancellingOrder, closeBackConfirmationModal } = useStore.getState();
    
    // Set loading state
    setIsCancellingOrder(true);
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (countdownTimeoutRef.current) {
      clearTimeout(countdownTimeoutRef.current);
      countdownTimeoutRef.current = null;
    }
    
    cancelOrderCreation();
    
    // Get the current order from store to ensure we have the latest order ID
    const currentOrder = useStore.getState().order;
    const orderIdToCancel = currentOrder?.id;
    
    if (orderIdToCancel && isMountedRef.current) {
      try {
        await cancelOrder(orderIdToCancel);
        logger.info(`[${paymentMethod}] Order cancelled on back button`, { orderId: orderIdToCancel });
      } catch (error) {
        logger.error(`[${paymentMethod}] Error cancelling order on back`, error);
      }
    }

    setIsLoading(false);
    resetPayment();
    setGlobalQueuePosition(null);
    setGlobalQueueNumber(null);
    
    if (isMountedRef.current) {
      clearOrder();
      setSelectedProgram(null);
      setBankCheck("");
      setInsertedAmount(0);
      setIsLoading(false);
      
      // Clear loading state and close modal before navigation
      setIsCancellingOrder(false);
      closeBackConfirmationModal();
      
      navigateToMain(navigate);
    }
  }, [
    order,
    paymentMethod,
    navigate,
    cancelOrderCreation,
    setIsLoading,
    resetPayment,
    setGlobalQueuePosition,
    setGlobalQueueNumber,
    clearOrder,
    setSelectedProgram,
    setBankCheck,
    setInsertedAmount,
  ]);

  const handleRetry = useCallback(() => {
    resetPayment();
    createOrder();
  }, [createOrder, resetPayment]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (countdownTimeoutRef.current) {
        clearTimeout(countdownTimeoutRef.current);
      }
    };
  }, []);

  const isPaymentProcessing = paymentState === PaymentState.PROCESSING_PAYMENT;
  const paymentSuccess = paymentState === PaymentState.PAYMENT_SUCCESS;
  const queueFull = paymentState === PaymentState.QUEUE_FULL;
  const isWaitingForCard = paymentState === PaymentState.CREATING_ORDER || paymentState === PaymentState.WAITING_PAYMENT;

  return {
    handleBack,
    selectedProgram,
    order,
    paymentSuccess,
    isPaymentProcessing,
    isWaitingForCard,
    handleStartRobot,
    handleRetry,
    timeUntilRobotStart,
    queuePosition,
    queueNumber,
    paymentError,
    queueFull,
    paymentState,
    bankCheck: useStore.getState().bankCheck,
  };
}

