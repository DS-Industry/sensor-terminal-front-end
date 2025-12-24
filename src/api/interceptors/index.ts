import { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { logger } from "../../util/logger";

export function setupInterceptors(axiosInstance: AxiosInstance) {
  axiosInstance.interceptors.request.use(
    (config) => {
      const method = config.method?.toUpperCase() || 'UNKNOWN';
      const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
      const endpoint = config.url || 'unknown';

      // Log API request with details
      logger.info(`[API Request] ${method} ${fullUrl}`);
      logger.trackApiCall(method, fullUrl, 'info', {
        endpoint,
        baseURL: config.baseURL,
        params: config.params,
        data: config.data,
        headers: config.headers,
      });

      return config;
    },
    (error) => {
      const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
      const fullUrl = error.config ? `${error.config.baseURL || ''}${error.config.url || ''}` : 'unknown';
      
      logger.error('[API Request Error] Failed to send request', error);
      logger.trackApiCall(method, fullUrl, 'error', {
        error: error.message,
        endpoint: error.config?.url,
      });
      
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      const method = response.config.method?.toUpperCase() || 'UNKNOWN';
      const fullUrl = `${response.config.baseURL || ''}${response.config.url || ''}`;
      const endpoint = response.config.url || 'unknown';

      // Log API response with details
      logger.info(`[API Response] ${method} ${fullUrl} - ${response.status} ${response.statusText}`);
      logger.trackApiCall(method, fullUrl, 'info', {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
      });
      
      return response;
    },
    (error: AxiosError) => {
      const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
      const url = error.config?.url || 'unknown';
      const baseURL = error.config?.baseURL || '';
      const fullUrl = `${baseURL}${url}`;
      const status = error.response?.status;
      const statusText = error.response?.statusText;

      // Log API error with comprehensive details
      logger.error(`[API Error] ${method} ${fullUrl} - ${status || 'No Status'} ${statusText || error.message}`, error);
      logger.trackApiCall(method, fullUrl, 'error', {
        endpoint: url,
        status,
        statusText,
        message: error.message,
        responseData: error.response?.data,
        requestData: error.config?.data,
        requestParams: error.config?.params,
      });

      return Promise.reject(error);
    }
  );

  return axiosInstance;
}