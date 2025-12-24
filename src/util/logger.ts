import { uploadLogsToS3 } from './s3LogUpload';
import { IndexedDBStorage } from './logger/indexedDB';
import { S3CircuitBreaker } from './logger/s3CircuitBreaker';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type ActivityCategory = 'user_action' | 'page_view' | 'socket_event' | 'api_call' | 'error' | 'system';

interface ActivityLog {
  timestamp: string;
  level: LogLevel;
  category: ActivityCategory;
  message: string;
  page?: string;
  details?: Record<string, unknown>;
}

class Logger {
  private isDevelopment: boolean;
  private sessionId: string;
  private storage: IndexedDBStorage;
  private circuitBreaker: S3CircuitBreaker;
  
  private readonly CONFIG = {
    FLUSH_INTERVAL: 5000,          
    S3_UPLOAD_INTERVAL: 600000,   
    MAX_PENDING_LOGS: 1000,     
    MAX_LOGS_IN_STORAGE: 50000,  
    BATCH_SIZE: 100,          
    MAX_CONSECUTIVE_FAILURES: 5,   
  };
  
  private pendingLogs: ActivityLog[] = [];
  private isFlushing: boolean = false;
  private consecutiveFailures: number = 0;
  private enableIndexedDB: boolean = true;
  private enableS3Upload: boolean = true;
  
  private flushIntervalId: ReturnType<typeof setInterval> | null = null;
  private s3UploadIntervalId: ReturnType<typeof setInterval> | null = null;
  private reenableTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private flushTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private healthCheckIntervalId: ReturnType<typeof setInterval> | null = null;
  private lastHealthStatusLogTime: number = 0;
  
  private errorHandler: ((event: ErrorEvent) => void) | null = null;
  private rejectionHandler: ((event: PromiseRejectionEvent) => void) | null = null;
  private beforeUnloadHandler: (() => void) | null = null;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.sessionId = this.generateSessionId();
    this.storage = new IndexedDBStorage('ActivityLogsDB', 'logs');
    this.circuitBreaker = new S3CircuitBreaker();
    this.lastHealthStatusLogTime = Date.now(); // Initialize to current time to avoid immediate logging
    
    if (this.enableIndexedDB && typeof window !== 'undefined' && 'indexedDB' in window) {
      this.storage.init().catch(err => {
        console.warn('Failed to initialize IndexedDB:', err);
        this.enableIndexedDB = false;
      });
    }
    
    this.logActivity('system', 'info', 'Session started', {
      sessionId: this.sessionId,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    });

