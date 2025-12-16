export enum PaymentState {
  IDLE = 'idle',
  CREATING_ORDER = 'creating_order',
  WAITING_PAYMENT = 'waiting_payment',
  PROCESSING_PAYMENT = 'processing_payment',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_ERROR = 'payment_error',
  QUEUE_FULL = 'queue_full',
  QUEUE_WAITING = 'queue_waiting',
  STARTING_ROBOT = 'starting_robot',
  ROBOT_STARTED = 'robot_started',
}

export const VALID_TRANSITIONS: Record<PaymentState, PaymentState[]> = {
  [PaymentState.IDLE]: [
    PaymentState.CREATING_ORDER,
  ],
  [PaymentState.CREATING_ORDER]: [
    PaymentState.WAITING_PAYMENT,
    PaymentState.PAYMENT_ERROR,
    PaymentState.IDLE,
  ],
  [PaymentState.WAITING_PAYMENT]: [
    PaymentState.PROCESSING_PAYMENT,
    PaymentState.PAYMENT_SUCCESS,
    PaymentState.PAYMENT_ERROR,
    PaymentState.QUEUE_FULL,
  ],
  [PaymentState.PROCESSING_PAYMENT]: [
    PaymentState.PAYMENT_SUCCESS,
    PaymentState.PAYMENT_ERROR,
    PaymentState.QUEUE_FULL,
  ],
  [PaymentState.PAYMENT_SUCCESS]: [
    PaymentState.QUEUE_WAITING,
    PaymentState.STARTING_ROBOT,
    PaymentState.ROBOT_STARTED,
  ],
  [PaymentState.PAYMENT_ERROR]: [
    PaymentState.IDLE,
    PaymentState.CREATING_ORDER,
  ],
  [PaymentState.QUEUE_FULL]: [
    PaymentState.IDLE,
  ],
  [PaymentState.QUEUE_WAITING]: [
    PaymentState.STARTING_ROBOT,
    PaymentState.ROBOT_STARTED,
  ],
  [PaymentState.STARTING_ROBOT]: [
    PaymentState.ROBOT_STARTED,
    PaymentState.PAYMENT_ERROR,
  ],
  [PaymentState.ROBOT_STARTED]: [],
};

export function isValidTransition(from: PaymentState, to: PaymentState): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getNextValidStates(state: PaymentState): PaymentState[] {
  return VALID_TRANSITIONS[state] ?? [];
}




