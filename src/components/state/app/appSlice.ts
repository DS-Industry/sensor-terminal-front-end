import { IProgram } from "../../../api/types/program";
import { StoreSlice } from "../types";

export interface AppSlice {
  programs: IProgram[];
  selectedProgram: IProgram | null;
  isProgramsLoading: boolean;
  isLoyalty: boolean;
  isLoading: boolean;
  insertedAmount: number;
  setIsLoyalty: (loyalty: boolean) => void;
  setPrograms: (programs: IProgram[]) => void;
  setSelectedProgram: (program: IProgram | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setInsertedAmount: (inserted: number) => void;
}

export const createAppSlice: StoreSlice<AppSlice> = (set) => ({
  programs: [],
  isProgramsLoading: false,
  selectedProgram: null,
  isLoyalty: false,
  isLoading: false,
  insertedAmount: 0,

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
});