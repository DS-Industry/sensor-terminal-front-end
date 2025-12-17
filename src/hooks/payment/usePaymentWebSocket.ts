import { useEffect, useCallback, useRef } from 'react';
import { getOrderById, cancelOrder } from '../../api/services/payment';
import { EOrderStatus, EPaymentMethod } from '../../components/state/order/orderSlice';
import { PaymentState } from '../../state/paymentStateMachine';
import { PAYMENT_CONSTANTS } from '../../constants/payment';
import { logger } from '../../util/logger';
import useStore from '../../components/state/store';
import { globalWebSocketManager, type WebSocketMessage } from '../../util/websocketManager';
import { IProgram } from '../../api/types/program';

interface UsePaymentWebSocketOptions {
  orderId: string | undefined;
  selectedProgram: IProgram | null;
  paymentMethod: EPaymentMethod;
}

export function usePaymentWebSocket({ orderId, selectedProgram, paymentMethod }: UsePaymentWebSocketOptions) {
  const {
    order,
    setOrder,
    setQueuePosition,
    setQueueNumber,
    setPaymentState,
    setPaymentError,
    setIsLoading,
    setBankCheck,
    setInsertedAmount,
  } = useStore();

  const depositTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const hasFetchedPayedDetailsRef = useRef(false);
  const checkAmountIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastAmountSumRef = useRef<number>(0);
  const qrCodePollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const qrCodePollAttemptsRef = useRef<number>(0);

  const fetchOrderDetailsOnPayed = useCallback(async (orderId: string) => {
    if (hasFetchedPayedDetailsRef.current) {
      logger.debug(`[${paymentMethod}] Already fetched order details for PAYED status`);
      return;
    }

    try {
      logger.info(`[${paymentMethod}] Fetching order details after PAYED status received`);
      const orderDetails = await getOrderById(orderId);

      if (!isMountedRef.current) return;

      hasFetchedPayedDetailsRef.current = true;

      if (orderDetails.queue_position !== undefined) {
        const newQueuePosition = orderDetails.queue_position;
        setQueuePosition(newQueuePosition);
        logger.debug(`[${paymentMethod}] Queue position: ${newQueuePosition}`);

        if (newQueuePosition > PAYMENT_CONSTANTS.MAX_QUEUE_POSITION) {
          logger.info(`[${paymentMethod}] Queue is full, queuePosition: ${newQueuePosition}`);
          setPaymentState(PaymentState.QUEUE_FULL);
          setPaymentError('Очередь заполнена. В очереди уже находится один автомобиль. Пожалуйста, подождите окончания мойки.');
          
          try {
            await cancelOrder(orderId);
            logger.info(`[${paymentMethod}] Cancelled order due to full queue`);
          } catch (cancelErr) {
            logger.error(`[${paymentMethod}] Error cancelling order`, cancelErr);
          }
          return;
        }
      }

      if (orderDetails.queue_number !== undefined) {
        setQueueNumber(orderDetails.queue_number);
      }

      if (orderDetails.qr_code) {
        logger.debug(`[${paymentMethod}] QR code received in initial fetch: ${orderDetails.qr_code}`);
        setBankCheck(orderDetails.qr_code);
        if (qrCodePollIntervalRef.current) {
          clearInterval(qrCodePollIntervalRef.current);
          qrCodePollIntervalRef.current = null;
          qrCodePollAttemptsRef.current = 0;
        }
      } else {
        logger.debug(`[${paymentMethod}] QR code not available in initial fetch, starting polling`);
        qrCodePollAttemptsRef.current = 0;
        const MAX_QR_POLL_ATTEMPTS = 10; 
        const QR_POLL_INTERVAL = 1000; 

        if (qrCodePollIntervalRef.current) {
          clearInterval(qrCodePollIntervalRef.current);
        }

        qrCodePollIntervalRef.current = setInterval(async () => {
          if (!isMountedRef.current || !orderId) {
            if (qrCodePollIntervalRef.current) {
              clearInterval(qrCodePollIntervalRef.current);
              qrCodePollIntervalRef.current = null;
            }
            return;
          }

          qrCodePollAttemptsRef.current++;

          try {
            const pollOrderDetails = await getOrderById(orderId);
            
            if (pollOrderDetails.qr_code && isMountedRef.current) {
              logger.debug(`[${paymentMethod}] QR code received via polling (attempt ${qrCodePollAttemptsRef.current}): ${pollOrderDetails.qr_code}`);
              setBankCheck(pollOrderDetails.qr_code);
              
              if (qrCodePollIntervalRef.current) {
                clearInterval(qrCodePollIntervalRef.current);
                qrCodePollIntervalRef.current = null;
                qrCodePollAttemptsRef.current = 0;
              }
            } else if (qrCodePollAttemptsRef.current >= MAX_QR_POLL_ATTEMPTS) {
              logger.warn(`[${paymentMethod}] QR code polling stopped after ${MAX_QR_POLL_ATTEMPTS} attempts`);
              if (qrCodePollIntervalRef.current) {
                clearInterval(qrCodePollIntervalRef.current);
                qrCodePollIntervalRef.current = null;
                qrCodePollAttemptsRef.current = 0;
              }
            }
          } catch (err) {
            logger.error(`[${paymentMethod}] Error polling for QR code (attempt ${qrCodePollAttemptsRef.current})`, err);
            
            if (qrCodePollAttemptsRef.current >= MAX_QR_POLL_ATTEMPTS) {
              if (qrCodePollIntervalRef.current) {
                clearInterval(qrCodePollIntervalRef.current);
                qrCodePollIntervalRef.current = null;
                qrCodePollAttemptsRef.current = 0;
              }
            }
          }
        }, QR_POLL_INTERVAL);
      }

      const amountSum = orderDetails.amount_sum ? Number(orderDetails.amount_sum) : 0;
      const expectedAmount = selectedProgram ? Number(selectedProgram.price) : 0;

      logger.debug(`[${paymentMethod}] Payment verification - amountSum: ${amountSum}, expected: ${expectedAmount}`);

      // Update insertedAmount for CASH payments
      if (paymentMethod === EPaymentMethod.CASH) {
        setInsertedAmount(amountSum);
      }

      if (amountSum >= expectedAmount || amountSum === 0) {
        logger.info(`[${paymentMethod}] Payment confirmed! Amount: ${amountSum} (expected: ${expectedAmount})`);
        setPaymentError(null);
        setPaymentState(PaymentState.PAYMENT_SUCCESS);
        setIsLoading(false);
      } else if (amountSum > 0 && amountSum < expectedAmount) {
        logger.warn(`[${paymentMethod}] Partial payment detected: ${amountSum} < ${expectedAmount}`);
        setPaymentState(PaymentState.PROCESSING_PAYMENT);
        setIsLoading(true);
      }
    } catch (err) {
      logger.error(`[${paymentMethod}] Error fetching order details on PAYED`, err);
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [paymentMethod, selectedProgram, setQueuePosition, setQueueNumber, setPaymentState, setPaymentError, setIsLoading, setBankCheck, setInsertedAmount]);

  useEffect(() => {
    if (!orderId) return;

    isMountedRef.current = true;
    hasFetchedPayedDetailsRef.current = false;

    const handleStatusUpdate = async (data: WebSocketMessage) => {
      if (data.type !== 'status_update' || !data.order_id || data.order_id !== orderId) {
        return;
      }

      const orderStatus = data.status as EOrderStatus | undefined;
      if (!orderStatus) return;

      logger.debug(`[${paymentMethod}] WebSocket status update: ${orderStatus} for order ${orderId}`);

      const currentOrder = useStore.getState().order;
      if (currentOrder?.id === orderId) {
        setOrder({
          ...currentOrder,
          status: orderStatus,
          transactionId: data.transaction_id,
        });
      }

      if (orderStatus === EOrderStatus.PAYED) {
        await fetchOrderDetailsOnPayed(orderId);
      } else if (orderStatus === EOrderStatus.COMPLETED) {
        if (depositTimeoutRef.current) {
          clearTimeout(depositTimeoutRef.current);
          depositTimeoutRef.current = null;
        }
        setIsLoading(false);
      } else if (orderStatus === EOrderStatus.PROCESSING) {
        if (depositTimeoutRef.current) {
          clearTimeout(depositTimeoutRef.current);
          depositTimeoutRef.current = null;
        }
        setIsLoading(false);
      } else if (orderStatus === EOrderStatus.WAITING_PAYMENT) {
        if (checkAmountIntervalRef.current) {
          clearInterval(checkAmountIntervalRef.current);
        }
        
        // For CASH payments, ensure loading is false when starting to wait for payment
        if (paymentMethod === EPaymentMethod.CASH) {
          setIsLoading(false);
        }
        
        checkAmountIntervalRef.current = setInterval(async () => {
          if (!orderId || !isMountedRef.current) return;
          
          try {
            const orderDetails = await getOrderById(orderId);
            const amountSum = orderDetails.amount_sum ? Number(orderDetails.amount_sum) : 0;
            const expectedAmount = selectedProgram ? Number(selectedProgram.price) : 0;
            
            // For CASH payment method, update insertedAmount continuously
            if (paymentMethod === EPaymentMethod.CASH) {
              logger.debug(`[${paymentMethod}] Cash payment - updating insertedAmount: ${amountSum}`);
              setInsertedAmount(amountSum);
              
              // Check if payment is complete
              if (amountSum >= expectedAmount && expectedAmount > 0) {
                logger.info(`[${paymentMethod}] Cash payment complete! Amount: ${amountSum} >= ${expectedAmount}`);
                setPaymentState(PaymentState.PAYMENT_SUCCESS);
                setIsLoading(false);
                
                // Stop polling when payment is complete
                if (checkAmountIntervalRef.current) {
                  clearInterval(checkAmountIntervalRef.current);
                  checkAmountIntervalRef.current = null;
                }
              } else if (amountSum > 0 && amountSum < expectedAmount) {
                logger.debug(`[${paymentMethod}] Partial cash payment: ${amountSum} < ${expectedAmount}`);
                setPaymentState(PaymentState.PROCESSING_PAYMENT);
                setIsLoading(false); // Don't show spinner for partial cash payments
              } else {
                // No money inserted yet, keep loading false
                setIsLoading(false);
              }
            } else {
              // For CARD payment method, detect card insertion
              if (amountSum > lastAmountSumRef.current && amountSum > 0) {
                logger.info(`[${paymentMethod}] Card detected! Amount: ${amountSum}, setting processing state`);
                setPaymentState(PaymentState.PROCESSING_PAYMENT);
                setIsLoading(true);
                
                if (checkAmountIntervalRef.current) {
                  clearInterval(checkAmountIntervalRef.current);
                  checkAmountIntervalRef.current = null;
                }
              }
            }
            
            lastAmountSumRef.current = amountSum;
          } catch (err) {
            logger.error(`[${paymentMethod}] Error checking amount`, err);
          }
        }, 1500);
        
        if (depositTimeoutRef.current) {
          clearTimeout(depositTimeoutRef.current);
        }

        depositTimeoutRef.current = setTimeout(async () => {
          logger.info(`[${paymentMethod}] Payment timeout reached, cancelling order`);
          if (checkAmountIntervalRef.current) {
            clearInterval(checkAmountIntervalRef.current);
            checkAmountIntervalRef.current = null;
          }
          try {
            if (orderId && isMountedRef.current) {
              await cancelOrder(orderId);
            }
          } catch (e) {
            logger.error(`[${paymentMethod}] Error cancelling order on timeout`, e);
          }
        }, PAYMENT_CONSTANTS.DEPOSIT_TIME);
      }
    };

    const removeListener = globalWebSocketManager.addListener('status_update', handleStatusUpdate);

    // Start polling if order is already in WAITING_PAYMENT status
    if (order?.status === EOrderStatus.WAITING_PAYMENT && orderId) {
      // Start amount polling for CASH payments
      if (paymentMethod === EPaymentMethod.CASH && !checkAmountIntervalRef.current) {
        // Ensure loading is false when starting polling for cash
        setIsLoading(false);
        
        checkAmountIntervalRef.current = setInterval(async () => {
          if (!orderId || !isMountedRef.current) return;
          
          try {
            const orderDetails = await getOrderById(orderId);
            const amountSum = orderDetails.amount_sum ? Number(orderDetails.amount_sum) : 0;
            const expectedAmount = selectedProgram ? Number(selectedProgram.price) : 0;
            
            logger.debug(`[${paymentMethod}] Cash payment - updating insertedAmount: ${amountSum}`);
            setInsertedAmount(amountSum);
            
            // Check if payment is complete
            if (amountSum >= expectedAmount && expectedAmount > 0) {
              logger.info(`[${paymentMethod}] Cash payment complete! Amount: ${amountSum} >= ${expectedAmount}`);
              setPaymentState(PaymentState.PAYMENT_SUCCESS);
              setIsLoading(false);
              
              // Stop polling when payment is complete
              if (checkAmountIntervalRef.current) {
                clearInterval(checkAmountIntervalRef.current);
                checkAmountIntervalRef.current = null;
              }
            } else if (amountSum > 0 && amountSum < expectedAmount) {
              logger.debug(`[${paymentMethod}] Partial cash payment: ${amountSum} < ${expectedAmount}`);
              setPaymentState(PaymentState.PROCESSING_PAYMENT);
              setIsLoading(false); // Don't show spinner for partial cash payments
            } else {
              // No money inserted yet, keep loading false
              setIsLoading(false);
            }
            
            lastAmountSumRef.current = amountSum;
          } catch (err) {
            logger.error(`[${paymentMethod}] Error checking amount`, err);
          }
        }, 1000);
      }
      
      depositTimeoutRef.current = setTimeout(async () => {
        logger.info(`[${paymentMethod}] Payment timeout reached, cancelling order`);
        try {
          if (orderId && isMountedRef.current) {
            await cancelOrder(orderId);
          }
        } catch (e) {
          logger.error(`[${paymentMethod}] Error cancelling order on timeout`, e);
        }
      }, PAYMENT_CONSTANTS.DEPOSIT_TIME);
    }

    return () => {
      isMountedRef.current = false;
      removeListener();
      if (depositTimeoutRef.current) {
        clearTimeout(depositTimeoutRef.current);
        depositTimeoutRef.current = null;
      }
      if (checkAmountIntervalRef.current) {
        clearInterval(checkAmountIntervalRef.current);
        checkAmountIntervalRef.current = null;
      }
      if (qrCodePollIntervalRef.current) {
        clearInterval(qrCodePollIntervalRef.current);
        qrCodePollIntervalRef.current = null;
        qrCodePollAttemptsRef.current = 0;
      }
      lastAmountSumRef.current = 0;
    };
  }, [orderId, order?.status, paymentMethod, fetchOrderDetailsOnPayed, setOrder, setIsLoading]);

  return {};
}

