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
  } = useStore();

  const depositTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const hasFetchedPayedDetailsRef = useRef(false);
  const checkAmountIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastAmountSumRef = useRef<number>(0);
  const qrCodePollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const qrCodePollAttemptsRef = useRef<number>(0);

  const fetchOrderDetailsOnPayed = useCallback(async (orderId: string) => {
    logger.debug(`[${paymentMethod}] ===== fetchOrderDetailsOnPayed CALLED =====`);
    logger.debug(`[${paymentMethod}] hasFetchedPayedDetailsRef.current: ${hasFetchedPayedDetailsRef.current}`);
    logger.debug(`[${paymentMethod}] isMountedRef.current: ${isMountedRef.current}`);
    
    if (hasFetchedPayedDetailsRef.current) {
      logger.debug(`[${paymentMethod}] Already fetched order details for PAYED status - EXITING`);
      return;
    }

    // Check if payment is already successful - if so, don't refresh state, just update queue info
    const currentPaymentState = useStore.getState().paymentState;
    const isAlreadySuccessful = currentPaymentState === PaymentState.PAYMENT_SUCCESS;
    const timeUntilRobotStart = useStore.getState().timeUntilRobotStart;
    
    logger.debug(`[${paymentMethod}] Current payment state: ${currentPaymentState}`);
    logger.debug(`[${paymentMethod}] Is already successful: ${isAlreadySuccessful}`);
    logger.debug(`[${paymentMethod}] Time until robot start: ${timeUntilRobotStart}`);

    try {
      logger.info(`[${paymentMethod}] Fetching order details after PAYED status received (already successful: ${isAlreadySuccessful})`);
      const orderDetails = await getOrderById(orderId);
      
      logger.debug(`[${paymentMethod}] Order details fetched:`, {
        orderId: orderDetails.id,
        status: orderDetails.status,
        amount_sum: orderDetails.amount_sum,
        queue_position: orderDetails.queue_position,
        queue_number: orderDetails.queue_number,
        qr_code: orderDetails.qr_code ? 'present' : 'missing'
      });

      if (!isMountedRef.current) {
        logger.warn(`[${paymentMethod}] Component unmounted during fetch, EXITING`);
        return;
      }

      hasFetchedPayedDetailsRef.current = true;
      logger.debug(`[${paymentMethod}] Set hasFetchedPayedDetailsRef.current = true`);

      if (orderDetails.queue_position !== undefined) {
        const newQueuePosition = orderDetails.queue_position;
        logger.debug(`[${paymentMethod}] Setting queue position: ${newQueuePosition}`);
        setQueuePosition(newQueuePosition);
        logger.debug(`[${paymentMethod}] Queue position set: ${newQueuePosition}`);

        if (newQueuePosition > PAYMENT_CONSTANTS.MAX_QUEUE_POSITION) {
          logger.warn(`[${paymentMethod}] ===== QUEUE FULL DETECTED =====`);
          logger.warn(`[${paymentMethod}] Queue position: ${newQueuePosition}, MAX: ${PAYMENT_CONSTANTS.MAX_QUEUE_POSITION}`);
          logger.warn(`[${paymentMethod}] Current payment state before QUEUE_FULL: ${useStore.getState().paymentState}`);
          logger.warn(`[${paymentMethod}] Time until robot start before QUEUE_FULL: ${useStore.getState().timeUntilRobotStart}`);
          
          setPaymentState(PaymentState.QUEUE_FULL);
          
          logger.warn(`[${paymentMethod}] Payment state changed to QUEUE_FULL: ${useStore.getState().paymentState}`);
          logger.warn(`[${paymentMethod}] Time until robot start after QUEUE_FULL: ${useStore.getState().timeUntilRobotStart}`);
          
          setPaymentError('Очередь заполнена. В очереди уже находится один автомобиль. Пожалуйста, подождите окончания мойки.');
          
          try {
            await cancelOrder(orderId);
            logger.info(`[${paymentMethod}] Cancelled order due to full queue`);
          } catch (cancelErr) {
            logger.error(`[${paymentMethod}] Error cancelling order`, cancelErr);
          }
          logger.debug(`[${paymentMethod}] ===== EXITING fetchOrderDetailsOnPayed due to QUEUE_FULL =====`);
          return;
        }
      }

      if (orderDetails.queue_number !== undefined) {
        logger.debug(`[${paymentMethod}] Setting queue number: ${orderDetails.queue_number}`);
        setQueueNumber(orderDetails.queue_number);
      }

      if (orderDetails.qr_code) {
        logger.debug(`[${paymentMethod}] QR code received in initial fetch: ${orderDetails.qr_code}`);
        setBankCheck(orderDetails.qr_code);
        if (qrCodePollIntervalRef.current) {
          logger.debug(`[${paymentMethod}] Clearing QR code polling interval (QR code found)`);
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
          logger.debug(`[${paymentMethod}] Clearing existing QR code polling interval`);
          clearInterval(qrCodePollIntervalRef.current);
        }

        logger.debug(`[${paymentMethod}] Starting QR code polling interval`);
        qrCodePollIntervalRef.current = setInterval(async () => {
          if (!isMountedRef.current || !orderId) {
            logger.debug(`[${paymentMethod}] QR polling: component unmounted or no orderId, cleaning up`);
            if (qrCodePollIntervalRef.current) {
              clearInterval(qrCodePollIntervalRef.current);
              qrCodePollIntervalRef.current = null;
            }
            return;
          }

          qrCodePollAttemptsRef.current++;
          logger.debug(`[${paymentMethod}] QR polling attempt ${qrCodePollAttemptsRef.current}/${MAX_QR_POLL_ATTEMPTS}`);

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

      logger.debug(`[${paymentMethod}] ===== PAYMENT VERIFICATION =====`);
      logger.debug(`[${paymentMethod}] amountSum: ${amountSum}, expectedAmount: ${expectedAmount}`);
      logger.debug(`[${paymentMethod}] Current payment state: ${useStore.getState().paymentState}`);
      logger.debug(`[${paymentMethod}] Time until robot start: ${useStore.getState().timeUntilRobotStart}`);
      logger.debug(`[${paymentMethod}] isAlreadySuccessful: ${isAlreadySuccessful}`);

      // If payment is already successful, don't change state - let the countdown timer continue
      if (isAlreadySuccessful) {
        logger.info(`[${paymentMethod}] ===== PAYMENT ALREADY SUCCESSFUL - PRESERVING TIMER =====`);
        logger.info(`[${paymentMethod}] Current state: ${useStore.getState().paymentState}`);
        logger.info(`[${paymentMethod}] Time until robot start: ${useStore.getState().timeUntilRobotStart}`);
        logger.info(`[${paymentMethod}] NOT changing state - timer will continue`);
        logger.debug(`[${paymentMethod}] ===== EXITING fetchOrderDetailsOnPayed (already successful) =====`);
        return;
      }

      // Double-check state hasn't changed while fetching (race condition guard)
      const currentStateAfterFetch = useStore.getState().paymentState;
      const timeUntilRobotStartAfterFetch = useStore.getState().timeUntilRobotStart;
      logger.debug(`[${paymentMethod}] State after fetch: ${currentStateAfterFetch}`);
      logger.debug(`[${paymentMethod}] Time until robot start after fetch: ${timeUntilRobotStartAfterFetch}`);
      
      if (currentStateAfterFetch === PaymentState.PAYMENT_SUCCESS || 
          currentStateAfterFetch === PaymentState.PROCESSING_PAYMENT) {
        logger.warn(`[${paymentMethod}] ===== STATE ALREADY CHANGED DURING FETCH =====`);
        logger.warn(`[${paymentMethod}] State is now: ${currentStateAfterFetch}`);
        logger.warn(`[${paymentMethod}] Time until robot start: ${timeUntilRobotStartAfterFetch}`);
        logger.warn(`[${paymentMethod}] Skipping WebSocket transition to preserve state`);
        logger.debug(`[${paymentMethod}] ===== EXITING fetchOrderDetailsOnPayed (state changed) =====`);
        return;
      }

      logger.debug(`[${paymentMethod}] ===== DECIDING PAYMENT STATE =====`);
      if (amountSum >= expectedAmount || amountSum === 0) {
        logger.info(`[${paymentMethod}] ===== SETTING PAYMENT_SUCCESS =====`);
        logger.info(`[${paymentMethod}] Amount confirmed: ${amountSum} (expected: ${expectedAmount})`);
        logger.info(`[${paymentMethod}] Payment state BEFORE: ${useStore.getState().paymentState}`);
        logger.info(`[${paymentMethod}] Time until robot start BEFORE: ${useStore.getState().timeUntilRobotStart}`);
        
        setPaymentError(null);
        setPaymentState(PaymentState.PAYMENT_SUCCESS);
        setIsLoading(false);
        
        logger.info(`[${paymentMethod}] Payment state AFTER: ${useStore.getState().paymentState}`);
        logger.info(`[${paymentMethod}] Time until robot start AFTER: ${useStore.getState().timeUntilRobotStart}`);
        logger.info(`[${paymentMethod}] ===== PAYMENT_SUCCESS SET COMPLETE =====`);
      } else if (amountSum > 0 && amountSum < expectedAmount) {
        logger.warn(`[${paymentMethod}] ===== SETTING PROCESSING_PAYMENT =====`);
        logger.warn(`[${paymentMethod}] Partial payment detected: ${amountSum} < ${expectedAmount}`);
        logger.warn(`[${paymentMethod}] Payment state BEFORE: ${useStore.getState().paymentState}`);
        logger.warn(`[${paymentMethod}] Time until robot start BEFORE: ${useStore.getState().timeUntilRobotStart}`);
        
        setPaymentState(PaymentState.PROCESSING_PAYMENT);
        setIsLoading(true);
        
        logger.warn(`[${paymentMethod}] Payment state AFTER: ${useStore.getState().paymentState}`);
        logger.warn(`[${paymentMethod}] Time until robot start AFTER: ${useStore.getState().timeUntilRobotStart}`);
        logger.warn(`[${paymentMethod}] ===== PROCESSING_PAYMENT SET COMPLETE =====`);
      } else {
        logger.debug(`[${paymentMethod}] No payment state change needed (amountSum: ${amountSum})`);
      }
      
      logger.debug(`[${paymentMethod}] ===== EXITING fetchOrderDetailsOnPayed =====`);
    } catch (err) {
      logger.error(`[${paymentMethod}] ===== ERROR IN fetchOrderDetailsOnPayed =====`);
      logger.error(`[${paymentMethod}] Error fetching order details on PAYED`, err);
      logger.error(`[${paymentMethod}] Current payment state: ${useStore.getState().paymentState}`);
      logger.error(`[${paymentMethod}] Time until robot start: ${useStore.getState().timeUntilRobotStart}`);
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      logger.error(`[${paymentMethod}] ===== ERROR HANDLED =====`);
    }
  }, [paymentMethod, selectedProgram, setQueuePosition, setQueueNumber, setPaymentState, setPaymentError, setIsLoading, setBankCheck]);

  useEffect(() => {
    logger.debug(`[${paymentMethod}] ===== usePaymentWebSocket EFFECT STARTED =====`);
    logger.debug(`[${paymentMethod}] orderId: ${orderId}`);
    logger.debug(`[${paymentMethod}] Current payment state: ${useStore.getState().paymentState}`);
    logger.debug(`[${paymentMethod}] Time until robot start: ${useStore.getState().timeUntilRobotStart}`);
    
    if (!orderId) {
      logger.debug(`[${paymentMethod}] No orderId, EXITING effect`);
      return;
    }

    isMountedRef.current = true;
    hasFetchedPayedDetailsRef.current = false;
    logger.debug(`[${paymentMethod}] Set isMountedRef.current = true`);
    logger.debug(`[${paymentMethod}] Set hasFetchedPayedDetailsRef.current = false`);

    const handleStatusUpdate = async (data: WebSocketMessage) => {
      logger.debug(`[${paymentMethod}] ===== WebSocket handleStatusUpdate CALLED =====`);
      logger.debug(`[${paymentMethod}] WebSocket message:`, {
        type: data.type,
        order_id: data.order_id,
        status: data.status,
        transaction_id: data.transaction_id
      });
      
      if (data.type !== 'status_update' || !data.order_id || data.order_id !== orderId) {
        logger.debug(`[${paymentMethod}] WebSocket message filtered out (type: ${data.type}, order_id: ${data.order_id}, expected: ${orderId})`);
        return;
      }

      const orderStatus = data.status as EOrderStatus | undefined;
      if (!orderStatus) {
        logger.debug(`[${paymentMethod}] No order status in WebSocket message`);
        return;
      }

      logger.info(`[${paymentMethod}] ===== WebSocket STATUS UPDATE RECEIVED =====`);
      logger.info(`[${paymentMethod}] Order status: ${orderStatus} for order ${orderId}`);
      logger.info(`[${paymentMethod}] Current payment state BEFORE: ${useStore.getState().paymentState}`);
      logger.info(`[${paymentMethod}] Time until robot start BEFORE: ${useStore.getState().timeUntilRobotStart}`);

      // Check if payment is already successful - if so, don't update anything to preserve timer
      const currentPaymentState = useStore.getState().paymentState;
      const isAlreadySuccessful = currentPaymentState === PaymentState.PAYMENT_SUCCESS;
      const timeUntilRobotStart = useStore.getState().timeUntilRobotStart;
      
      logger.debug(`[${paymentMethod}] Current payment state: ${currentPaymentState}`);
      logger.debug(`[${paymentMethod}] Is already successful: ${isAlreadySuccessful}`);
      logger.debug(`[${paymentMethod}] Time until robot start: ${timeUntilRobotStart}`);

      // Only update order if payment is not already successful
      // This prevents unnecessary re-renders that might interfere with the countdown timer
      if (!isAlreadySuccessful) {
        logger.debug(`[${paymentMethod}] Payment not successful yet, updating order`);
        const currentOrder = useStore.getState().order;
        if (currentOrder?.id === orderId) {
          logger.debug(`[${paymentMethod}] Updating order status from ${currentOrder.status} to ${orderStatus}`);
          setOrder({
            ...currentOrder,
            status: orderStatus,
            transactionId: data.transaction_id,
          });
          logger.debug(`[${paymentMethod}] Order updated`);
        } else {
          logger.debug(`[${paymentMethod}] Order ID mismatch (current: ${currentOrder?.id}, expected: ${orderId})`);
        }
      } else {
        logger.info(`[${paymentMethod}] ===== PAYMENT ALREADY SUCCESSFUL - SKIPPING ORDER UPDATE =====`);
        logger.info(`[${paymentMethod}] Payment state: ${currentPaymentState}`);
        logger.info(`[${paymentMethod}] Time until robot start: ${timeUntilRobotStart}`);
        logger.info(`[${paymentMethod}] Skipping order update to preserve timer`);
      }

      if (orderStatus === EOrderStatus.PAYED) {
        logger.info(`[${paymentMethod}] ===== PAYED STATUS HANDLER =====`);
        logger.info(`[${paymentMethod}] Current payment state: ${useStore.getState().paymentState}`);
        logger.info(`[${paymentMethod}] Time until robot start: ${useStore.getState().timeUntilRobotStart}`);
        logger.info(`[${paymentMethod}] Is already successful: ${isAlreadySuccessful}`);
        
        // Check if payment is already successful - if so, don't fetch details again
        if (isAlreadySuccessful) {
          logger.info(`[${paymentMethod}] ===== PAYED RECEIVED BUT ALREADY SUCCESSFUL =====`);
          logger.info(`[${paymentMethod}] Payment state: ${useStore.getState().paymentState}`);
          logger.info(`[${paymentMethod}] Time until robot start: ${useStore.getState().timeUntilRobotStart}`);
          logger.info(`[${paymentMethod}] Skipping fetchOrderDetailsOnPayed to preserve timer`);
        } else {
          logger.info(`[${paymentMethod}] Calling fetchOrderDetailsOnPayed for PAYED status`);
          await fetchOrderDetailsOnPayed(orderId);
          logger.info(`[${paymentMethod}] fetchOrderDetailsOnPayed completed`);
          logger.info(`[${paymentMethod}] Payment state AFTER fetchOrderDetailsOnPayed: ${useStore.getState().paymentState}`);
          logger.info(`[${paymentMethod}] Time until robot start AFTER fetchOrderDetailsOnPayed: ${useStore.getState().timeUntilRobotStart}`);
        }
      } else if (orderStatus === EOrderStatus.COMPLETED) {
        logger.info(`[${paymentMethod}] ===== COMPLETED STATUS HANDLER =====`);
        logger.info(`[${paymentMethod}] Current payment state: ${useStore.getState().paymentState}`);
        logger.info(`[${paymentMethod}] Time until robot start: ${useStore.getState().timeUntilRobotStart}`);
        
        if (depositTimeoutRef.current) {
          logger.debug(`[${paymentMethod}] Clearing deposit timeout`);
          clearTimeout(depositTimeoutRef.current);
          depositTimeoutRef.current = null;
        }
        setIsLoading(false);
        logger.debug(`[${paymentMethod}] Set isLoading = false`);
      } else if (orderStatus === EOrderStatus.PROCESSING) {
        logger.info(`[${paymentMethod}] ===== PROCESSING STATUS HANDLER =====`);
        logger.info(`[${paymentMethod}] Payment method: ${paymentMethod}`);
        logger.info(`[${paymentMethod}] Current payment state BEFORE: ${useStore.getState().paymentState}`);
        logger.info(`[${paymentMethod}] Time until robot start BEFORE: ${useStore.getState().timeUntilRobotStart}`);
        
        if (depositTimeoutRef.current) {
          logger.debug(`[${paymentMethod}] Clearing deposit timeout`);
          clearTimeout(depositTimeoutRef.current);
          depositTimeoutRef.current = null;
        }
        
        // For cash payments, transition to PROCESSING_PAYMENT when PROCESSING status is received
        if (paymentMethod === EPaymentMethod.CASH) {
          const currentPaymentState = useStore.getState().paymentState;
          logger.debug(`[${paymentMethod}] Cash payment - checking if should transition to PROCESSING_PAYMENT`);
          logger.debug(`[${paymentMethod}] Current state: ${currentPaymentState}`);
          logger.debug(`[${paymentMethod}] Should transition: ${currentPaymentState !== PaymentState.PROCESSING_PAYMENT && currentPaymentState !== PaymentState.PAYMENT_SUCCESS}`);
          
          if (currentPaymentState !== PaymentState.PROCESSING_PAYMENT && 
              currentPaymentState !== PaymentState.PAYMENT_SUCCESS) {
            logger.warn(`[${paymentMethod}] ===== TRANSITIONING TO PROCESSING_PAYMENT =====`);
            logger.warn(`[${paymentMethod}] Payment state BEFORE: ${currentPaymentState}`);
            logger.warn(`[${paymentMethod}] Time until robot start BEFORE: ${useStore.getState().timeUntilRobotStart}`);
            
            setPaymentState(PaymentState.PROCESSING_PAYMENT);
            setIsLoading(true);
            
            logger.warn(`[${paymentMethod}] Payment state AFTER: ${useStore.getState().paymentState}`);
            logger.warn(`[${paymentMethod}] Time until robot start AFTER: ${useStore.getState().timeUntilRobotStart}`);
            logger.warn(`[${paymentMethod}] ===== PROCESSING_PAYMENT SET COMPLETE =====`);
          } else {
            logger.debug(`[${paymentMethod}] Not transitioning (current state: ${currentPaymentState})`);
          }
        } else {
          logger.debug(`[${paymentMethod}] Non-cash payment, setting isLoading = false`);
          setIsLoading(false);
        }
      } else if (orderStatus === EOrderStatus.WAITING_PAYMENT) {
        logger.info(`[${paymentMethod}] ===== WAITING_PAYMENT STATUS HANDLER =====`);
        logger.info(`[${paymentMethod}] Current payment state: ${useStore.getState().paymentState}`);
        logger.info(`[${paymentMethod}] Time until robot start: ${useStore.getState().timeUntilRobotStart}`);
        if (checkAmountIntervalRef.current) {
          logger.debug(`[${paymentMethod}] Clearing existing checkAmountInterval`);
          clearInterval(checkAmountIntervalRef.current);
        }
        
        logger.debug(`[${paymentMethod}] Starting checkAmountInterval for card detection`);
        checkAmountIntervalRef.current = setInterval(async () => {
          if (!orderId || !isMountedRef.current) {
            logger.debug(`[${paymentMethod}] checkAmountInterval: no orderId or unmounted, skipping`);
            return;
          }
          
          try {
            const orderDetails = await getOrderById(orderId);
            const amountSum = orderDetails.amount_sum ? Number(orderDetails.amount_sum) : 0;
            
            logger.debug(`[${paymentMethod}] checkAmountInterval: amountSum=${amountSum}, lastAmountSum=${lastAmountSumRef.current}`);
            
            if (amountSum > lastAmountSumRef.current && amountSum > 0) {
              logger.info(`[${paymentMethod}] ===== CARD DETECTED IN WAITING_PAYMENT =====`);
              logger.info(`[${paymentMethod}] Amount: ${amountSum}, lastAmount: ${lastAmountSumRef.current}`);
              logger.info(`[${paymentMethod}] Payment state BEFORE: ${useStore.getState().paymentState}`);
              logger.info(`[${paymentMethod}] Time until robot start BEFORE: ${useStore.getState().timeUntilRobotStart}`);
              
              setPaymentState(PaymentState.PROCESSING_PAYMENT);
              setIsLoading(true);
              
              logger.info(`[${paymentMethod}] Payment state AFTER: ${useStore.getState().paymentState}`);
              logger.info(`[${paymentMethod}] Time until robot start AFTER: ${useStore.getState().timeUntilRobotStart}`);
              
              if (checkAmountIntervalRef.current) {
                clearInterval(checkAmountIntervalRef.current);
                checkAmountIntervalRef.current = null;
              }
            }
            
            lastAmountSumRef.current = amountSum;
          } catch (err) {
            logger.error(`[${paymentMethod}] Error checking amount for card detection`, err);
          }
        }, 500);
        
        if (depositTimeoutRef.current) {
          logger.debug(`[${paymentMethod}] Clearing deposit timeout`);
          clearTimeout(depositTimeoutRef.current);
        }

        // depositTimeoutRef.current = setTimeout(async () => {
        //   logger.info(`[${paymentMethod}] Payment timeout reached, cancelling order`);
        //   if (checkAmountIntervalRef.current) {
        //     clearInterval(checkAmountIntervalRef.current);
        //     checkAmountIntervalRef.current = null;
        //   }
        //   try {
        //     if (orderId && isMountedRef.current) {
        //       await cancelOrder(orderId);
        //     }
        //   } catch (e) {
        //     logger.error(`[${paymentMethod}] Error cancelling order on timeout`, e);
        //   }
        // }, PAYMENT_CONSTANTS.DEPOSIT_TIME);
      }
      
      logger.info(`[${paymentMethod}] Payment state AFTER handleStatusUpdate: ${useStore.getState().paymentState}`);
      logger.info(`[${paymentMethod}] Time until robot start AFTER handleStatusUpdate: ${useStore.getState().timeUntilRobotStart}`);
      logger.debug(`[${paymentMethod}] ===== handleStatusUpdate COMPLETED =====`);
    };

    logger.debug(`[${paymentMethod}] Adding WebSocket listener for status_update`);
    const removeListener = globalWebSocketManager.addListener('status_update', handleStatusUpdate);
    logger.debug(`[${paymentMethod}] WebSocket listener added`);

    if (order?.status === EOrderStatus.WAITING_PAYMENT) {
      logger.debug(`[${paymentMethod}] Order status is WAITING_PAYMENT, setting deposit timeout`);
      depositTimeoutRef.current = setTimeout(async () => {
        logger.info(`[${paymentMethod}] ===== DEPOSIT TIMEOUT REACHED =====`);
        logger.info(`[${paymentMethod}] Payment timeout reached, cancelling order`);
        logger.info(`[${paymentMethod}] Current payment state: ${useStore.getState().paymentState}`);
        logger.info(`[${paymentMethod}] Time until robot start: ${useStore.getState().timeUntilRobotStart}`);
        try {
          if (orderId && isMountedRef.current) {
            await cancelOrder(orderId);
          }
        } catch (e) {
          logger.error(`[${paymentMethod}] Error cancelling order on timeout`, e);
        }
      }, PAYMENT_CONSTANTS.DEPOSIT_TIME);
      logger.debug(`[${paymentMethod}] Deposit timeout set for ${PAYMENT_CONSTANTS.DEPOSIT_TIME}ms`);
    }

    logger.debug(`[${paymentMethod}] ===== usePaymentWebSocket EFFECT SETUP COMPLETE =====`);

    return () => {
      logger.debug(`[${paymentMethod}] ===== usePaymentWebSocket CLEANUP STARTED =====`);
      logger.debug(`[${paymentMethod}] Current payment state: ${useStore.getState().paymentState}`);
      logger.debug(`[${paymentMethod}] Time until robot start: ${useStore.getState().timeUntilRobotStart}`);
      logger.debug(`[${paymentMethod}] isMountedRef.current BEFORE: ${isMountedRef.current}`);
      
      isMountedRef.current = false;
      logger.debug(`[${paymentMethod}] Set isMountedRef.current = false`);
      
      logger.debug(`[${paymentMethod}] Removing WebSocket listener`);
      removeListener();
      
      if (depositTimeoutRef.current) {
        logger.debug(`[${paymentMethod}] Clearing deposit timeout`);
        clearTimeout(depositTimeoutRef.current);
        depositTimeoutRef.current = null;
      }
      if (checkAmountIntervalRef.current) {
        logger.debug(`[${paymentMethod}] Clearing checkAmountInterval`);
        clearInterval(checkAmountIntervalRef.current);
        checkAmountIntervalRef.current = null;
      }
      if (qrCodePollIntervalRef.current) {
        logger.debug(`[${paymentMethod}] Clearing qrCodePollInterval`);
        clearInterval(qrCodePollIntervalRef.current);
        qrCodePollIntervalRef.current = null;
        qrCodePollAttemptsRef.current = 0;
      }
      lastAmountSumRef.current = 0;
      
      logger.debug(`[${paymentMethod}] Payment state AFTER cleanup: ${useStore.getState().paymentState}`);
      logger.debug(`[${paymentMethod}] Time until robot start AFTER cleanup: ${useStore.getState().timeUntilRobotStart}`);
      logger.debug(`[${paymentMethod}] ===== usePaymentWebSocket CLEANUP COMPLETE =====`);
    };
  }, [orderId, order?.status, paymentMethod, fetchOrderDetailsOnPayed, setOrder, setIsLoading]);

  return {};
}


