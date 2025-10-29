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
  errorText: string;
  backConfirmationCallback: (() => void) | null;
  setIsLoyalty: (loyalty: boolean) => void;
  setPrograms: (programs: IProgram[]) => void;
  setSelectedProgram: (program: IProgram | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setInsertedAmount: (inserted: number) => void;
  setBankCheck: (bankCheck: string) => void;
  setNavigationTarget: (target: string | null) => void;
  clearNavigation: () => void;
  setErrorText: (error: string) => void;
  setBackConfirmationCallback: (callback: (() => void) | null) => void;
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
  errorText: "",
  backConfirmationCallback: null,

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

  setErrorText: (error) => {
    set(state => ({...state, errorText: error}));
  },

  setBackConfirmationCallback: (callback) => {
    set(state => ({...state, backConfirmationCallback: callback}));
  }
});