import { StoreSlice } from "../types";
import { PaymentState } from "../../../state/paymentStateMachine";

export interface PaymentSlice {
  paymentState: PaymentState;
  paymentError: string | null;
  timeUntilRobotStart: number;
  setPaymentState: (state: PaymentState) => void;
  setPaymentError: (error: string | null) => void;
  setTimeUntilRobotStart: (time: number) => void;
  resetPayment: () => void;
}

export const createPaymentSlice: StoreSlice<PaymentSlice> = (set) => ({
  paymentState: PaymentState.IDLE,
  paymentError: null,
  timeUntilRobotStart: 0,

  setPaymentState: (state) => {
    set((currentState) => ({ ...currentState, paymentState: state }));
  },

  setPaymentError: (error) => {
    set((currentState) => ({ ...currentState, paymentError: error }));
  },

  setTimeUntilRobotStart: (time) => {
    set((currentState) => ({ ...currentState, timeUntilRobotStart: time }));
  },

  resetPayment: () => {
    set((currentState) => ({
      ...currentState,
      paymentState: PaymentState.IDLE,
      paymentError: null,
      timeUntilRobotStart: 0,
    }));
  },
});

