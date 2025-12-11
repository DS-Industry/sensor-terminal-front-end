import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logger } from '../../util/logger';
import { getRefreshInterval } from '../../config/env';
import useStore from '../state/store';
import { navigateToMain } from '../../utils/navigation';
import { EOrderStatus } from '../state/order/orderSlice';

export function AppHealthMonitor() {
  const navigate = useNavigate();
  const location = useLocation();
  const resetIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const memoryCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStartTimeRef = useRef<number>(Date.now());
  const lastResetTimeRef = useRef<number>(Date.now());
  const skippedResetsRef = useRef<number>(0);
  const { order, clearOrder, setSelectedProgram, setBankCheck, setInsertedAmount, setQueuePosition, setQueueNumber } = useStore();
  const store = useStore; // Keep reference to store for accessing current state in callbacks

  const refreshInterval = getRefreshInterval();

  // Watchdog configuration
  const heartbeatInterval = 10000; // Check every 10 seconds
  const maxHeartbeatDelay = 30000; // If heartbeat is delayed by more than 30s, app is frozen
  const lastHeartbeatTimeRef = useRef<number>(Date.now());
  const scheduledHeartbeatTimeRef = useRef<number>(Date.now());
  const heartbeatTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafCheckRef = useRef<number | null>(null);
  const lastRafTimeRef = useRef<number>(Date.now());
  const frozenDetectionCountRef = useRef<number>(0);
  const frozenDetectionThreshold = 3; // Require 3 consecutive detections before refresh

  const checkMemoryUsage = () => {
    if ('memory' in performance) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
      const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
      const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);
      const usagePercent = Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100);

      logger.debug(`[AppHealth] Memory usage: ${usedMB}MB / ${totalMB}MB (limit: ${limitMB}MB, ${usagePercent}%)`);

      if (usagePercent > 80) {
        logger.warn(`[AppHealth] High memory usage detected: ${usagePercent}%`);
      }

      return { usedMB, totalMB, limitMB, usagePercent };
    }
    return null;
  };

  const shouldSkipHealthActions = (): boolean => {
    const activePaymentStatuses = [
      EOrderStatus.WAITING_PAYMENT,
      EOrderStatus.PAYED,
      EOrderStatus.PROCESSING,
    ];
    
    return order !== null && activePaymentStatuses.includes(order.status);
  };

  const performSoftReset = () => {
    if (shouldSkipHealthActions()) {
      skippedResetsRef.current++;
      logger.debug(`[AppHealth] Skipping soft reset - active payment flow detected`, {
        orderId: order?.id,
        status: order?.status,
        skippedCount: skippedResetsRef.current,
      });
      return;
    }

    const uptime = Date.now() - appStartTimeRef.current;
    const timeSinceLastReset = Date.now() - lastResetTimeRef.current;
    const uptimeHours = Math.round(uptime / 3600000 * 10) / 10;
    const timeSinceResetHours = Math.round(timeSinceLastReset / 3600000 * 10) / 10;

    logger.info(`[AppHealth] Performing periodic soft reset`, {
      uptimeHours,
      timeSinceResetHours,
      currentPath: location.pathname,
      skippedResets: skippedResetsRef.current,
    });

    skippedResetsRef.current = 0;

    const memoryInfo = checkMemoryUsage();
    if (memoryInfo) {
      logger.info(`[AppHealth] Memory before reset: ${memoryInfo.usedMB}MB (${memoryInfo.usagePercent}%)`);
    }

    clearOrder();
    setSelectedProgram(null);
    setBankCheck("");
    setInsertedAmount(0);
    setQueuePosition(null);
    setQueueNumber(null);

    if (location.pathname !== '/') {
      logger.info(`[AppHealth] Navigating to home page for soft reset`);
      navigateToMain(navigate);
    } else {
      logger.debug(`[AppHealth] Already on home page, skipping navigation`);
    }

    lastResetTimeRef.current = Date.now();
  };

  /**
   * Watchdog mechanism to detect if the app has become unresponsive.
   * Uses two detection methods:
   * 1. setTimeout timestamp checking - detects if main thread is frozen
   * 2. requestAnimationFrame - detects if rendering is frozen
   */
  const setupWatchdog = () => {
    const checkHeartbeat = () => {
      const now = Date.now();
      const scheduledTime = scheduledHeartbeatTimeRef.current;
      const actualDelay = now - scheduledTime;

      // If the heartbeat was delayed significantly, the main thread was likely frozen
      if (actualDelay > maxHeartbeatDelay) {
        frozenDetectionCountRef.current++;
        logger.warn(`[AppHealth] Watchdog detected potential freeze`, {
          scheduledDelay: heartbeatInterval,
          actualDelay,
          delayDifference: actualDelay - heartbeatInterval,
          consecutiveDetections: frozenDetectionCountRef.current,
        });

        // Check requestAnimationFrame as secondary indicator
        const rafDelay = now - lastRafTimeRef.current;
        if (rafDelay > maxHeartbeatDelay) {
          logger.warn(`[AppHealth] Watchdog: requestAnimationFrame also delayed`, {
            rafDelay,
          });
        }

        // If we've detected freeze multiple times consecutively, refresh the page
        if (frozenDetectionCountRef.current >= frozenDetectionThreshold) {
          // Check current order state from store (not closure) to ensure we have latest value
          const currentOrder = store.getState().order;
          const activePaymentStatuses = [
            EOrderStatus.WAITING_PAYMENT,
            EOrderStatus.PAYED,
            EOrderStatus.PROCESSING,
          ];
          const isActivePayment = currentOrder !== null && activePaymentStatuses.includes(currentOrder.status);
          
          if (isActivePayment) {
            logger.warn(`[AppHealth] Watchdog: App frozen but skipping refresh - active payment flow`, {
              orderId: currentOrder?.id,
              status: currentOrder?.status,
            });
            frozenDetectionCountRef.current = 0; // Reset counter, will check again
          } else {
            logger.error(`[AppHealth] Watchdog: App appears frozen, refreshing page`, {
              consecutiveDetections: frozenDetectionCountRef.current,
              lastHeartbeatDelay: actualDelay,
              uptimeHours: Math.round((now - appStartTimeRef.current) / 3600000 * 10) / 10,
            });
            
            // Small delay to ensure log is written, then refresh
            setTimeout(() => {
              window.location.reload();
            }, 1000);
            return; // Don't schedule next heartbeat
          }
        }
      } else {
        // Reset counter if heartbeat is normal
        if (frozenDetectionCountRef.current > 0) {
          logger.info(`[AppHealth] Watchdog: Heartbeat recovered, resetting freeze counter`);
          frozenDetectionCountRef.current = 0;
        }
      }

      // Update timestamps
      lastHeartbeatTimeRef.current = now;
      scheduledHeartbeatTimeRef.current = now + heartbeatInterval;

      // Schedule next heartbeat check
      heartbeatTimeoutRef.current = setTimeout(() => {
        checkHeartbeat();
      }, heartbeatInterval);
    };

    // Initialize requestAnimationFrame monitoring
    const monitorRendering = () => {
      lastRafTimeRef.current = Date.now();
      rafCheckRef.current = requestAnimationFrame(monitorRendering);
    };

    // Start monitoring
    lastHeartbeatTimeRef.current = Date.now();
    scheduledHeartbeatTimeRef.current = Date.now() + heartbeatInterval;
    rafCheckRef.current = requestAnimationFrame(monitorRendering);
    
    // Start heartbeat checks
    heartbeatTimeoutRef.current = setTimeout(() => {
      checkHeartbeat();
    }, heartbeatInterval);

    logger.info(`[AppHealth] Watchdog initialized`, {
      heartbeatIntervalMs: heartbeatInterval,
      maxHeartbeatDelayMs: maxHeartbeatDelay,
      freezeDetectionThreshold: frozenDetectionThreshold,
    });

    // Cleanup function
    return () => {
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
        heartbeatTimeoutRef.current = null;
      }
      if (rafCheckRef.current !== null) {
        cancelAnimationFrame(rafCheckRef.current);
        rafCheckRef.current = null;
      }
      logger.info(`[AppHealth] Watchdog cleaned up`);
    };
  };

  useEffect(() => {
    logger.info(`[AppHealth] AppHealthMonitor initialized`, {
      refreshIntervalMs: refreshInterval,
      refreshIntervalHours: Math.round(refreshInterval / 3600000 * 10) / 10,
    });

    resetIntervalRef.current = setInterval(() => {
      performSoftReset();
    }, refreshInterval);

    if ('memory' in performance) {
      memoryCheckIntervalRef.current = setInterval(() => {
        checkMemoryUsage();
      }, 5 * 60 * 1000);

      checkMemoryUsage();
    } else {
      logger.debug(`[AppHealth] Performance Memory API not available, skipping memory monitoring`);
    }

    appStartTimeRef.current = Date.now();
    lastResetTimeRef.current = Date.now();

    // Setup watchdog for detecting frozen app
    const watchdogCleanup = setupWatchdog();

    return () => {
      if (resetIntervalRef.current) {
        clearInterval(resetIntervalRef.current);
        resetIntervalRef.current = null;
      }
      if (memoryCheckIntervalRef.current) {
        clearInterval(memoryCheckIntervalRef.current);
        memoryCheckIntervalRef.current = null;
      }
      watchdogCleanup();
      logger.info(`[AppHealth] AppHealthMonitor cleaned up`);
    };
  }, []);

  useEffect(() => {
    const uptimeLogger = setInterval(() => {
      const uptime = Date.now() - appStartTimeRef.current;
      const uptimeHours = Math.round(uptime / 3600000 * 10) / 10;
      const timeSinceReset = Date.now() - lastResetTimeRef.current;
      const timeSinceResetHours = Math.round(timeSinceReset / 3600000 * 10) / 10;
      
      logger.info(`[AppHealth] App uptime: ${uptimeHours}h, time since last reset: ${timeSinceResetHours}h`);
      
    
      checkMemoryUsage();
    }, 3600000);

    return () => clearInterval(uptimeLogger);
  }, []);

  return null;
}

