import { StoreSlice } from "../types";

export interface ModalSlice {
  isBackConfirmationModalOpen: boolean;
  openBackConfirmationModal: () => void;
  closeBackConfirmationModal: () => void;
}

export const createModalSlice: StoreSlice<ModalSlice> = (set) => ({
  isBackConfirmationModalOpen: false,

  openBackConfirmationModal: () => {
    set(state => ({ ...state, isBackConfirmationModalOpen: true }));
  },

  closeBackConfirmationModal: () => {
    set(state => ({ ...state, isBackConfirmationModalOpen: false }));
  },
})