import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useStore from '../state/store';
import { logger } from '../../util/logger';

interface PaymentGuardProps {
  children: ReactNode;
}

export function PaymentGuard({ children }: PaymentGuardProps) {
  const location = useLocation();
  const { order } = useStore();

  const protectedRoutes = ['/success', '/error', '/error-payment', '/washing', '/queue-waiting'];
  
  if (protectedRoutes.includes(location.pathname) && !order?.id) {
    logger.warn(`[PaymentGuard] Access denied to ${location.pathname} - no order found`);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
