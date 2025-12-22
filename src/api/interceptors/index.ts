import { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { logger } from "../../util/logger";

export function setupInterceptors(axiosInstance: AxiosInstance) {
  axiosInstance.interceptors.request.use(
    (config) => {
      logger.debug(`Request: ${config.method?.toUpperCase()} ${config.url}`);

      return config;
    },
    (error) => {
      logger.error('Request error:', error);
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      logger.debug(`Response: ${response.status} ${response.config.url}`);
      logger.debug(`${response.config.baseURL}${response.config.url}`);
      
      return response;
    },
    (error: AxiosError) => {
      const url = error.config?.url;
      const method = error.config?.method;
      const status = error.response?.status;

      logger.error('API Error:', {
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