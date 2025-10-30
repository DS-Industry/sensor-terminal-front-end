import { useEffect } from 'react';
import { Modal } from "@gravity-ui/uikit";
import { createPortal } from 'react-dom';
import useStore from '../state/store';
import Loyalty from '../../assets/loyalty.png';
import LoyaltyCard from '../../assets/loyalty-card.png';
import { useTranslation } from 'react-i18next';

interface LoyaltyCardModalProps {
  onSkipLoyalty: () => void;
}

export function LoyaltyCardModal({ onSkipLoyalty }: LoyaltyCardModalProps) {
  const { 
    isLoyaltyCardModalOpen, 
  } = useStore();
  const { t } = useTranslation();

  useEffect(() => {
    if (isLoyaltyCardModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isLoyaltyCardModalOpen]);

  const handleSkipLoyalty = () => {
    console.log("[LoyaltyCardModal] Пользователь нажал 'Продолжить без карты'");
    onSkipLoyalty();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <Modal
      open={isLoyaltyCardModalOpen}
      className="backdrop-blur-md"
    >
      <div className="bg-white rounded-3xl p-42 mx-auto max-w-4xl w-full my-10 shadow-2xl">
        <div className="text-gray-900 font-bold text-4xl text-center mb-20">
          {t("Приложите карту лояльности")}
        </div>

        <div className="relative flex justify-center items-center mb-20">
          <div className="">
            <img
              src={Loyalty}
              alt="Терминал"
              className="w-80 h-80 object-contain drop-shadow-2xl"
            />
          </div>

          <div className="absolute w-[348px] h-[348px] z-20 left-1/3 top-[300px] transform -translate-y-1/2 ml-20">
            <img
              src={LoyaltyCard}
              alt="Карта лояльности"
              className="object-contain"
            />
          </div>
        </div>

        <div className="text-center">
          <button
            className="px-8 py-4 rounded-3xl text-white font-semibold text-medium transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-lg" 
            onClick={handleSkipLoyalty}
            style={{ backgroundColor: "#0B68E1" }}
          >
            Продолжить без карты
          </button>
        </div>
      </div>
    </Modal>,
    document.body
  );
}