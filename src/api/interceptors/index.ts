import { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { getAuthToken, removeAuthToken } from "../axiosConfig";

export function setupAuthInterceptors(axiosInstance: AxiosInstance) {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getAuthToken(); 
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      console.log(`Request: ${config.method?.toUpperCase()} ${config.url}`);

      return config;
    },
    (error) => {
      console.error('Request error:', error);
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log(`Response: ${response.status} ${response.config.url}`);
      return response;
    },
    (error: AxiosError) => {
      const url = error.config?.url;
      const method = error.config?.method;
      const status = error.response?.status;

      console.error('API Error:', {
        url,
        method,
        status,
        message: error.message,
      });

      if (error.response?.status === 401) {
        removeAuthToken(); 
        window.dispatchEvent(new Event('unauthorized'));
      }

      return Promise.reject(error);
    }
  );

  return axiosInstance;
}