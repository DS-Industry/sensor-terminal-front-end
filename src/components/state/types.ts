import { StoreApi } from 'zustand';
import { StoreState } from './store';

export type StoreSlice<T> = (
  set: StoreApi<StoreState>['setState'],
  get: StoreApi<StoreState>['getState'],
) => T;