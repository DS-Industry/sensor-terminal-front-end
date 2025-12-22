import { IProgram } from "../../../api/types/program";
import { StoreSlice } from "../types";

export interface AppSlice {
  programs: IProgram[];
  selectedProgram: IProgram | null;
  isProgramsLoading: boolean;
  isLoyalty: boolean;
  isLoading: boolean;
  insertedAmount: number;
  bankCheck: string;
  navigationTarget: string | null;
  errorCode: number | null;
  backConfirmationCallback: (() => void) | null;
  queuePosition: number | null;
  queueNumber: number | null;
  car_wash_id: number | null;
  bannerUrl: string | null;
  setIsLoyalty: (loyalty: boolean) => void;
  setPrograms: (programs: IProgram[]) => void;
  setSelectedProgram: (program: IProgram | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setInsertedAmount: (inserted: number) => void;
  setBankCheck: (bankCheck: string) => void;
  setNavigationTarget: (target: string | null) => void;
  clearNavigation: () => void;
  setErrorCode: (code: number | null) => void;
  setBackConfirmationCallback: (callback: (() => void) | null) => void;
  setQueuePosition: (position: number | null) => void;
  setQueueNumber: (number: number | null) => void;
  setCarWashId: (car_wash_id: number | null) => void;
  setBannerUrl: (bannerUrl: string | null) => void;
}

export const createAppSlice: StoreSlice<AppSlice> = (set) => ({
  programs: [],
  isProgramsLoading: false,
  selectedProgram: null,
  isLoyalty: false,
  isLoading: false,
  insertedAmount: 0,
  bankCheck: "",
  navigationTarget: null,
  errorCode: null,
  backConfirmationCallback: null,
  queuePosition: null,
  queueNumber: null,
  car_wash_id: null,
  bannerUrl: null,

  setPrograms: (programs) => {
    set(state => ({...state, programs}));
  },

  setSelectedProgram: (selectedProgram) => {
    set(state => ({...state, selectedProgram}));
  },

  setIsLoyalty: (loyalty) => {
    set(state => ({...state, isLoyalty: loyalty}));
  },

  setIsLoading: (isLoading) => {
    set(state => ({...state, isLoading}));
  },

  setInsertedAmount: (inserted) => {
    set(state => ({...state, insertedAmount: inserted}));
  },

  setBankCheck: (bankCheck) => {
    set(state => ({...state, bankCheck}));
  },

  setNavigationTarget: (target) => {
    set(state => ({...state, navigationTarget: target }));
  },

  clearNavigation: () => {
    set(state => ({...state, navigationTarget: null }));
  },

  setErrorCode: (code) => {
    set(state => ({...state, errorCode: code}));
  },

  setBackConfirmationCallback: (callback) => {
    set(state => ({...state, backConfirmationCallback: callback}));
  },

  setQueuePosition: (position) => {
    set(state => ({...state, queuePosition: position}));
  },

  setQueueNumber: (number) => {
    set(state => ({...state, queueNumber: number}));
  },

  setCarWashId: (car_wash_id) => {
    set(state => ({...state, car_wash_id}));
  },

  setBannerUrl: (bannerUrl) => {
    set(state => ({...state, bannerUrl}));
  }
});