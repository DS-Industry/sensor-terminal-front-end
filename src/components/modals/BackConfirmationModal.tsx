import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import useStore from '../state/store';

export function BackConfirmationModal() {
  const { t } = useTranslation();
  const { 
    isBackConfirmationModalOpen, 
    closeBackConfirmationModal,
  } = useStore();

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
    closeBackConfirmationModal();
  };

  const handleCancel = () => {
    closeBackConfirmationModal();
  };

  if (typeof document === 'undefined' || !isBackConfirmationModalOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative z-10 bg-white rounded-3xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          {t("Подтверждение возврата")}
        </h2>
        <p className="text-gray-600 mb-6">
          {t("Вы действительно хотите вернуться назад? Внесенные средства будут утрачены.")}
        </p>
        <div className="flex justify-end gap-4">
          <button
            className="px-6 py-3 rounded-2xl text-gray-600 font-medium transition-all duration-300 hover:bg-gray-100"
            onClick={handleCancel}
          >
            {t("Отмена")}
          </button>
          <button
            className="px-6 py-3 rounded-2xl text-white font-medium transition-all duration-300 hover:opacity-90"
            style={{ backgroundColor: "#0B68E1" }}
            onClick={handleConfirm}
          >
            {t("Да")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}