import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logger } from '../util/logger';

export function useUserActivityTracking() {
  const location = useLocation();

  useEffect(() => {
    logger.trackPageView(location.pathname, {
      search: location.search,
      hash: location.hash,
      fullPath: location.pathname + location.search + location.hash,
    });
  }, [location]);

  return {
    trackAction: logger.trackUserAction.bind(logger),
    trackPaymentFlow: logger.trackPaymentFlow.bind(logger),
    trackError: logger.trackError.bind(logger),
    sessionId: logger.getSessionId(),
  };
}

