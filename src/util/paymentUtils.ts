import { AxiosError } from 'axios';

export enum PaymentState {
  IDLE = 'idle',
  CREATING_ORDER = 'creating_order',
  WAITING_PAYMENT = 'waiting_payment',
  PROCESSING_PAYMENT = 'processing_payment',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  QUEUE_FULL = 'queue_full',
  ERROR = 'error',
  CANCELLED = 'cancelled',
}

export function sanitizeErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const errorData = error.response?.data;

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return 'Превышено время ожидания ответа от сервера. Пожалуйста, попробуйте снова.';
    }

    if (error.code === 'ERR_NETWORK' || !error.response) {
      return 'Ошибка подключения к серверу. Проверьте подключение к интернету.';
    }

    switch (status) {
      case 400:
        return 'Неверный запрос. Пожалуйста, попробуйте снова.';
      case 401:
        return 'Ошибка авторизации. Обратитесь к администратору.';
      case 403:
        return 'Доступ запрещен. Обратитесь к администратору.';
      case 404:
        return 'Ресурс не найден. Пожалуйста, попробуйте снова.';
      case 429:
        return 'Слишком много запросов. Пожалуйста, подождите немного.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Ошибка на сервере. Пожалуйста, попробуйте позже.';
      default:
        if (errorData?.error && typeof errorData.error === 'string') {
          const errorMsg = errorData.error.toLowerCase();
          if (
            !errorMsg.includes('internal') &&
            !errorMsg.includes('server') &&
            !errorMsg.includes('database') &&
            !errorMsg.includes('sql') &&
            !errorMsg.includes('exception') &&
            !errorMsg.includes('stack') &&
            !errorMsg.includes('trace')
          ) {
            return errorData.error;
          }
        }
        return defaultMessage;
    }
  }

  if (error instanceof Error) {
    if (
      error.message.includes('Network') ||
      error.message.includes('timeout') ||
      error.message.includes('Failed to fetch')
    ) {
      return 'Ошибка подключения. Пожалуйста, попробуйте снова.';
    }
  }

  return defaultMessage;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    onRetry?: (attempt: number, error: unknown) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (error instanceof AxiosError) {
        const status = error.response?.status;
        if (status && status >= 400 && status < 500 && status !== 429) {
          throw error;
        }
      }

      if (attempt < maxRetries) {
        if (onRetry) {
          onRetry(attempt + 1, error);
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * backoffMultiplier, maxDelay);
      }
    }
  }

  throw lastError;
}

export function validatePaymentAmount(
  paidAmount: number,
  expectedAmount: number,
  tolerance: number = 0.01
): { isValid: boolean; difference: number } {
  const difference = Math.abs(paidAmount - expectedAmount);
  return {
    isValid: difference <= tolerance,
    difference,
  };
}

export class OperationLock {
  private locked = false;
  private lockId: string | null = null;

  acquire(operationId: string): string | null {
    if (this.locked) {
      return null;
    }
    this.locked = true;
    this.lockId = operationId;
    return operationId;
  }

  release(operationId: string): boolean {
    if (this.lockId === operationId) {
      this.locked = false;
      this.lockId = null;
      return true;
    }
    return false;
  }

  isLocked(): boolean {
    return this.locked;
  }

  forceRelease(): void {
    this.locked = false;
    this.lockId = null;
  }
}

export class TimerManager {
  private timers: Set<ReturnType<typeof setTimeout> | ReturnType<typeof setInterval>> = new Set();

  setTimeout(callback: () => void, delay: number): ReturnType<typeof setTimeout> {
    const timer = setTimeout(() => {
      callback();
      this.timers.delete(timer);
    }, delay);
    this.timers.add(timer);
    return timer;
  }

  setInterval(callback: () => void, delay: number): ReturnType<typeof setInterval> {
    const timer = setInterval(callback, delay);
    this.timers.add(timer);
    return timer;
  }

  clearTimeout(timer: ReturnType<typeof setTimeout> | null): void {
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(timer);
    }
  }

  clearInterval(timer: ReturnType<typeof setInterval> | null): void {
    if (timer) {
      clearInterval(timer);
      this.timers.delete(timer);
    }
  }

  clearAll(): void {
    this.timers.forEach((timer) => {
      if (typeof timer === 'number') {
        clearTimeout(timer);
      } else {
        clearInterval(timer);
      }
    });
    this.timers.clear();
  }

  getActiveTimerCount(): number {
    return this.timers.size;
  }
}
