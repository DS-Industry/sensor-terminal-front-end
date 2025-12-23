import { useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../../api/services/payment';
import { EPaymentMethod } from '../../components/state/order/orderSlice';
import { PaymentState } from '../../state/paymentStateMachine';
import { logger } from '../../util/logger';
import useStore from '../../components/state/store';
import { IProgram } from '../../api/types/program';
import { navigateToError } from '../../utils/navigation';

interface UseOrderCreationOptions {
  selectedProgram: IProgram | null;
  paymentMethod: EPaymentMethod;
}

export function useOrderCreation({ selectedProgram, paymentMethod }: UseOrderCreationOptions) {
  const navigate = useNavigate();
  const { setIsLoading, setOrder, setPaymentState, setPaymentError, order } = useStore();
  const isCreatingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const createOrderAsync = useCallback(async () => {
    if (!selectedProgram) {
      logger.warn(`[${paymentMethod}] Cannot create order: missing program`);
      return;
    }

    if (isCreatingRef.current) {
      logger.warn(`[${paymentMethod}] Order creation already in progress`);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    isCreatingRef.current = true;
    abortControllerRef.current = new AbortController();
    const abortSignal = abortControllerRef.current.signal;

    setPaymentError(null);
    setPaymentState(PaymentState.CREATING_ORDER);

    try {
      logger.debug(`[${paymentMethod}] Creating order for program: ${selectedProgram.id}`);
      
      await createOrder({
        program_id: selectedProgram.id,
        payment_type: paymentMethod,
      }, abortSignal);

      if (abortSignal.aborted) {
        logger.info(`[${paymentMethod}] Order creation aborted`);
        isCreatingRef.current = false;
        return;
      }

      // logger.info(`[${paymentMethod}] Order creation API called successfully, waiting for order ID from WebSocket`);
      // setPaymentState(PaymentState.WAITING_PAYMENT);
      // Reset flag after successful API call - order ID will come via WebSocket
      isCreatingRef.current = false;
    } catch (err: unknown) {
      const error = err as { name?: string };
      if (error?.name === 'AbortError' || abortSignal.aborted) {
        logger.info(`[${paymentMethod}] Order creation aborted`);
        isCreatingRef.current = false;
        return;
      }

      logger.error(`[${paymentMethod}] Error creating order`, err);
      
      if (!isMountedRef.current) {
        isCreatingRef.current = false;
        return;
      }
      
      setIsLoading(false);
      setPaymentState(PaymentState.PAYMENT_ERROR);
      
      let errorMessage = 'Произошла ошибка при создании заказа';
      const axiosError = err as { response?: { data?: { error?: string } }; message?: string };
      if (axiosError?.response?.data?.error) {
        errorMessage = axiosError.response.data.error;
      } else if (axiosError?.message) {
        errorMessage = axiosError.message;
      }
      
      setPaymentError(errorMessage);
      isCreatingRef.current = false;
      
      // Navigate to error page
      navigateToError(navigate);
    }
  }, [selectedProgram, paymentMethod, setIsLoading, setOrder, setPaymentState, setPaymentError]);

  const cancelOrderCreation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    isCreatingRef.current = false;
  }, []);

  // Reset isCreatingRef when order ID is received via WebSocket
  useEffect(() => {
    if (order?.id && isCreatingRef.current) {
      logger.debug(`[${paymentMethod}] Order ID received via WebSocket: ${order.id}, resetting creation flag`);
      isCreatingRef.current = false;
    }
  }, [order?.id, paymentMethod]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    createOrder: createOrderAsync,
    cancelOrderCreation,
    isCreating: isCreatingRef.current,
  };
}

