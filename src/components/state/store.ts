import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createOrderSlice, OrderSlice } from './order/orderSlice';

export type StoreState =  OrderSlice;

const useStore = create<StoreState>()(
  devtools(
    persist(
      (set, get) => ({
        ...createOrderSlice(set, get),
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({
          order: state.order,
        }),
      }
    )
  )
);

export default useStore;