import { IProgram } from "../../../api/types/program";
import { StoreSlice } from "../types";

export interface AppSlice {
  programs: IProgram[];
  selectedProgram: IProgram | null;
  isProgramsLoading: boolean;
  setPrograms: (programs: IProgram[]) => void;
  setSelectedProgram: (program: IProgram | null) => void;
}

export const createAppSlice: StoreSlice<AppSlice> = (set) => ({
  programs: [],
  isProgramsLoading: false,
  selectedProgram: null,

  setPrograms: (programs) => {
    set(state => ({...state, programs}));
  },

  setSelectedProgram: (selectedProgram) => {
    set(state => ({...state, selectedProgram}));
  },
});