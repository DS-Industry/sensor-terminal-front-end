import { logger } from './logger';

export function setupGlobalActivityTracking(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target) return;

    const elementInfo = {
      tagName: target.tagName.toLowerCase(),
      id: target.id || undefined,
      className: target.className || undefined,
      text: target.textContent?.trim().substring(0, 50) || undefined,
      role: target.getAttribute('role') || undefined,
      ariaLabel: target.getAttribute('aria-label') || undefined,
    };

    let action = 'click';
    if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
      action = 'button_click';
    } else if (target.tagName === 'A') {
      action = 'link_click';
    } else if (target.closest('button, [role="button"], a')) {
      action = 'interactive_element_click';
    }

    logger.trackUserAction(action, target.tagName.toLowerCase(), {
      ...elementInfo,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleSubmit = (event: Event) => {
    const target = event.target as HTMLFormElement;
    if (!target) return;

    logger.trackUserAction('form_submit', 'form', {
      formId: target.id || undefined,
      formAction: target.action || undefined,
    });
  };

  document.addEventListener('click', handleClick, true);
  document.addEventListener('submit', handleSubmit, true);

  return () => {
    document.removeEventListener('click', handleClick, true);
    document.removeEventListener('submit', handleSubmit, true);
  };
}

