import { StoreSlice } from "../types";

export enum EOrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export interface Order {
  id: string;
  programId: string;
  status: EOrderStatus;
  paymentMethod?: 'bankCard' | 'cash' | 'app';
  createdAt: string;
}

export interface OrderSlice {
  order: Order | null;
  isOrderLoading: boolean;
  createOrder: (program: {
    programId: string;
  }, paymentMethod?: Order['paymentMethod']) => void;

  clearOrder: () => void;
  updateOrderStatus: (status: EOrderStatus) => void;
  setPaymentMethod: (method: Order['paymentMethod']) => void;
  completeOrder: () => void;
  cancelOrder: () => void;
}

export const createOrderSlice: StoreSlice<OrderSlice> = (set, get) => ({
  order: null,
  isOrderLoading: false,

  createOrder: (program, paymentMethod) => {
    const newOrder: Order = {
      id: `order_${Date.now()}`,
      programId: program.programId,
      status: EOrderStatus.PENDING,
      paymentMethod,
      createdAt: new Date().toISOString(),
    };

    set({ order: newOrder });
  },

  clearOrder: () => {
    set({ 
      order: null,
      isOrderLoading: false,
    });
  },

  updateOrderStatus: (status) => {
    const { order } = get();
    if (!order) return;

    set({
      order: {
        ...order,
        status,
      }
    });
  },

  setPaymentMethod: (method) => {
    const { order } = get();
    if (!order) return;

    set({
      order: {
        ...order,
        paymentMethod: method,
      }
    });
  },

  completeOrder: () => {
    const { order } = get();
    if (!order) return;

    set({
      order: {
        ...order,
        status: EOrderStatus.COMPLETED,
      },
      isOrderLoading: false,
    });
  },

  cancelOrder: () => {
    const { order } = get();
    if (!order) return;

    set({
      order: {
        ...order,
        status: EOrderStatus.CANCELLED,
      },
      isOrderLoading: false,
    });
  },
});