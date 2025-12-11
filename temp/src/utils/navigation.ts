import { NavigateFunction } from 'react-router-dom';
import { logger } from '../util/logger';

export const navigateToPaymentSuccess = (navigate: NavigateFunction) => {
  logger.info('[Navigation] Navigating to payment success page');
  navigate('/success', { replace: true });
};

export const navigateToQueueWaiting = (navigate: NavigateFunction) => {
  logger.info('[Navigation] Navigating to queue waiting page');
  navigate('/queue-waiting', { replace: true });
};

export const navigateToWashing = (navigate: NavigateFunction) => {
  logger.info('[Navigation] Navigating to washing page');
  navigate('/washing', { replace: true });
};

export const navigateToMain = (navigate: NavigateFunction) => {
  logger.info('[Navigation] Navigating to main page');
  navigate('/', { replace: true });
};

export const navigateToError = (navigate: NavigateFunction) => {
  logger.info('[Navigation] Navigating to error page');
  navigate('/error', { replace: true });
};

export const navigateToErrorPayment = (navigate: NavigateFunction) => {
  logger.info('[Navigation] Navigating to error payment page');
  navigate('/error-payment', { replace: true });
};