    if (typeof window !== 'undefined') {
      this.setupEventHandlers();
      this.setupIntervals();
    }
  }

  private setupEventHandlers(): void {
    this.errorHandler = (event) => {
        this.logActivity('error', 'error', 'JavaScript error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
        });
    };

    this.rejectionHandler = (event) => {
        this.logActivity('error', 'error', 'Unhandled promise rejection', {
          reason: event.reason,
          stack: event.reason?.stack,
        });
    };

    this.beforeUnloadHandler = () => {
        this.flushToIndexedDB(true);
    };
    
    window.addEventListener('error', this.errorHandler);
    window.addEventListener('unhandledrejection', this.rejectionHandler);
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
  }

  private setupIntervals(): void {
    this.flushIntervalId = setInterval(() => this.flushToIndexedDB(), this.CONFIG.FLUSH_INTERVAL);
    this.s3UploadIntervalId = setInterval(() => this.checkAndPerformS3Upload(), this.CONFIG.S3_UPLOAD_INTERVAL);
    this.healthCheckIntervalId = setInterval(() => this.performHealthCheck(), 300000);
  }

  private async performHealthCheck(): Promise<void> {
    try {
      if (this.enableIndexedDB && !this.storage.isReady) {
        console.warn('[Logger] Health check: IndexedDB not ready, attempting reconnection');
        try {
          await this.storage.init();
          this.consecutiveFailures = 0;
          console.info('[Logger] Health check: IndexedDB reconnected successfully');
        } catch (err) {
          console.warn('[Logger] Health check: Failed to reconnect IndexedDB:', err);
        }
      }

      const now = Date.now();
      const timeSinceLastLog = now - this.lastHealthStatusLogTime;
      const HEALTH_STATUS_LOG_INTERVAL = 1800000;
      
      if (timeSinceLastLog >= HEALTH_STATUS_LOG_INTERVAL) {
        const sessionStart = parseInt(this.sessionId.split('-')[1]) || now;
        const sessionDuration = now - sessionStart;
        const logCount = await this.getLogCount();
        const pendingCount = this.pendingLogs.length;
        console.info('[Logger] Health check status:', {
          sessionDuration: Math.floor(sessionDuration / 1000 / 60) + ' minutes',
          indexedDBReady: this.storage.isReady,
          enabled: this.enableIndexedDB,
          logsInStorage: logCount,
          pendingLogs: pendingCount,
          consecutiveFailures: this.consecutiveFailures,
          s3UploadEnabled: this.enableS3Upload,
          circuitBreakerOpen: !this.circuitBreaker.canAttempt(),
        });
        this.lastHealthStatusLogTime = now;
      }
    } catch (error) {
      console.error('[Logger] Health check error:', error);
    }
  }

  private async flushToIndexedDB(sync = false): Promise<void> {
    if (!this.enableIndexedDB || this.pendingLogs.length === 0 || this.isFlushing) {
      return;
    }

    if (!this.storage.isReady) {
      try {
        await this.storage.init();
        this.consecutiveFailures = 0;
      } catch (err) {
        console.warn('[Logger] Failed to reinitialize IndexedDB:', err);
        this.consecutiveFailures++;
        if (this.consecutiveFailures >= this.CONFIG.MAX_CONSECUTIVE_FAILURES) {
          this.handleIndexedDBFailure();
        }
        return;
      }
    }

    if (this.pendingLogs.length > this.CONFIG.MAX_PENDING_LOGS) {
      const excess = this.pendingLogs.length - this.CONFIG.MAX_PENDING_LOGS;
      this.pendingLogs = this.pendingLogs.slice(excess);
      console.warn(`[Logger] Dropped ${excess} old logs to prevent memory leak`);
    }

    if (this.consecutiveFailures >= this.CONFIG.MAX_CONSECUTIVE_FAILURES) {
      this.handleIndexedDBFailure();
      return;
    }

    this.isFlushing = true;
    const logsToFlush = this.pendingLogs.splice(0, this.CONFIG.BATCH_SIZE);

    try {
      await this.storage.add(logsToFlush, this.sessionId);
      this.consecutiveFailures = 0;
      
      if (this.pendingLogs.length > 0) {
        if (sync) {
          await this.flushToIndexedDB(true);
        } else {
          if (this.flushTimeoutId) clearTimeout(this.flushTimeoutId);
          this.flushTimeoutId = setTimeout(() => {
            this.flushTimeoutId = null;
            this.flushToIndexedDB();
          }, 100);
        }
      }
    } catch (err: any) {
      this.consecutiveFailures++;
      const errorMessage = err?.message || String(err);
      const isQuotaError = err?.name === 'QuotaExceededError' || errorMessage.includes('quota') || errorMessage.includes('QuotaExceeded');
      
      console.warn(`[Logger] Failed to flush logs (attempt ${this.consecutiveFailures}/${this.CONFIG.MAX_CONSECUTIVE_FAILURES}):`, {
        error: errorMessage,
        isQuotaError,
        pendingLogsCount: this.pendingLogs.length,
      });
      
      if (isQuotaError && this.consecutiveFailures < this.CONFIG.MAX_CONSECUTIVE_FAILURES) {
        try {
          const logCount = await this.storage.count();
          if (logCount > this.CONFIG.MAX_LOGS_IN_STORAGE) {
            console.warn(`[Logger] Storage quota exceeded (${logCount} logs), attempting to clear old logs`);
            const allLogs = await this.storage.getAll(this.CONFIG.MAX_LOGS_IN_STORAGE);
            if (allLogs.length > 0) {
              const oldestLog = allLogs[allLogs.length - 1];
              const oldestDate = new Date(oldestLog.timestamp);
              await this.storage.deleteOldLogs(this.CONFIG.MAX_LOGS_IN_STORAGE, oldestDate);
              console.info('[Logger] Cleared old logs, retrying flush');
              // Retry the flush
              this.pendingLogs.unshift(...logsToFlush);
              this.consecutiveFailures = Math.max(0, this.consecutiveFailures - 1);
            }
          }
        } catch (clearErr) {
          console.error('[Logger] Failed to clear old logs:', clearErr);
        }
      }
      
      if (this.pendingLogs.length < this.CONFIG.MAX_PENDING_LOGS) {
        this.pendingLogs.unshift(...logsToFlush);
      } else {
        console.warn('[Logger] Dropped logs due to memory limit');
      }
      
      if (this.consecutiveFailures >= this.CONFIG.MAX_CONSECUTIVE_FAILURES) {
        this.handleIndexedDBFailure();
      }
    } finally {
      this.isFlushing = false;
    }
  }

  private handleIndexedDBFailure(): void {
    console.warn('[Logger] Too many IndexedDB failures, disabling storage temporarily');
    this.enableIndexedDB = false;
    if (this.reenableTimeoutId) clearTimeout(this.reenableTimeoutId);
    this.reenableTimeoutId = setTimeout(() => {
      this.enableIndexedDB = true;
      this.consecutiveFailures = 0;
      this.reenableTimeoutId = null;
      
      this.storage.init().then(() => {
        console.info('[Logger] IndexedDB reinitialized successfully');
      }).catch((err) => {
        console.warn('[Logger] Failed to reinitialize IndexedDB:', err);
        this.enableIndexedDB = false;
      });
    }, 60000);
  }


  private async checkAndPerformS3Upload(): Promise<void> {
    if (!this.enableS3Upload) return;
    
    if (!this.storage.isReady) {
      try {
        await this.storage.init();
      } catch (err) {
        console.warn('[Logger] Cannot perform S3 upload - IndexedDB not ready:', err);
        return;
      }
    }
    
    try {
      await this.exportAndCleanupAllLogs();
    } catch (error) {
      console.error('[Logger] Failed to perform S3 upload:', error);
    }
  }

  private async exportAndCleanupAllLogs(): Promise<void> {
    if (!this.storage.isReady) {
      try {
        await this.storage.init();
      } catch (err) {
        console.warn('[Logger] Cannot export logs - IndexedDB not ready:', err);
        return;
      }
    }

    const logs = await this.storage.getAll(this.CONFIG.MAX_LOGS_IN_STORAGE);
    if (logs.length === 0) return;

    if (!this.circuitBreaker.canAttempt()) {
      const remainingSeconds = Math.ceil(this.circuitBreaker.getRemainingCooldown() / 1000);
      console.warn(`[Logger] S3 circuit breaker is open, skipping upload. Will retry in ${remainingSeconds}s`);
      return;
    }

    if (this.enableS3Upload) {
      try {
        const logContent = this.formatLogsAsText(logs);
        let carwashId: string | number | null = null;
        let deviceId: string | number | null = null;
        const uploadDate = new Date();
        
        try {
          const storeModule = await import('../components/state/store');
          carwashId = storeModule.default.getState().car_wash_id;
          deviceId = storeModule.default.getState().device_id;
        } catch (err) {
          console.warn('[Logger] Could not get robot_id from store:', err);
        }

        const s3Key = await uploadLogsToS3(logContent, carwashId, deviceId, uploadDate);
        console.info(`[Logger] Successfully uploaded ${logs.length} logs to S3: ${s3Key}`);
        this.circuitBreaker.recordSuccess();
        this.logActivity('system', 'info', 'Logs uploaded to S3', {
          logCount: logs.length,
          s3Key,
        });

        await this.storage.clear();
        console.info(`[Logger] Successfully uploaded ${logs.length} logs to S3 and cleared IndexedDB`);
      } catch (s3Error) {
        const opened = this.circuitBreaker.recordFailure();
        console.error(`[Logger] Failed to upload logs to S3:`, s3Error);
        
        if (opened) {
          const cooldownMinutes = Math.ceil(300000 / 60000);
          console.warn(`[Logger] S3 circuit breaker opened. Will retry in ${cooldownMinutes} minutes`);
        }
        
        throw s3Error;
      }
    }
  }

  private sanitizeForIndexedDB(value: unknown, visited = new WeakSet()): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
      return value;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
    }

    if (value && typeof value === 'object' && 'baseVal' in value && 'animVal' in value) {
      return String((value as { baseVal: string }).baseVal);
    }

    if (value instanceof Element) {
      const className = value.className;
      const classNameStr = typeof className === 'string' 
        ? className 
        : (className && typeof className === 'object' && 'baseVal' in className 
            ? String((className as { baseVal: string }).baseVal) 
            : undefined);
      
      return {
        tagName: value.tagName,
        id: value.id || undefined,
        className: classNameStr || undefined,
        textContent: value.textContent?.substring(0, 100) || undefined,
      };
    }
    
    if (value instanceof Node) {
      return {
        nodeName: value.nodeName,
        nodeType: value.nodeType,
        textContent: value.textContent?.substring(0, 100) || undefined,
      };
    }

    if (typeof value === 'function') {
      return `[Function: ${value.name || 'anonymous'}]`;
    }

    if (Array.isArray(value)) {
      return value.map(item => this.sanitizeForIndexedDB(item, visited));
    }

    if (typeof value === 'object') {
      if (visited.has(value as object)) {
        return '[Circular Reference]';
      }
      visited.add(value as object);

      try {
        const sanitized: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(value)) {
          try {
            sanitized[key] = this.sanitizeForIndexedDB(val, visited);
          } catch (err) {
            sanitized[key] = `[Error sanitizing: ${err instanceof Error ? err.message : String(err)}]`;
          }
        }
        return sanitized;
      } catch (err) {
        return `[Error sanitizing object: ${err instanceof Error ? err.message : String(err)}]`;
      }
    }

    try {
      return String(value);
    } catch {
      return '[Unable to serialize]';
    }
  }

  private logActivity(
    category: ActivityCategory,
    level: LogLevel,
    message: string,
    details?: Record<string, unknown>
  ): void {
    const log: ActivityLog = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      details: details ? (this.sanitizeForIndexedDB(details) as Record<string, unknown>) : undefined,
    };

    this.pendingLogs.push(log);

    if (this.isDevelopment) {
      const formatted = this.formatActivityMessage(log);
      const consoleMethod = { debug: console.debug, info: console.info, warn: console.warn, error: console.error }[level];
      consoleMethod?.(formatted, log);
    }
  }

  private formatActivityMessage(log: ActivityLog): string {
    const date = new Date(log.timestamp);
    const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}.${date.getMilliseconds().toString().padStart(3, '0')}`;
    return `[${time}] [${log.category.toUpperCase()}] [${log.level.toUpperCase()}] ${log.message}`;
  }

  private formatLogsAsText(logs: ActivityLog[]): string {
    return logs.map(log => JSON.stringify({
      timestamp: log.timestamp,
      level: log.level,
      category: log.category,
      message: log.message,
      page: log.page,
      details: log.details,
    })).join('\n');
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.isDevelopment || level === 'error' || level === 'warn';
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(`[${new Date().toISOString()}] [DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(`[${new Date().toISOString()}] [INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[${new Date().toISOString()}] [WARN] ${message}`, ...args);
    }
  }

  error(message: string, error?: Error | unknown, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      const errorDetails = error instanceof Error ? { message: error.message, stack: error.stack } : error;
      console.error(`[${new Date().toISOString()}] [ERROR] ${message}`, errorDetails, ...args);
    }
  }

  trackUserAction(action: string, element?: string, details?: Record<string, unknown>): void {
    this.logActivity('user_action', 'info', `User action: ${action}`, { action, element, eventType: 'click', ...details });
  }

  trackPageView(page: string, params?: Record<string, unknown>): void {
    this.logActivity('page_view', 'info', `Page view: ${page}`, { action: 'page_view', page, ...params });
  }

  trackSocketEvent(eventType: string, data?: Record<string, unknown>): void {
    this.logActivity('socket_event', 'info', `WebSocket event: ${eventType}`, { socketEvent: eventType, ...data });
  }

  trackPaymentFlow(step: string, orderId?: string, paymentMethod?: string, details?: Record<string, unknown>): void {
    this.logActivity('user_action', 'info', `Payment flow: ${step}`, { action: 'payment_flow', step, orderId, paymentMethod, ...details });
  }

  trackApiCall(method: string, url: string, level: LogLevel, details?: Record<string, unknown>): void {
    this.logActivity('api_call', level, `API ${level === 'error' ? 'Error' : 'Call'}: ${method} ${url}`, { method, url, ...details });
  }

  trackError(error: Error | unknown, context?: Record<string, unknown>): void {
    const message = error instanceof Error ? error.message : 'Unknown error';
    this.logActivity('error', 'error', `User error: ${message}`, {
      error: error instanceof Error ? { message: error.message, stack: error.stack, name: error.name } : error,
      ...context,
    });
  }

  getSessionId(): string {
    return this.sessionId;
  }

  async getLogsFromStorage(limit?: number): Promise<ActivityLog[]> {
    return this.storage.isReady ? this.storage.getAll(limit || this.CONFIG.MAX_LOGS_IN_STORAGE) : [];
  }

  async exportLogsToFile(filename?: string): Promise<void> {
    const logs = await this.getLogsFromStorage();
    const logContent = this.formatLogsAsText(logs);
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `activity-logs-${this.sessionId}-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.logActivity('system', 'info', 'Logs exported to file', { logCount: logs.length });
  }

  async getLogCount(): Promise<number> {
    return this.storage.isReady ? this.storage.count() : 0;
  }

  async performS3Upload(): Promise<void> {
    await this.exportAndCleanupAllLogs();
  }

  async clearLogs(): Promise<void> {
    if (this.storage.isReady) {
      await this.storage.clear();
      this.logActivity('system', 'info', 'Logs cleared');
    }
  }

  cleanup(): void {
    if (this.flushIntervalId) clearInterval(this.flushIntervalId);
    if (this.s3UploadIntervalId) clearInterval(this.s3UploadIntervalId);
    if (this.healthCheckIntervalId) clearInterval(this.healthCheckIntervalId);
    if (this.reenableTimeoutId) clearTimeout(this.reenableTimeoutId);
    if (this.flushTimeoutId) clearTimeout(this.flushTimeoutId);
    
    if (typeof window !== 'undefined') {
      if (this.errorHandler) window.removeEventListener('error', this.errorHandler);
      if (this.rejectionHandler) window.removeEventListener('unhandledrejection', this.rejectionHandler);
      if (this.beforeUnloadHandler) window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    }
    
    console.info('[Logger] Cleanup completed');
  }
}

export const logger = new Logger();

// Ensure window.appLogger is always available
if (typeof window !== 'undefined') {
  // Use defineProperty to make it non-configurable and ensure it's set
  if (!(window as any).appLogger) {
    Object.defineProperty(window, 'appLogger', {
      value: logger,
      writable: false,
      configurable: false,
    });
  } else {
    // If it already exists, update it (shouldn't happen, but safety check)
    (window as any).appLogger = logger;
  }
}
