import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createOrderSlice, OrderSlice } from './order/orderSlice';
import { AppSlice, createAppSlice } from './app/appSlice';
import { createModalSlice, ModalSlice } from './modal/modalSlice';
import { createPaymentSlice, PaymentSlice } from './payment/paymentSlice';
import { logger } from '../../util/logger';

export type StoreState = OrderSlice & AppSlice & ModalSlice & PaymentSlice;

const ORDER_EXPIRY_TIME = 3600000;

const useStore = create<StoreState>()(
  devtools(
    persist(
      (set, get) => ({
        ...createOrderSlice(set, get),
        ...createAppSlice(set, get),
        ...createModalSlice(set, get),
        ...createPaymentSlice(set, get),
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({
          order: state.order,
        }),
        onRehydrateStorage: () => (state) => {
          if (state?.order && state.order.createdAt) {
            try {
              const orderCreatedAt = new Date(state.order.createdAt);
              const orderAge = Date.now() - orderCreatedAt.getTime();
              
              if (isNaN(orderAge) || orderAge > ORDER_EXPIRY_TIME || orderAge < 0) {
                logger.warn('Stale order detected in localStorage, clearing it', {
                  orderId: state.order.id,
                  orderAge: orderAge,
                  createdAt: state.order.createdAt,
                });
                
                state.clearOrder();
              } else {
                logger.debug('Order restored from localStorage', {
                  orderId: state.order.id,
                  orderAge: Math.round(orderAge / 1000 / 60),
                });
              }
            } catch (error) {
              logger.error('Invalid order data in localStorage, clearing it', error);
              state.clearOrder();
            }
          }
        },
      }
    )
  )
);

export default useStore;