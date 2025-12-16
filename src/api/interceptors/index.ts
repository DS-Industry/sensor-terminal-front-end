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
      const baseURL = error.config?.baseURL;
      const fullUrl = baseURL ? `${baseURL}${url}` : url;

      logger.error('[API Interceptor] ===== API ERROR INTERCEPTED =====');
      logger.error('[API Interceptor] Full URL:', fullUrl);
      logger.error('[API Interceptor] Method:', method);
      logger.error('[API Interceptor] Status:', status);
      logger.error('[API Interceptor] Error message:', error.message);
      logger.error('[API Interceptor] Error response data:', error.response?.data);
      
      // Check if this is a payment-related endpoint
      if (url?.includes('pay/') || url?.includes('start/')) {
        logger.error('[API Interceptor] ===== PAYMENT API ERROR =====');
        logger.error('[API Interceptor] This is a payment-related endpoint!');
        logger.error('[API Interceptor] This error may affect payment state and timer!');
      }

      logger.error('[API Interceptor] ===== ERROR PROPAGATED =====');

      return Promise.reject(error);
    }
  );

  return axiosInstance;
}