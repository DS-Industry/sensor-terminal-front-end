import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import useStore from '../state/store';

export function BackConfirmationModal() {
  const { t } = useTranslation();
  const {
    isBackConfirmationModalOpen,
    closeBackConfirmationModal,
    backConfirmationCallback,
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
    if (backConfirmationCallback) {
      backConfirmationCallback();
    }
    closeBackConfirmationModal();
  };

  const handleCancel = () => {
    closeBackConfirmationModal();
  };

  if (typeof document === 'undefined' || !isBackConfirmationModalOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative z-10 bg-white rounded-[2.25rem] p-24 max-w-4xl w-full mx-8 text-center">
        <h2 className="text-6xl font-bold mb-12 text-gray-900">
          {t("Подтверждение возврата")}
        </h2>
        <p className="text-3xl text-gray-600 mb-16">
          {t("Вы действительно хотите вернуться назад? Внесенные средства будут утрачены.")}
        </p>
        <div className="flex justify-center gap-12">
          <button
            className="px-18 py-9 rounded-3xl text-white font-bold text-3xl transition-all duration-300 hover:opacity-90"
            style={{ backgroundColor: "#0B68E1" }}
            onClick={handleCancel}
          >
            {t("Отмена")}
          </button>
          <button
            className="px-18 py-9 rounded-3xl text-gray-600 font-bold text-3xl transition-all duration-300 hover:bg-gray-100"
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