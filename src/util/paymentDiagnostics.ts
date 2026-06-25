import useStore from '../components/state/store';
import { logger } from './logger';
import { normalizeOrderId, orderIdsMatch } from './orderId';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type PaymentDiagnosticReason =
  | 'order_create_start'
  | 'order_create_response'
  | 'order_create_store_set'
  | 'order_create_slow_response'
  | 'flow_mount_autocreate_skipped'
  | 'flow_mount_autocreate_triggered'
  | 'payed_received'
  | 'payed_fetch_start'
  | 'payed_fetch_response'
  | 'payed_amount_gate_decision'
  | 'processing_received'
  | 'processing_navigate_success'
  | 'processing_navigate_queue'
  | 'processing_received_before_payment_success'
  | 'countdown_started'
  | 'countdown_cancelled'
  | 'countdown_fire_attempt'
  | 'robot_start_no_order_id'
  | 'robot_start_wrong_payment_state'
  | 'robot_start_invoked'
  | 'robot_start_api_start'
  | 'robot_start_api_fail'
  | 'robot_start_api_response_classified'
  | 'robot_start_api_ok'
  | 'payment_success_set'
  | 'payment_success_payed_fallback'
  | 'payment_success_desync'
  | 'payment_payed_fetch_skipped_amount'
  | 'ws_hook_message_ignored'
  | 'ws_hook_order_set'
  | 'ws_global_set_initial'
  | 'ws_global_update_same'
  | 'ws_global_replace_stale'
  | 'ws_global_ignored'
  | 'health_reset_skipped'
  | 'health_reset_cleared_state'
  | 'back_blocked_paid_order'
  | 'back_cancel_failed'
  | 'back_modal_confirmed'
  | 'countdown_unmounted'
  | 'mainpage_paid_recovery'
  | 'watchdog_refresh_skipped'
  | 'watchdog_refresh_triggered'
  | 'order_cleared'
  | 'auto_robot_countdown_fired'
  | 'order_create_post_ok';

export type PaymentDiagnosticHypothesisId = 'H1' | 'H2' | 'H3' | 'H4' | 'H5' | 'H6';

export interface PaymentDiagnosticContext {
  page: string;
  paymentState: string;
  order: {
    id: string | number | undefined;
    idType: string;
    status: string;
    paymentMethod?: string;
    transactionId?: string;
  } | null;
  propOrderId: string | number | undefined;
  propOrderIdType: string;
  normalizedStoreId: string | undefined;
  normalizedPropId: string | undefined;
  idsMatch: boolean;
  queuePosition: number | null;
  queueNumber: number | null;
}

export function capturePaymentContext(
  propOrderId?: string | number | null
): PaymentDiagnosticContext {
  const state = useStore.getState();
  const order = state.order;
  const propId = propOrderId ?? undefined;
  const normalizedStoreId = normalizeOrderId(order?.id);
  const normalizedPropId = normalizeOrderId(propId);

  return {
    page: typeof window !== 'undefined' ? window.location.pathname : '',
    paymentState: state.paymentState,
    order: order
      ? {
          id: order.id,
          idType: typeof order.id,
          status: order.status,
          paymentMethod: order.paymentMethod,
          transactionId: order.transactionId,
        }
      : null,
    propOrderId: propId,
    propOrderIdType: typeof propId,
    normalizedStoreId,
    normalizedPropId,
    idsMatch: orderIdsMatch(order?.id, propId),
    queuePosition: state.queuePosition,
    queueNumber: state.queueNumber,
  };
}

export function logPaymentDiagnostic(
  level: LogLevel,
  reason: PaymentDiagnosticReason,
  hypothesisId: PaymentDiagnosticHypothesisId | undefined,
  propOrderId?: string | number | null,
  extras?: Record<string, unknown>
): void {
  logger.trackLog('PaymentDiag', level, reason, {
    reason,
    hypothesisId,
    ...capturePaymentContext(propOrderId),
    ...extras,
  });
}

export function logOrderCleared(source: string, propOrderId?: string | number | null): void {
  logPaymentDiagnostic('info', 'order_cleared', 'H5', propOrderId, { source });
}
