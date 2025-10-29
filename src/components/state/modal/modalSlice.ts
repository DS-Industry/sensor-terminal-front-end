import { StoreSlice } from "../types";

export interface ModalSlice {
  isLoyaltyCardModalOpen: boolean;
  isBackConfirmationModalOpen: boolean;
  openLoyaltyCardModal: () => void;
  closeLoyaltyCardModal: () => void;
  toggleLoyaltyCardModal: () => void;
  openBackConfirmationModal: () => void;
  closeBackConfirmationModal: () => void;
}

export const createModalSlice: StoreSlice<ModalSlice> = (set, get) => ({
  isLoyaltyCardModalOpen: false,
  isBackConfirmationModalOpen: false,

  openLoyaltyCardModal: () => {
    set(state => ({ ...state, isLoyaltyCardModalOpen: true }));
  },

  closeLoyaltyCardModal: () => {
    set(state => ({ ...state, isLoyaltyCardModalOpen: false }));
  },

  toggleLoyaltyCardModal: () => {
    const { isLoyaltyCardModalOpen } = get();
    set(state => ({...state, isLoyaltyCardModalOpen: !isLoyaltyCardModalOpen}));
  },

  openBackConfirmationModal: () => {
    set(state => ({ ...state, isBackConfirmationModalOpen: true }));
  },

  closeBackConfirmationModal: () => {
    set(state => ({ ...state, isBackConfirmationModalOpen: false }));
  },
})