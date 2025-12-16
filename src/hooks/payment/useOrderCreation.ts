import { useCallback, useRef } from 'react';
import { createOrder } from '../../api/services/payment';
import { EPaymentMethod } from '../../components/state/order/orderSlice';
import { PaymentState } from '../../state/paymentStateMachine';
import { logger } from '../../util/logger';
import useStore from '../../components/state/store';
import { IProgram } from '../../api/types/program';

interface UseOrderCreationOptions {
  selectedProgram: IProgram | null;
  paymentMethod: EPaymentMethod;
}

export function useOrderCreation({ selectedProgram, paymentMethod }: UseOrderCreationOptions) {
  const { setIsLoading, setOrder, setPaymentState, setPaymentError } = useStore();
  const isCreatingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const createOrderAsync = useCallback(async () => {
    logger.info(`[${paymentMethod}] ===== createOrderAsync CALLED =====`);
    
    if (!selectedProgram) {
      logger.warn(`[${paymentMethod}] Cannot create order: missing program`);
      return;
    }

    // CRITICAL: Check if payment is already successful or processing
    // This prevents re-creating order after successful payment
    const currentPaymentState = useStore.getState().paymentState;
    const currentOrder = useStore.getState().order;
    
    logger.info(`[${paymentMethod}] Current payment state: ${currentPaymentState}`);
    logger.info(`[${paymentMethod}] Current order ID: ${currentOrder?.id}`);
    logger.info(`[${paymentMethod}] Time until robot start: ${useStore.getState().timeUntilRobotStart}`);
    
    // Don't create order if payment is already successful or in progress
    if (currentPaymentState === PaymentState.PAYMENT_SUCCESS) {
      logger.warn(`[${paymentMethod}] ===== BLOCKED: PAYMENT ALREADY SUCCESSFUL =====`);
      logger.warn(`[${paymentMethod}] Payment state: ${currentPaymentState}`);
      logger.warn(`[${paymentMethod}] Time until robot start: ${useStore.getState().timeUntilRobotStart}`);
      logger.warn(`[${paymentMethod}] NOT creating order to preserve timer and state`);
      return;
    }
    
    // Don't create order if there's already an active order
    if (currentOrder?.id && 
        currentPaymentState !== PaymentState.IDLE && 
        currentPaymentState !== PaymentState.PAYMENT_ERROR) {
      logger.warn(`[${paymentMethod}] ===== BLOCKED: ORDER ALREADY EXISTS =====`);
      logger.warn(`[${paymentMethod}] Order ID: ${currentOrder.id}`);
      logger.warn(`[${paymentMethod}] Payment state: ${currentPaymentState}`);
      logger.warn(`[${paymentMethod}] NOT creating duplicate order`);
      return;
    }
    
    // Don't create order if payment is processing
    if (currentPaymentState === PaymentState.PROCESSING_PAYMENT ||
        currentPaymentState === PaymentState.WAITING_PAYMENT ||
        currentPaymentState === PaymentState.CREATING_ORDER) {
      logger.warn(`[${paymentMethod}] ===== BLOCKED: PAYMENT IN PROGRESS =====`);
      logger.warn(`[${paymentMethod}] Payment state: ${currentPaymentState}`);
      logger.warn(`[${paymentMethod}] NOT creating order - payment already in progress`);
      return;
    }

    if (isCreatingRef.current) {
      logger.warn(`[${paymentMethod}] Order creation already in progress`);
      return;
    }

    // CRITICAL: Double-check state again before proceeding
    // State might have changed between the first check and here
    const stateBeforeCreation = useStore.getState().paymentState;
    if (stateBeforeCreation === PaymentState.PAYMENT_SUCCESS) {
      logger.warn(`[${paymentMethod}] ===== BLOCKED: PAYMENT ALREADY SUCCESSFUL (double check) =====`);
      logger.warn(`[${paymentMethod}] Payment state: ${stateBeforeCreation}`);
      logger.warn(`[${paymentMethod}] Time until robot start: ${useStore.getState().timeUntilRobotStart}`);
      logger.warn(`[${paymentMethod}] NOT proceeding with order creation`);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    isCreatingRef.current = true;
    abortControllerRef.current = new AbortController();
    const abortSignal = abortControllerRef.current.signal;

    setPaymentError(null);
    
    // Only set CREATING_ORDER if we're not already in a success state
    if (useStore.getState().paymentState !== PaymentState.PAYMENT_SUCCESS) {
      setPaymentState(PaymentState.CREATING_ORDER);
    } else {
      logger.warn(`[${paymentMethod}] ===== BLOCKED: Not setting CREATING_ORDER (payment already successful) =====`);
      isCreatingRef.current = false;
      return;
    }

    try {
      logger.info(`[${paymentMethod}] ===== CREATING ORDER =====`);
      logger.info(`[${paymentMethod}] Program ID: ${selectedProgram.id}`);
      logger.info(`[${paymentMethod}] Payment method: ${paymentMethod}`);
      logger.info(`[${paymentMethod}] Payment state BEFORE: ${useStore.getState().paymentState}`);
      logger.info(`[${paymentMethod}] Time until robot start BEFORE: ${useStore.getState().timeUntilRobotStart}`);
      
      await createOrder({
        program_id: selectedProgram.id,
        payment_type: paymentMethod,
      }, abortSignal);

      if (abortSignal.aborted) {
        logger.info(`[${paymentMethod}] ===== ORDER CREATION ABORTED =====`);
        logger.info(`[${paymentMethod}] Payment state: ${useStore.getState().paymentState}`);
        logger.info(`[${paymentMethod}] Time until robot start: ${useStore.getState().timeUntilRobotStart}`);
        return;
      }

      logger.info(`[${paymentMethod}] ===== ORDER CREATION API SUCCESS =====`);
      logger.info(`[${paymentMethod}] Payment state BEFORE WAITING_PAYMENT: ${useStore.getState().paymentState}`);
      logger.info(`[${paymentMethod}] Time until robot start BEFORE WAITING_PAYMENT: ${useStore.getState().timeUntilRobotStart}`);
      
      setPaymentState(PaymentState.WAITING_PAYMENT);
      
      logger.info(`[${paymentMethod}] Payment state AFTER WAITING_PAYMENT: ${useStore.getState().paymentState}`);
      logger.info(`[${paymentMethod}] Time until robot start AFTER WAITING_PAYMENT: ${useStore.getState().timeUntilRobotStart}`);
      logger.info(`[${paymentMethod}] Waiting for order ID from WebSocket`);
    } catch (err: unknown) {
      logger.error(`[${paymentMethod}] ===== ORDER CREATION ERROR =====`);
      logger.error(`[${paymentMethod}] Error:`, err);
      
      // CRITICAL: Check state BEFORE any changes
      // This prevents resetting the timer when API fails after successful payment
      const currentStateBeforeError = useStore.getState().paymentState;
      const timeUntilRobotStartBeforeError = useStore.getState().timeUntilRobotStart;
      
      logger.error(`[${paymentMethod}] Payment state BEFORE error handling: ${currentStateBeforeError}`);
      logger.error(`[${paymentMethod}] Time until robot start BEFORE error handling: ${timeUntilRobotStartBeforeError}`);
      
      // CRITICAL: Don't change state to ERROR if payment is already successful
      // This prevents resetting the timer when API fails after successful payment
      if (currentStateBeforeError === PaymentState.PAYMENT_SUCCESS) {
        logger.error(`[${paymentMethod}] ===== ERROR IGNORED: PAYMENT ALREADY SUCCESSFUL =====`);
        logger.error(`[${paymentMethod}] Payment state: ${currentStateBeforeError}`);
        logger.error(`[${paymentMethod}] Time until robot start: ${timeUntilRobotStartBeforeError}`);
        logger.error(`[${paymentMethod}] NOT changing state to preserve timer`);
        isCreatingRef.current = false;
        return;
      }
      
      const error = err as { name?: string; response?: { data?: { error?: string } }; message?: string };
      if (error?.name === 'AbortError' || abortSignal.aborted) {
        logger.info(`[${paymentMethod}] Order creation aborted (AbortError)`);
        logger.info(`[${paymentMethod}] Payment state: ${useStore.getState().paymentState}`);
        logger.info(`[${paymentMethod}] Time until robot start: ${useStore.getState().timeUntilRobotStart}`);
        return;
      }

      logger.error(`[${paymentMethod}] Error details:`, {
        name: error?.name,
        message: error?.message,
        response: error?.response
      });
      
      // Only set error state if payment is not already successful
      setIsLoading(false);
      setPaymentState(PaymentState.PAYMENT_ERROR);
      
      logger.error(`[${paymentMethod}] Payment state AFTER PAYMENT_ERROR: ${useStore.getState().paymentState}`);
      logger.error(`[${paymentMethod}] Time until robot start AFTER PAYMENT_ERROR: ${useStore.getState().timeUntilRobotStart}`);
      
      let errorMessage = 'Произошла ошибка при создании заказа';
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setPaymentError(errorMessage);
      isCreatingRef.current = false;
      
      logger.error(`[${paymentMethod}] ===== ERROR HANDLED =====`);
    }
  }, [selectedProgram, paymentMethod, setIsLoading, setOrder, setPaymentState, setPaymentError]);

  const cancelOrderCreation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    isCreatingRef.current = false;
  }, []);

  return {
    createOrder: createOrderAsync,
    cancelOrderCreation,
    isCreating: isCreatingRef.current,
  };
}




