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
        return;
      }

      logger.info(`[${paymentMethod}] Order creation API called successfully, waiting for order ID from WebSocket`);
      setPaymentState(PaymentState.WAITING_PAYMENT);
    } catch (err: unknown) {
      const error = err as { name?: string };
      if (error?.name === 'AbortError' || abortSignal.aborted) {
        logger.info(`[${paymentMethod}] Order creation aborted`);
        return;
      }

      logger.error(`[${paymentMethod}] Error creating order`, err);
      
      setIsLoading(false);
      setPaymentState(PaymentState.PAYMENT_ERROR);
      
      let errorMessage = 'Произошла ошибка при создании заказа';
      if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setPaymentError(errorMessage);
      isCreatingRef.current = false;
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

