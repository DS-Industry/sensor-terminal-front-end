import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@gravity-ui/uikit';
import {ArrowShapeTurnUpLeft} from '@gravity-ui/icons';
import useStore from '../state/store';

export function BackConfirmationModal() {
  const {
    isBackConfirmationModalOpen,
    closeBackConfirmationModal,
    backConfirmationCallback,
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
    if (backConfirmationCallback) {
      backConfirmationCallback();
    }
    closeBackConfirmationModal();
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    closeBackConfirmationModal();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeBackConfirmationModal();
    }
  };

  if (typeof document === 'undefined' || !isBackConfirmationModalOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div 
        className="relative z-10 bg-white rounded-[2.25rem] p-24 max-w-4xl w-full mx-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[40px] font-bold mb-12 text-gray-900">
          Подтверждение возврата
        </h2>
        
        <div className="flex items-start justify-between mb-16 gap-8">
          <div className="flex-1">
            <p className="text-[25px] text-gray-900 mb-4">
              Вы действительно хотите вернуться назад?
            </p>
            <p className="text-[25px] text-gray-900">
              Внесённые средства будут утрачены!
            </p>
          </div>
        </div>
        
        <div className="flex justify-center gap-12">
          <button
            className="rounded-3xl text-white font-bold text-[20px] transition-all duration-300 hover:opacity-90 flex items-center gap-3 w-[400px] h-[58px] justify-center"
            style={{ backgroundColor: "#0B68E1" }}
            onClick={handleConfirm}
          >
            <Icon data={ArrowShapeTurnUpLeft} size={24} className="text-white" />
            Да, вернуться
          </button>
          <button
            className="rounded-3xl text-gray-900 font-bold text-[20px] transition-all duration-300 hover:bg-gray-100 border-2 border-gray-300 w-[400px] h-[58px] justify-center"
            onClick={handleCancel}
          >
            Отменить
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}