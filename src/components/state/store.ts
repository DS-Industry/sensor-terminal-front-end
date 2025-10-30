import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createOrderSlice, OrderSlice } from './order/orderSlice';
import { AppSlice, createAppSlice } from './app/appSlice';
import { createModalSlice, ModalSlice } from './modal/modalSlice';

export type StoreState =  OrderSlice & AppSlice & ModalSlice;

const useStore = create<StoreState>()(
  devtools(
    persist(
      (set, get) => ({
        ...createOrderSlice(set, get),
        ...createAppSlice(set, get),
        ...createModalSlice(set, get),
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