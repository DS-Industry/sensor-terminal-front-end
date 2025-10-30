import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../state/store';

export function NavigationHandler() {
  const navigate = useNavigate();
  const { navigationTarget, clearNavigation } = useStore();

  useEffect(() => {
    if (navigationTarget) {
      console.log(`🔄 NavigationHandler: navigating to ${navigationTarget}`);
      navigate(navigationTarget);
      clearNavigation();
    }
  }, [navigationTarget, navigate, clearNavigation]);

  return null;
}