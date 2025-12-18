import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Spin } from '@gravity-ui/uikit';
import useStore from '../state/store';
import { logger } from '../../util/logger';

export function BackConfirmationModal() {
  const {
    isBackConfirmationModalOpen,
    closeBackConfirmationModal,
    backConfirmationCallback,
    isCancellingOrder,
  } = useStore();

  const callbackRef = useRef(backConfirmationCallback);
  
  useEffect(() => {
    callbackRef.current = backConfirmationCallback;
  }, [backConfirmationCallback]);

  useEffect(() => {
    if (isBackConfirmationModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isBackConfirmationModalOpen]);

  const handleConfirm = () => {
    if (isCancellingOrder) {
      return; // Prevent action while cancelling
    }
    logger.debug("[BackConfirmationModal] Confirm clicked, executing callback");
    const callback = callbackRef.current;
    if (callback) {
      callback();
    }
    // Don't close modal here - it will be closed after cancellation completes
  };

  const handleCancel = () => {
    if (isCancellingOrder) {
      return; // Prevent closing while cancelling
    }
    closeBackConfirmationModal();
  };

  if (typeof document === 'undefined' || !isBackConfirmationModalOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative z-10 bg-white rounded-[2.25rem] p-24 max-w-4xl w-full mx-8 text-center">
        <h2 className="text-6xl font-bold mb-12 text-gray-900">
          Подтверждение возврата
        </h2>
        <p className="text-3xl text-gray-600 mb-16">
          Вы действительно хотите вернуться назад? Внесенные средства будут утрачены.
        </p>
        
        {isCancellingOrder ? (
          <div className="flex flex-col items-center justify-center gap-6">
            <Spin size="xl" />
            <p className="text-2xl text-gray-600">
              Отмена заказа...
            </p>
          </div>
        ) : (
          <div className="flex justify-center gap-12">
            <button
              className="px-18 py-9 rounded-3xl text-white font-bold text-3xl transition-all duration-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#0B68E1" }}
              onClick={handleCancel}
              disabled={isCancellingOrder}
            >
              Отмена
            </button>
            <button
              className="px-18 py-9 rounded-3xl text-gray-600 font-bold text-3xl transition-all duration-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleConfirm}
              disabled={isCancellingOrder}
            >
              Да
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}