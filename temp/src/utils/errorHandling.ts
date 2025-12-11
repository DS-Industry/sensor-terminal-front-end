import { logger } from '../util/logger';

export interface AppError {
  message: string;
  code?: string | number;
  originalError?: unknown;
}

export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'Произошла неизвестная ошибка';
}

export function extractErrorCode(error: unknown): string | number | undefined {
  if (error && typeof error === 'object') {
    const err = error as any;
    if (err?.response?.data?.error) {
      return err.response.data.error;
    }
    if (err?.response?.status) {
      return err.response.status;
    }
    if (err?.code) {
      return err.code;
    }
  }
  return undefined;
}

export function createAppError(error: unknown, defaultMessage: string = 'Произошла ошибка'): AppError {
  const message = extractErrorMessage(error) || defaultMessage;
  const code = extractErrorCode(error);
  
  return {
    message,
    code,
    originalError: error,
  };
}

export function logError(context: string, error: unknown, additionalInfo?: Record<string, unknown>) {
  const appError = createAppError(error);
  
  logger.error(`[${context}] ${appError.message}`, {
    code: appError.code,
    ...additionalInfo,
    originalError: appError.originalError,
  });
}

export function handleApiError(context: string, error: unknown): string {
  const appError = createAppError(error, 'Произошла ошибка при выполнении запроса');
  logError(context, error);
  
  return appError.message;
}


