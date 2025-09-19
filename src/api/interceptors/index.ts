import { AxiosError, AxiosInstance, AxiosResponse } from "axios";

export function setupInterceptors(axiosInstance: AxiosInstance) {
  axiosInstance.interceptors.request.use(
    (config) => {
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

      return Promise.reject(error);
    }
  );

  return axiosInstance;
}