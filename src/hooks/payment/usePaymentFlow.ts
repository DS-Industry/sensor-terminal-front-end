import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cancelOrder } from '../../api/services/payment';
import { EPaymentMethod, EOrderStatus } from '../../components/state/order/orderSlice';
import { PaymentState } from '../../state/paymentStateMachine';
import { PAYMENT_CONSTANTS } from '../../constants/payment';
import { logger } from '../../util/logger';
import useStore from '../../components/state/store';
import { useOrderCreation } from './useOrderCreation';
import { usePaymentWebSocket } from './usePaymentWebSocket';
import { useQueueManagement } from './useQueueManagement';
import { useRobotStart } from './useRobotStart';
import { navigateToMain } from '../../utils/navigation';
import { logOrderCleared, logPaymentDiagnostic } from '../../util/paymentDiagnostics';

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
      logOrderCleared('payment_timeout_cancel', order?.id);
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
    logPaymentDiagnostic('info', 'countdown_started', 'H6', order?.id, {
      paymentMethod,
      countdownSeconds: initialTime,
    });

    countdownTimeoutRef.current = setTimeout(() => {
      logger.info(`[${paymentMethod}] Automatic robot start triggered`);
      logPaymentDiagnostic('info', 'countdown_fire_attempt', 'H6', order?.id, {
        paymentMethod,
      });
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
    } else if (paymentState !== PaymentState.PAYMENT_SUCCESS && countdownTimeoutRef.current) {
      logPaymentDiagnostic('info', 'countdown_cancelled', 'H6', order?.id, {
        paymentState,
        reason: 'payment_state_changed',
        timeUntilRobotStart: useStore.getState().timeUntilRobotStart,
      });
    }
  }, [paymentState, startCountdown]);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (selectedProgram && paymentState === PaymentState.IDLE) {
      logger.debug(`[${paymentMethod}] Component mounted, creating order`);
      logPaymentDiagnostic('info', 'flow_mount_autocreate_triggered', undefined, order?.id, {
        selectedProgramId: selectedProgram.id,
        paymentState,
      });
      createOrder();
    } else {
      logPaymentDiagnostic('debug', 'flow_mount_autocreate_skipped', undefined, order?.id, {
        hasSelectedProgram: Boolean(selectedProgram),
        paymentState,
      });
    }
    
    return () => {
      isMountedRef.current = false;
      const hadCountdown = Boolean(countdownTimeoutRef.current);
      if (hadCountdown) {
        const { paymentState: currentPaymentState, timeUntilRobotStart, order: currentOrder } = useStore.getState();
        logPaymentDiagnostic('warn', 'countdown_unmounted', 'H6', currentOrder?.id, {
          paymentMethod,
          paymentState: currentPaymentState,
          timeUntilRobotStart,
        });
      }
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
    const {
      order: currentOrder,
      paymentState: currentPaymentState,
      setIsCancellingOrder,
      closeBackConfirmationModal,
    } = useStore.getState();

    const isPaidOrStarting =
      currentPaymentState === PaymentState.PAYMENT_SUCCESS ||
      currentPaymentState === PaymentState.STARTING_ROBOT ||
      currentPaymentState === PaymentState.ROBOT_STARTED ||
      currentOrder?.status === EOrderStatus.PAYED ||
      currentOrder?.status === EOrderStatus.PROCESSING;

    if (isPaidOrStarting) {
      closeBackConfirmationModal();
      setIsCancellingOrder(false);
      logPaymentDiagnostic('info', 'back_blocked_paid_order', 'H5', currentOrder?.id, {
        paymentState: currentPaymentState,
        orderStatus: currentOrder?.status,
      });
      logger.info(`[${paymentMethod}] Back navigation blocked - order is paid or wash is starting`, {
        orderId: currentOrder?.id,
        paymentState: currentPaymentState,
        orderStatus: currentOrder?.status,
      });
      return;
    }

    logger.info(`[${paymentMethod}] Handling back navigation - cleaning up everything`);

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

    const orderIdToCancel = currentOrder?.id;
    let cancelSucceeded = !orderIdToCancel;

    if (orderIdToCancel && isMountedRef.current) {
      try {
        await cancelOrder(orderIdToCancel);
        cancelSucceeded = true;
        logger.info(`[${paymentMethod}] Order cancelled on back button`, { orderId: orderIdToCancel });
      } catch (error) {
        logger.error(`[${paymentMethod}] Error cancelling order on back`, error);
        cancelSucceeded = false;
      }
    }

    if (!cancelSucceeded) {
      logPaymentDiagnostic('warn', 'back_cancel_failed', 'H5', orderIdToCancel, {
        paymentMethod,
        hadOrderId: Boolean(orderIdToCancel),
      });
      setIsCancellingOrder(false);
      closeBackConfirmationModal();
      return;
    }

    setIsLoading(false);
    resetPayment();
    setGlobalQueuePosition(null);
    setGlobalQueueNumber(null);

    if (isMountedRef.current) {
      logOrderCleared('payment_back_button', orderIdToCancel);
      clearOrder();
      setSelectedProgram(null);
      setBankCheck("");
      setInsertedAmount(0);
      setIsLoading(false);

      setIsCancellingOrder(false);
      closeBackConfirmationModal();

      navigateToMain(navigate);
    }
  }, [
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

