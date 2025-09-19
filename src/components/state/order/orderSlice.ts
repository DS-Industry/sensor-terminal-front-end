import { StoreSlice } from "../types";

export enum EPaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  LOYALTY = 'loyalty',
  MOBILE_PAYMENT = 'mobile_payment',
}

export enum EOrderStatus {
  SELECTING_PROGRAM = 'selecting_program',
  SELECTING_PAYMENT = 'selecting_payment', 
  PROCESSING_PAYMENT = 'processing_payment',
  SUCCESS = 'success',
  ERROR_PAYMENT = 'error_payment',
  ERROR_ROBOT = 'error_robot',
  ERROR_INSUFFICIENT_POINTS = 'error_insufficient_points',
}

export interface Order {
  id: string;
  programId?: string;
  status: EOrderStatus;
  paymentMethod?: EPaymentMethod;
  createdAt: string;
}

export interface OrderSlice {
  order: Order | null;
  isOrderLoading: boolean;
  setOrder: (orderData?: Partial<Order>) => void;
  setOrderStatus: (status: EOrderStatus) => void;
  setOrderPaymentMethod: (method: EPaymentMethod) => void;
  setOrderProgramId: (programId: string) => void;
  clearOrder: () => void;
}

export const createOrderSlice: StoreSlice<OrderSlice> = (set, get) => ({
  order: null,
  isOrderLoading: false,

  setOrder: (orderData = {}) => {
    const order: Order = {
      id: orderData.id || `order_${Date.now()}`,
      status: orderData. status || EOrderStatus.SELECTING_PROGRAM,
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