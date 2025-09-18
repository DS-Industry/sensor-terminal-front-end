import axios from 'axios';
import { setupAuthInterceptors } from '../interceptors';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
  console.log('Auth token set');
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
  console.log('Auth token removed');
};

export const hasAuthToken = (): boolean => {
  return !!getAuthToken();
};

setupAuthInterceptors(axiosInstance);

export { axiosInstance };