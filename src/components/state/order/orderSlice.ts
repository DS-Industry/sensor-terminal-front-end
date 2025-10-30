import { StoreSlice } from "../types";

export enum EPaymentMethod {
  CASH = 'cash',
  CARD = 'bank_card',
  LOYALTY = 'loyalty_card',
  MOBILE_PAYMENT = 'mobile_app',
}

export enum EOrderStatus {
  CREATED = 'created',
  WAITING_PAYMENT = 'waiting_payment',
  PAYED = 'payed',
  FAILED = 'failed',
  COMPLETED = 'completed',
  PROCESSING = 'processing',
  MOBILE_QR_REQUEST = 'mobile_qr_request',
}

export interface Order {
  id?: string;
  programId?: number;
  status: EOrderStatus;
  paymentMethod?: EPaymentMethod;
  createdAt: string;
  transactionId?: string;
}

export interface OrderSlice {
  order: Order | null;
  isOrderLoading: boolean;
  setOrder: (orderData?: Partial<Order>) => void;
  setOrderStatus: (status: EOrderStatus) => void;
  setOrderPaymentMethod: (method: EPaymentMethod) => void;
  setOrderProgramId: (programId: number) => void;
  clearOrder: () => void;
}

export const createOrderSlice: StoreSlice<OrderSlice> = (set, get) => ({
  order: null,
  isOrderLoading: false,

  setOrder: (orderData = {}) => {
    const order: Order = {
      status: orderData. status || EOrderStatus.CREATED,
      createdAt: orderData.createdAt || new Date().toISOString(),
      ...orderData, 
    };

    set({ order });
  },

  setOrderStatus: (status) => {
    const { order } = get();
    if (!order) return;

    set({
      order: {
        ...order,
        status,
      }
    });
  },

  setOrderPaymentMethod: (method) => {
    const { order } = get();
    if (!order) return;

    set({
      order: {
        ...order,
        paymentMethod: method,
      }
    });
  },

  setOrderProgramId: (programId) => {
    const { order } = get();
    if (!order) return;

    set({
      order: {
        ...order,
        programId,
      }
    });
  },

  clearOrder: () => {
    set({ 
      order: null,
      isOrderLoading: false,
    });
  },
});